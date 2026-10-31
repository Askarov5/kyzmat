-- KYZMAT step 1: company, members, clients, addresses, localities, note phrases.
-- Apply this only to a dedicated KYZMAT database.
-- Do not run it on the existing Usta project.

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
grant usage on schema private to authenticated;

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'Asia/Bishkek',
  focus text not null default 'both' check (focus in ('both', 'sales', 'service')),
  created_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'agent')),
  locale text not null default 'ky' check (locale in ('ky', 'ru')),
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table public.localities (
  id uuid primary key default gen_random_uuid(),
  name_ky text not null,
  name_ru text not null,
  unique (name_ky, name_ru)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  display_name text not null,
  phone_e164 text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  constraint clients_name_not_blank check (length(btrim(display_name)) > 0)
);

create unique index clients_phone_active_unique
  on public.clients (tenant_id, phone_e164)
  where phone_e164 is not null and archived_at is null;

create index clients_tenant_name_idx
  on public.clients (tenant_id, display_name);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  line text not null,
  locality_id uuid not null references public.localities (id),
  created_at timestamptz not null default now(),
  constraint addresses_line_not_blank check (length(btrim(line)) > 0)
);

create index addresses_client_idx on public.addresses (client_id);

create table public.note_phrases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  body text not null,
  use_count integer not null default 0 check (use_count >= 0),
  created_at timestamptz not null default now(),
  unique (tenant_id, body),
  constraint note_phrases_body_not_blank check (length(btrim(body)) > 0)
);

create table public.client_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  author_id uuid not null references auth.users (id),
  phrase_id uuid references public.note_phrases (id),
  body text not null,
  created_at timestamptz not null default now(),
  constraint client_notes_body_not_blank check (length(btrim(body)) > 0)
);

create index client_notes_client_idx on public.client_notes (client_id, created_at desc);

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
  );
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

  insert into public.tenants (name, timezone)
  values (
    trimmed,
    coalesce(nullif(btrim(tz), ''), 'Asia/Bishkek')
  )
  returning id into tid;

  insert into public.members (tenant_id, user_id, role, locale)
  values (tid, auth.uid(), 'owner', 'ky');

  return tid;
end;
$$;

create or replace function private.set_locale(next_locale text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if next_locale not in ('ky', 'ru') then
    raise exception 'unsupported locale';
  end if;

  update public.members
  set locale = next_locale
  where user_id = auth.uid();

  if not found then
    raise exception 'not a member';
  end if;
end;
$$;

create or replace function private.archive_client(client_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  tid uuid;
begin
  select tenant_id into tid
  from public.clients
  where id = client_id;

  if tid is null then
    raise exception 'not found';
  end if;

  if not exists (
    select 1
    from public.members
    where user_id = auth.uid()
      and tenant_id = tid
      and role = 'owner'
  ) then
    raise exception 'owner only';
  end if;

  update public.clients
  set archived_at = now()
  where id = client_id
    and archived_at is null;
end;
$$;

create or replace function public.create_company(company_name text, tz text)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.create_company(company_name, tz);
$$;

create or replace function public.set_locale(next_locale text)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.set_locale(next_locale);
$$;

create or replace function public.archive_client(client_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.archive_client(client_id);
$$;

revoke all on function private.is_member(uuid) from public, anon;
revoke all on function private.create_company(text, text) from public, anon;
revoke all on function private.set_locale(text) from public, anon;
revoke all on function private.archive_client(uuid) from public, anon;
grant execute on function private.is_member(uuid) to authenticated;
grant execute on function private.create_company(text, text) to authenticated;
grant execute on function private.set_locale(text) to authenticated;
grant execute on function private.archive_client(uuid) to authenticated;

revoke all on function public.create_company(text, text) from public, anon;
revoke all on function public.set_locale(text) from public, anon;
revoke all on function public.archive_client(uuid) from public, anon;
grant execute on function public.create_company(text, text) to authenticated;
grant execute on function public.set_locale(text) to authenticated;
grant execute on function public.archive_client(uuid) to authenticated;

alter table public.tenants enable row level security;
alter table public.members enable row level security;
alter table public.localities enable row level security;
alter table public.clients enable row level security;
alter table public.addresses enable row level security;
alter table public.note_phrases enable row level security;
alter table public.client_notes enable row level security;

create policy tenants_select on public.tenants
for select to authenticated
using (private.is_member(id));

create policy members_select on public.members
for select to authenticated
using (private.is_member(tenant_id));

create policy localities_select on public.localities
for select to authenticated
using (true);

create policy clients_select on public.clients
for select to authenticated
using (private.is_member(tenant_id));

create policy clients_insert on public.clients
for insert to authenticated
with check (private.is_member(tenant_id));

create policy addresses_select on public.addresses
for select to authenticated
using (private.is_member(tenant_id));

create policy addresses_insert on public.addresses
for insert to authenticated
with check (private.is_member(tenant_id));

create policy addresses_delete on public.addresses
for delete to authenticated
using (private.is_member(tenant_id));

create policy note_phrases_select on public.note_phrases
for select to authenticated
using (private.is_member(tenant_id));

create policy note_phrases_insert on public.note_phrases
for insert to authenticated
with check (private.is_member(tenant_id));

create policy note_phrases_update on public.note_phrases
for update to authenticated
using (private.is_member(tenant_id))
with check (private.is_member(tenant_id));

create policy client_notes_select on public.client_notes
for select to authenticated
using (private.is_member(tenant_id));

create policy client_notes_insert on public.client_notes
for insert to authenticated
with check (private.is_member(tenant_id));

revoke all on table public.tenants from anon, public;
revoke all on table public.members from anon, public;
revoke all on table public.localities from anon, public;
revoke all on table public.clients from anon, public;
revoke all on table public.addresses from anon, public;
revoke all on table public.note_phrases from anon, public;
revoke all on table public.client_notes from anon, public;

grant select on public.tenants to authenticated;
grant select on public.members to authenticated;
grant select on public.localities to authenticated;
grant select, insert on public.clients to authenticated;
grant select, insert, delete on public.addresses to authenticated;
grant select, insert, update on public.note_phrases to authenticated;
grant select, insert on public.client_notes to authenticated;
