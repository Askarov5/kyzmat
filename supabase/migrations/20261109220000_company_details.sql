-- Company details for owners: phone, address, locality; member identity; role change.

alter table public.tenants
  add column if not exists phone_e164 text;

alter table public.tenants
  add column if not exists address_line text;

alter table public.tenants
  add column if not exists locality_id uuid references public.localities (id);

alter table public.tenants
  drop constraint if exists tenants_phone_e164_format;

alter table public.tenants
  add constraint tenants_phone_e164_format
  check (phone_e164 is null or phone_e164 ~ '^\+996[0-9]{9}$');

alter table public.tenants
  drop constraint if exists tenants_address_line_not_blank;

alter table public.tenants
  add constraint tenants_address_line_not_blank
  check (address_line is null or length(btrim(address_line)) > 0);

alter table public.tenants
  drop constraint if exists tenants_address_locality_pair;

alter table public.tenants
  add constraint tenants_address_locality_pair
  check (
    (address_line is null and locality_id is null)
    or (address_line is not null and locality_id is not null)
  );

alter table public.members
  add column if not exists display_name text;

alter table public.members
  add column if not exists phone_e164 text;

alter table public.members
  drop constraint if exists members_phone_e164_format;

alter table public.members
  add constraint members_phone_e164_format
  check (phone_e164 is null or phone_e164 ~ '^\+[1-9][0-9]{7,14}$');

create or replace function private.auth_user_phone()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select nullif(u.phone, '')
  from auth.users u
  where u.id = auth.uid();
$$;

create or replace function private.auth_user_display_name()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select nullif(
    btrim(
      coalesce(
        u.raw_user_meta_data ->> 'full_name',
        u.raw_user_meta_data ->> 'name',
        u.email
      )
    ),
    ''
  )
  from auth.users u
  where u.id = auth.uid();
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
  member_phone text := private.auth_user_phone();
  member_name text := private.auth_user_display_name();
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

  insert into public.members (
    tenant_id,
    user_id,
    role,
    locale,
    display_name,
    phone_e164
  )
  values (
    tid,
    auth.uid(),
    'owner',
    'ky',
    member_name,
    member_phone
  );

  return tid;
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
  member_phone text := private.auth_user_phone();
  member_name text := private.auth_user_display_name();
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

  insert into public.members (
    tenant_id,
    user_id,
    role,
    locale,
    display_name,
    phone_e164
  )
  values (
    tid,
    auth.uid(),
    'agent',
    'ky',
    member_name,
    member_phone
  );

  return tid;
end;
$$;

create or replace function private.update_company(
  company_name text,
  phone text,
  addr_line text,
  loc_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  tid uuid;
  trimmed_name text := nullif(btrim(company_name), '');
  trimmed_phone text := nullif(btrim(phone), '');
  trimmed_line text := nullif(btrim(addr_line), '');
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

  if trimmed_name is null then
    raise exception 'company name required';
  end if;

  if trimmed_phone is not null and trimmed_phone !~ '^\+996[0-9]{9}$' then
    raise exception 'bad phone';
  end if;

  if (trimmed_line is null) <> (loc_id is null) then
    raise exception 'bad address';
  end if;

  if loc_id is not null and not exists (
    select 1 from public.localities where id = loc_id
  ) then
    raise exception 'bad locality';
  end if;

  update public.tenants
  set
    name = trimmed_name,
    phone_e164 = trimmed_phone,
    address_line = trimmed_line,
    locality_id = loc_id
  where id = tid;
end;
$$;

create or replace function private.set_member_role(mid uuid, next_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  tid uuid;
  target_role text;
  target_tenant uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if next_role is null or next_role not in ('agent', 'warehouse') then
    raise exception 'bad role';
  end if;

  select tenant_id into tid
  from public.members
  where user_id = auth.uid()
    and role = 'owner'
    and removed_at is null;

  if tid is null then
    raise exception 'owner only';
  end if;

  select role, tenant_id
  into target_role, target_tenant
  from public.members
  where id = mid;

  if target_tenant is null or target_tenant <> tid then
    raise exception 'not found';
  end if;

  if target_role = 'owner' then
    raise exception 'owner only';
  end if;

  update public.members
  set role = next_role
  where id = mid;
end;
$$;

create or replace function public.update_company(
  company_name text,
  phone text,
  addr_line text,
  loc_id uuid
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.update_company(company_name, phone, addr_line, loc_id);
$$;

create or replace function public.set_member_role(mid uuid, next_role text)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.set_member_role(mid, next_role);
$$;

revoke all on function private.auth_user_phone() from public, anon, authenticated;
revoke all on function private.auth_user_display_name() from public, anon, authenticated;
revoke all on function private.update_company(text, text, text, uuid) from public, anon;
revoke all on function private.set_member_role(uuid, text) from public, anon;
revoke all on function public.update_company(text, text, text, uuid) from public, anon;
revoke all on function public.set_member_role(uuid, text) from public, anon;

grant execute on function private.update_company(text, text, text, uuid) to authenticated;
grant execute on function private.set_member_role(uuid, text) to authenticated;
grant execute on function public.update_company(text, text, text, uuid) to authenticated;
grant execute on function public.set_member_role(uuid, text) to authenticated;
