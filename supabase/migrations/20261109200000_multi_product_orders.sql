-- Multi-product orders: many lines per order, book/complete ship all lines.

alter table public.order_lines
  drop constraint if exists order_lines_order_id_key;

alter table public.order_lines
  add constraint order_lines_order_product_key unique (order_id, product_id);

drop function if exists public.book_order(uuid, uuid, uuid, integer, date, text);
drop function if exists private.book_order(uuid, uuid, uuid, integer, date, text);

create or replace function private.book_order(
  cid uuid,
  aid uuid,
  lines jsonb,
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
  line_count integer;
  line_rec record;
  seen_ids uuid[] := array[]::uuid[];
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if lines is null or jsonb_typeof(lines) <> 'array' then
    raise exception 'bad lines';
  end if;

  line_count := jsonb_array_length(lines);

  if line_count < 1 or line_count > 50 then
    raise exception 'bad lines';
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

  if note_value is not null and length(note_value) > 500 then
    raise exception 'bad note';
  end if;

  for line_rec in
    select
      (elem->>'product_id')::uuid as product_id,
      (elem->>'qty')::integer as qty
    from jsonb_array_elements(lines) as elem
    order by (elem->>'product_id')::uuid
  loop
    if line_rec.product_id is null then
      raise exception 'not found';
    end if;

    if line_rec.qty is null or line_rec.qty < 1 or line_rec.qty > 100000 then
      raise exception 'bad quantity';
    end if;

    if line_rec.product_id = any (seen_ids) then
      raise exception 'bad lines';
    end if;

    seen_ids := array_append(seen_ids, line_rec.product_id);

    select tenant_id into product_tid
    from public.products
    where id = line_rec.product_id
      and active
      and tenant_id = tid;

    if product_tid is null then
      raise exception 'not found';
    end if;

    select qty into locked_qty
    from public.stock_balances
    where product_id = line_rec.product_id
    for update;

    if locked_qty is null then
      raise exception 'no balance';
    end if;

    held := private.held_qty(line_rec.product_id);
    free_qty := locked_qty - held;

    if line_rec.qty > free_qty then
      raise exception 'insufficient free';
    end if;
  end loop;

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
  select
    tid,
    oid,
    (elem->>'product_id')::uuid,
    (elem->>'qty')::integer
  from jsonb_array_elements(lines) as elem;

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
  locked_qty integer;
  maintenance integer;
  tz text;
  next_day date;
  line_rec record;
  line_count integer;
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

  select count(*)::integer into line_count
  from public.order_lines ol
  where ol.order_id = oid;

  if line_count is null or line_count < 1 then
    raise exception 'no line';
  end if;

  select t.timezone into tz
  from public.tenants t
  where t.id = tid;

  for line_rec in
    select ol.product_id, ol.qty
    from public.order_lines ol
    where ol.order_id = oid
    order by ol.product_id
  loop
    select qty into locked_qty
    from public.stock_balances
    where product_id = line_rec.product_id
    for update;

    if locked_qty is null then
      raise exception 'no balance';
    end if;

    if locked_qty < line_rec.qty then
      raise exception 'insufficient stock';
    end if;

    update public.stock_balances
    set qty = locked_qty - line_rec.qty
    where product_id = line_rec.product_id;

    insert into public.stock_moves (tenant_id, product_id, qty, kind, author_id)
    values (tid, line_rec.product_id, line_rec.qty, 'ship', auth.uid());

    select p.maintenance_days into maintenance
    from public.products p
    where p.id = line_rec.product_id;

    if maintenance is not null then
      next_day := (
        (timezone(tz, now()))::date + maintenance
      );

      insert into public.client_service (tenant_id, client_id, product_id, next_on)
      values (tid, cid, line_rec.product_id, next_day)
      on conflict (client_id, product_id)
      do update set next_on = excluded.next_on;
    end if;
  end loop;

  update public.orders
  set status = 'completed'
  where id = oid;
end;
$$;

create or replace function public.book_order(
  cid uuid,
  aid uuid,
  lines jsonb,
  scheduled date,
  note_text text
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.book_order(cid, aid, lines, scheduled, note_text);
$$;

revoke all on function private.book_order(uuid, uuid, jsonb, date, text) from public, anon;
grant execute on function private.book_order(uuid, uuid, jsonb, date, text) to authenticated;

revoke all on function public.book_order(uuid, uuid, jsonb, date, text) from public, anon;
grant execute on function public.book_order(uuid, uuid, jsonb, date, text) to authenticated;
