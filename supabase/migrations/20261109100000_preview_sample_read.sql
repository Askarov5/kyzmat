-- Read-only access to the fixed skip-auth preview tenant for local demos.
-- Real shops keep membership RLS. Do not reuse this UUID for production shops.

create or replace function private.is_preview_tenant(tid uuid)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select tid = '00000000-0000-4000-8000-000000000001'::uuid;
$$;

revoke all on function private.is_preview_tenant(uuid) from public;
grant execute on function private.is_preview_tenant(uuid) to anon, authenticated;

create policy tenants_preview_select on public.tenants
for select to anon, authenticated
using (private.is_preview_tenant(id));

create policy clients_preview_select on public.clients
for select to anon, authenticated
using (private.is_preview_tenant(tenant_id));

create policy addresses_preview_select on public.addresses
for select to anon, authenticated
using (private.is_preview_tenant(tenant_id));

create policy note_phrases_preview_select on public.note_phrases
for select to anon, authenticated
using (private.is_preview_tenant(tenant_id));

create policy products_preview_select on public.products
for select to anon, authenticated
using (private.is_preview_tenant(tenant_id));

create policy stock_balances_preview_select on public.stock_balances
for select to anon, authenticated
using (private.is_preview_tenant(tenant_id));

create policy orders_preview_select on public.orders
for select to anon, authenticated
using (private.is_preview_tenant(tenant_id));

create policy order_lines_preview_select on public.order_lines
for select to anon, authenticated
using (private.is_preview_tenant(tenant_id));

create policy client_service_preview_select on public.client_service
for select to anon, authenticated
using (private.is_preview_tenant(tenant_id));

create policy localities_preview_select on public.localities
for select to anon
using (true);

grant select on public.tenants to anon;
grant select on public.clients to anon;
grant select on public.addresses to anon;
grant select on public.note_phrases to anon;
grant select on public.products to anon;
grant select on public.stock_balances to anon;
grant select on public.orders to anon;
grant select on public.order_lines to anon;
grant select on public.client_service to anon;
grant select on public.localities to anon;
