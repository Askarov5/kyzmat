-- KYZMAT step 2: products and the warehouse balance.
-- Apply this only to a dedicated KYZMAT database, after the company migration.
-- Do not run it on the existing Usta project.

create or replace function private.is_owner(tid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.members
    where user_id = auth.uid()
      and tenant_id = tid
      and role = 'owner'
  );
$$;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  description text,
  sku text,
  unit text,
  maintenance_days integer,
  reorder_days integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint products_name_not_blank check (length(btrim(name)) > 0),
  constraint products_sku_len check (sku is null or length(btrim(sku)) between 1 and 40),
  constraint products_unit_len check (unit is null or length(btrim(unit)) between 1 and 40),
  constraint products_maintenance_days check (
    maintenance_days is null or maintenance_days in (14, 30, 90, 180, 365)
  ),
  constraint products_reorder_days check (
    reorder_days is null or reorder_days in (14, 30, 90, 180, 365)
  )
);

create index products_tenant_name_idx
  on public.products (tenant_id, name);

create table public.stock_balances (
  product_id uuid primary key references public.products (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  qty integer not null default 0 check (qty >= 0)
);

create table public.stock_moves (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  qty integer not null check (qty > 0),
  kind text not null check (kind in ('receive', 'ship', 'correct_in', 'correct_out')),
  reason text,
  author_id uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create index stock_moves_product_idx
  on public.stock_moves (product_id, created_at desc);

create or replace function private.ensure_product_balance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.stock_balances (product_id, tenant_id, qty)
  values (new.id, new.tenant_id, 0);
  return new;
end;
$$;

create trigger products_balance
after insert on public.products
for each row
execute function private.ensure_product_balance();

create or replace function private.receive_stock(pid uuid, amount integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  tid uuid;
  next_qty integer;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if amount is null or amount < 1 or amount > 100000 then
    raise exception 'bad quantity';
  end if;

  select tenant_id into tid
  from public.products
  where id = pid
    and active;

  if tid is null then
    raise exception 'not found';
  end if;

  if not private.is_owner(tid) then
    raise exception 'owner only';
  end if;

  select qty into next_qty
  from public.stock_balances
  where product_id = pid
  for update;

  if next_qty is null then
    raise exception 'no balance';
  end if;

  next_qty := next_qty + amount;

  update public.stock_balances
  set qty = next_qty
  where product_id = pid;

  insert into public.stock_moves (tenant_id, product_id, qty, kind, author_id)
  values (tid, pid, amount, 'receive', auth.uid());

  return next_qty;
end;
$$;

create or replace function public.receive_stock(pid uuid, amount integer)
returns integer
language sql
security invoker
set search_path = ''
as $$
  select private.receive_stock(pid, amount);
$$;

revoke all on function private.is_owner(uuid) from public, anon;
revoke all on function private.ensure_product_balance() from public, anon, authenticated;
revoke all on function private.receive_stock(uuid, integer) from public, anon;
revoke all on function public.receive_stock(uuid, integer) from public, anon;

grant execute on function private.is_owner(uuid) to authenticated;
grant execute on function private.receive_stock(uuid, integer) to authenticated;
grant execute on function public.receive_stock(uuid, integer) to authenticated;

alter table public.products enable row level security;
alter table public.stock_balances enable row level security;
alter table public.stock_moves enable row level security;

create policy products_select on public.products
for select to authenticated
using (private.is_member(tenant_id));

create policy products_insert on public.products
for insert to authenticated
with check (private.is_owner(tenant_id));

create policy stock_balances_select on public.stock_balances
for select to authenticated
using (private.is_member(tenant_id));

create policy stock_moves_select on public.stock_moves
for select to authenticated
using (private.is_member(tenant_id));

revoke all on table public.products from anon, public;
revoke all on table public.stock_balances from anon, public;
revoke all on table public.stock_moves from anon, public;

grant select, insert on public.products to authenticated;
grant select on public.stock_balances to authenticated;
grant select on public.stock_moves to authenticated;
