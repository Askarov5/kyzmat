-- Zoom-style join: meeting ID = tenant id, passcode = invite_code.

drop function if exists public.join_company(text);
drop function if exists private.join_company(text);

create or replace function private.join_company(tid uuid, pass text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  found_id uuid;
  expected text;
  trimmed text := upper(nullif(btrim(pass), ''));
  member_phone text := private.auth_user_phone();
  member_name text := private.auth_user_display_name();
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if tid is null or trimmed is null then
    raise exception 'bad code';
  end if;

  if exists (
    select 1 from public.members where user_id = auth.uid()
  ) then
    raise exception 'already a member';
  end if;

  select id, invite_code
  into found_id, expected
  from public.tenants
  where id = tid;

  if found_id is null or expected is null or expected <> trimmed then
    raise exception 'bad code';
  end if;

  insert into public.members (
    tenant_id,
    user_id,
    role,
    locale,
    display_name,
    phone_e164
  )
  values (
    found_id,
    auth.uid(),
    'agent',
    'ky',
    member_name,
    member_phone
  );

  return found_id;
end;
$$;

create or replace function public.join_company(tid uuid, pass text)
returns uuid
language sql
set search_path = ''
as $$
  select private.join_company(tid, pass);
$$;

revoke all on function private.join_company(uuid, text) from public, anon;
revoke all on function public.join_company(uuid, text) from public, anon;
grant execute on function private.join_company(uuid, text) to authenticated;
grant execute on function public.join_company(uuid, text) to authenticated;
