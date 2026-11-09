-- Orders: one client, one address, a date, a note, and a status.
-- Apply this only to the dedicated KYZMAT database, after the company and product migrations.
-- Do not run it on the Usta project.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id uuid not null references public.clients (id),
  address_id uuid not null references public.addresses (id),
  scheduled_on date,
  status text not null default 'open' check (status in ('open', 'in_delivery', 'completed', 'cancelled')),
  note text,
  created_at timestamptz not null default now(),
  constraint orders_note_length check (note is null or length(note) <= 500)
);

create index orders_tenant_created_idx on public.orders (tenant_id, created_at desc);

alter table public.orders enable row level security;

create policy orders_select on public.orders
for select to authenticated
using (private.is_member(tenant_id));

create policy orders_insert on public.orders
for insert to authenticated
with check (
  private.is_member(tenant_id)
  and exists (
    select 1
    from public.addresses
    where addresses.id = address_id
      and addresses.client_id = client_id
      and addresses.tenant_id = tenant_id
  )
);

grant select, insert on public.orders to authenticated;
