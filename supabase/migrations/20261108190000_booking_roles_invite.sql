-- KYZMAT step 4: warehouse role, invite code, order lines, holds, and corrections.
-- Apply only to the dedicated KYZMAT database, after company, products, and orders.
-- Do not run it on the Usta project.

alter table public.members
  drop constraint if exists members_role_check;

alter table public.members
  add constraint members_role_check check (role in ('owner', 'agent', 'warehouse'));

alter table public.members
  add column if not exists removed_at timestamptz;

alter table public.tenants
  add column if not exists invite_code text;

create unique index if not exists tenants_invite_code_unique
  on public.tenants (invite_code)
  where invite_code is not null;

create table public.order_lines (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  qty integer not null check (qty >= 1 and qty <= 100000),
  created_at timestamptz not null default now(),
  unique (order_id)
);

create index order_lines_product_idx on public.order_lines (product_id);
create index order_lines_tenant_idx on public.order_lines (tenant_id, product_id);

create table public.client_service (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  product_id uuid not null references public.products (id),
  next_on date not null,
  created_at timestamptz not null default now(),
  unique (client_id, product_id)
);

create index client_service_client_idx on public.client_service (client_id, next_on);

create or replace function private.is_member(tid uuid)
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
      and removed_at is null
  );
$$;

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
      and removed_at is null
  );
$$;

create or replace function private.is_warehouse_staff(tid uuid)
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
      and role in ('owner', 'warehouse')
      and removed_at is null
  );
$$;

create or replace function private.can_book(tid uuid)
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
      and role in ('owner', 'agent')
      and removed_at is null
  );
$$;

create or replace function private.held_qty(pid uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(ol.qty), 0)::integer
  from public.order_lines ol
  join public.orders o on o.id = ol.order_id
  where ol.product_id = pid
    and o.status in ('open', 'in_delivery');
$$;

create or replace function private.new_invite_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
begin
  for i in 1..8 loop
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
  end loop;
  return result;
end;
$$;

create or replace function private.create_company(company_name text, tz text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  tid uuid;
  trimmed text := nullif(btrim(company_name), '');
  code text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if trimmed is null then
    raise exception 'company name required';
  end if;

  if exists (
    select 1 from public.members where user_id = auth.uid()
  ) then
    raise exception 'already a member';
  end if;

  loop
    code := private.new_invite_code();
    exit when not exists (
      select 1 from public.tenants where invite_code = code
    );
  end loop;

  insert into public.tenants (name, timezone, invite_code)
  values (
    trimmed,
    coalesce(nullif(btrim(tz), ''), 'Asia/Bishkek'),
    code
  )
  returning id into tid;

  insert into public.members (tenant_id, user_id, role, locale)
  values (tid, auth.uid(), 'owner', 'ky');

  return tid;
end;
$$;

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

  if not private.is_warehouse_staff(tid) then
    raise exception 'warehouse only';
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

create or replace function private.correct_stock(pid uuid, new_qty integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  tid uuid;
  locked_qty integer;
  held integer;
  delta integer;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if new_qty is null or new_qty < 0 or new_qty > 100000 then
    raise exception 'bad quantity';
  end if;

  if new_qty <> floor(new_qty)::integer then
    raise exception 'bad quantity';
  end if;

  select tenant_id into tid
  from public.products
  where id = pid
    and active;

  if tid is null then
    raise exception 'not found';
  end if;

  if not private.is_warehouse_staff(tid) then
    raise exception 'warehouse only';
  end if;

  select qty into locked_qty
  from public.stock_balances
  where product_id = pid
  for update;

  if locked_qty is null then
    raise exception 'no balance';
  end if;

  held := private.held_qty(pid);

  if new_qty < held then
    raise exception 'below held';
  end if;

  if new_qty = locked_qty then
    return locked_qty;
  end if;

  delta := abs(new_qty - locked_qty);

  update public.stock_balances
  set qty = new_qty
  where product_id = pid;

  if new_qty > locked_qty then
    insert into public.stock_moves (tenant_id, product_id, qty, kind, author_id)
    values (tid, pid, delta, 'correct_in', auth.uid());
  else
    insert into public.stock_moves (tenant_id, product_id, qty, kind, author_id)
    values (tid, pid, delta, 'correct_out', auth.uid());
  end if;

  return new_qty;
end;
$$;

create or replace function private.book_order(
  cid uuid,
  aid uuid,
  pid uuid,
  amount integer,
  scheduled date,
  note_text text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  tid uuid;
  product_tid uuid;
  locked_qty integer;
  held integer;
  free_qty integer;
  oid uuid;
  note_value text := nullif(btrim(note_text), '');
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if amount is null or amount < 1 or amount > 100000 then
    raise exception 'bad quantity';
  end if;

  select tenant_id into tid
  from public.clients
  where id = cid
    and archived_at is null;

  if tid is null then
    raise exception 'not found';
  end if;

  if not private.can_book(tid) then
    raise exception 'book denied';
  end if;

  if not exists (
    select 1
    from public.addresses
    where id = aid
      and client_id = cid
      and tenant_id = tid
  ) then
    raise exception 'bad address';
  end if;

  select tenant_id into product_tid
  from public.products
  where id = pid
    and active
    and tenant_id = tid;

  if product_tid is null then
    raise exception 'not found';
  end if;

  if note_value is not null and length(note_value) > 500 then
    raise exception 'bad note';
  end if;

  select qty into locked_qty
  from public.stock_balances
  where product_id = pid
  for update;

  if locked_qty is null then
    raise exception 'no balance';
  end if;

  held := private.held_qty(pid);
  free_qty := locked_qty - held;

  if amount > free_qty then
    raise exception 'insufficient free';
  end if;

  insert into public.orders (
    tenant_id,
    client_id,
    address_id,
    scheduled_on,
    note,
    status
  )
  values (tid, cid, aid, scheduled, note_value, 'open')
  returning id into oid;

  insert into public.order_lines (tenant_id, order_id, product_id, qty)
  values (tid, oid, pid, amount);

  return oid;
end;
$$;

create or replace function private.complete_order(oid uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  tid uuid;
  cid uuid;
  status text;
  pid uuid;
  amount integer;
  locked_qty integer;
  maintenance integer;
  tz text;
  next_day date;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select o.tenant_id, o.client_id, o.status
  into tid, cid, status
  from public.orders o
  where o.id = oid
  for update;

  if tid is null then
    raise exception 'not found';
  end if;

  if not private.can_book(tid) then
    raise exception 'book denied';
  end if;

  if status not in ('open', 'in_delivery') then
    raise exception 'bad status';
  end if;

  select ol.product_id, ol.qty
  into pid, amount
  from public.order_lines ol
  where ol.order_id = oid;

  if pid is null then
    raise exception 'no line';
  end if;

  select qty into locked_qty
  from public.stock_balances
  where product_id = pid
  for update;

  if locked_qty is null then
    raise exception 'no balance';
  end if;

  if locked_qty < amount then
    raise exception 'insufficient stock';
  end if;

  update public.orders
  set status = 'completed'
  where id = oid;

  update public.stock_balances
  set qty = locked_qty - amount
  where product_id = pid;

  insert into public.stock_moves (tenant_id, product_id, qty, kind, author_id)
  values (tid, pid, amount, 'ship', auth.uid());

  select p.maintenance_days, t.timezone
  into maintenance, tz
  from public.products p
  join public.tenants t on t.id = p.tenant_id
  where p.id = pid;

  if maintenance is not null then
    next_day := (
      (timezone(tz, now()))::date + maintenance
    );

    insert into public.client_service (tenant_id, client_id, product_id, next_on)
    values (tid, cid, pid, next_day)
    on conflict (client_id, product_id)
    do update set next_on = excluded.next_on;
  end if;
end;
$$;

create or replace function private.cancel_order(oid uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  tid uuid;
  status text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select o.tenant_id, o.status
  into tid, status
  from public.orders o
  where o.id = oid
  for update;

  if tid is null then
    raise exception 'not found';
  end if;

  if not private.can_book(tid) then
    raise exception 'book denied';
  end if;

  if status not in ('open', 'in_delivery') then
    raise exception 'bad status';
  end if;

  update public.orders
  set status = 'cancelled'
  where id = oid;
end;
$$;

create or replace function private.rotate_invite_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  tid uuid;
  code text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select tenant_id into tid
  from public.members
  where user_id = auth.uid()
    and role = 'owner'
    and removed_at is null;

  if tid is null then
    raise exception 'owner only';
  end if;

  loop
    code := private.new_invite_code();
    exit when not exists (
      select 1 from public.tenants where invite_code = code
    );
  end loop;

  update public.tenants
  set invite_code = code
  where id = tid;

  return code;
end;
$$;

create or replace function private.join_company(code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  tid uuid;
  trimmed text := upper(nullif(btrim(code), ''));
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if trimmed is null then
    raise exception 'bad code';
  end if;

  if exists (
    select 1 from public.members where user_id = auth.uid()
  ) then
    raise exception 'already a member';
  end if;

  select id into tid
  from public.tenants
  where invite_code = trimmed;

  if tid is null then
    raise exception 'bad code';
  end if;

  insert into public.members (tenant_id, user_id, role, locale)
  values (tid, auth.uid(), 'agent', 'ky');

  return tid;
end;
$$;

create or replace function private.remove_member(mid uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  tid uuid;
  target_role text;
  target_user uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select tenant_id, role, user_id
  into tid, target_role, target_user
  from public.members
  where id = mid;

  if tid is null then
    raise exception 'not found';
  end if;

  if not private.is_owner(tid) then
    raise exception 'owner only';
  end if;

  if target_user = auth.uid() then
    raise exception 'self';
  end if;

  if target_role = 'owner' then
    raise exception 'owner protected';
  end if;

  update public.members
  set removed_at = now()
  where id = mid
    and removed_at is null;
end;
$$;

create or replace function private.restore_member(mid uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  tid uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select tenant_id into tid
  from public.members
  where id = mid;

  if tid is null then
    raise exception 'not found';
  end if;

  if not private.is_owner(tid) then
    raise exception 'owner only';
  end if;

  update public.members
  set removed_at = null
  where id = mid
    and removed_at is not null;
end;
$$;

create or replace function public.correct_stock(pid uuid, new_qty integer)
returns integer
language sql
security invoker
set search_path = ''
as $$
  select private.correct_stock(pid, new_qty);
$$;

create or replace function public.book_order(
  cid uuid,
  aid uuid,
  pid uuid,
  amount integer,
  scheduled date,
  note_text text
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.book_order(cid, aid, pid, amount, scheduled, note_text);
$$;

create or replace function public.complete_order(oid uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.complete_order(oid);
$$;

create or replace function public.cancel_order(oid uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.cancel_order(oid);
$$;

create or replace function public.rotate_invite_code()
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.rotate_invite_code();
$$;

create or replace function public.join_company(code text)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.join_company(code);
$$;

create or replace function public.remove_member(mid uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.remove_member(mid);
$$;

create or replace function public.restore_member(mid uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.restore_member(mid);
$$;

drop policy if exists members_select on public.members;
create policy members_select on public.members
for select to authenticated
using (user_id = auth.uid() or private.is_member(tenant_id));

alter table public.order_lines enable row level security;
alter table public.client_service enable row level security;

create policy order_lines_select on public.order_lines
for select to authenticated
using (private.is_member(tenant_id));

create policy client_service_select on public.client_service
for select to authenticated
using (private.is_member(tenant_id));

revoke all on function private.is_warehouse_staff(uuid) from public, anon;
revoke all on function private.can_book(uuid) from public, anon;
revoke all on function private.held_qty(uuid) from public, anon;
revoke all on function private.new_invite_code() from public, anon, authenticated;
revoke all on function private.correct_stock(uuid, integer) from public, anon;
revoke all on function private.book_order(uuid, uuid, uuid, integer, date, text) from public, anon;
revoke all on function private.complete_order(uuid) from public, anon;
revoke all on function private.cancel_order(uuid) from public, anon;
revoke all on function private.rotate_invite_code() from public, anon;
revoke all on function private.join_company(text) from public, anon;
revoke all on function private.remove_member(uuid) from public, anon;
revoke all on function private.restore_member(uuid) from public, anon;

grant execute on function private.is_warehouse_staff(uuid) to authenticated;
grant execute on function private.can_book(uuid) to authenticated;
grant execute on function private.held_qty(uuid) to authenticated;
grant execute on function private.correct_stock(uuid, integer) to authenticated;
grant execute on function private.book_order(uuid, uuid, uuid, integer, date, text) to authenticated;
grant execute on function private.complete_order(uuid) to authenticated;
grant execute on function private.cancel_order(uuid) to authenticated;
grant execute on function private.rotate_invite_code() to authenticated;
grant execute on function private.join_company(text) to authenticated;
grant execute on function private.remove_member(uuid) to authenticated;
grant execute on function private.restore_member(uuid) to authenticated;

revoke all on function public.correct_stock(uuid, integer) from public, anon;
revoke all on function public.book_order(uuid, uuid, uuid, integer, date, text) from public, anon;
revoke all on function public.complete_order(uuid) from public, anon;
revoke all on function public.cancel_order(uuid) from public, anon;
revoke all on function public.rotate_invite_code() from public, anon;
revoke all on function public.join_company(text) from public, anon;
revoke all on function public.remove_member(uuid) from public, anon;
revoke all on function public.restore_member(uuid) from public, anon;

grant execute on function public.correct_stock(uuid, integer) to authenticated;
grant execute on function public.book_order(uuid, uuid, uuid, integer, date, text) to authenticated;
grant execute on function public.complete_order(uuid) to authenticated;
grant execute on function public.cancel_order(uuid) to authenticated;
grant execute on function public.rotate_invite_code() to authenticated;
grant execute on function public.join_company(text) to authenticated;
grant execute on function public.remove_member(uuid) to authenticated;
grant execute on function public.restore_member(uuid) to authenticated;

revoke all on table public.order_lines from anon, public;
revoke all on table public.client_service from anon, public;

grant select on public.order_lines to authenticated;
grant select on public.client_service to authenticated;

-- Existing companies get a code once.
do $$
declare
  r record;
  code text;
begin
  for r in
    select id from public.tenants where invite_code is null
  loop
    loop
      code := private.new_invite_code();
      exit when not exists (
        select 1 from public.tenants where invite_code = code
      );
    end loop;
    update public.tenants set invite_code = code where id = r.id;
  end loop;
end;
$$;
