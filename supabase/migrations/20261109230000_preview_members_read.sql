-- Skip-auth preview can list sample members on the company screen.

create policy members_preview_select on public.members
for select to anon, authenticated
using (private.is_preview_tenant(tenant_id));

grant select on public.members to anon;
