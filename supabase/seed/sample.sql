-- Sample shop for KYZMAT_SKIP_AUTH preview tenant Сынак.
-- Idempotent. Apply after company/products/orders/booking migrations.
-- Tenant id must stay 00000000-0000-4000-8000-000000000001.

insert into public.localities (name_ky, name_ru)
values
  ('Бишкек', 'Бишкек'),
  ('Ленин', 'Ленинский'),
  ('Октябрь', 'Октябрьский'),
  ('Аламүдүн', 'Аламудун'),
  ('Сокулук', 'Сокулук'),
  ('Ош', 'Ош')
on conflict (name_ky, name_ru) do nothing;

insert into public.tenants (id, name, timezone, focus, invite_code)
values (
  '00000000-0000-4000-8000-000000000001',
  'Сынак',
  'Asia/Bishkek',
  'both',
  'СЫНАК1'
)
on conflict (id) do update
set
  name = excluded.name,
  timezone = excluded.timezone,
  focus = excluded.focus,
  invite_code = coalesce(public.tenants.invite_code, excluded.invite_code);

insert into public.products (
  id, tenant_id, name, description, sku, unit, maintenance_days, reorder_days, active
)
values
  (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000001',
    'Фильтр 10"',
    'Үй үчүн негизги фильтр',
    'F10',
    'шт',
    180,
    30,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000001',
    'Картридж',
    'Алмаштырылуучу картридж',
    'CAR1',
    'шт',
    90,
    14,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    '00000000-0000-4000-8000-000000000001',
    'Насос',
    'Чакан насос',
    'PMP',
    'шт',
    365,
    90,
    true
  )
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  sku = excluded.sku,
  unit = excluded.unit,
  maintenance_days = excluded.maintenance_days,
  reorder_days = excluded.reorder_days,
  active = excluded.active;

update public.stock_balances
set qty = case product_id
  when '00000000-0000-4000-8000-000000000101' then 24
  when '00000000-0000-4000-8000-000000000102' then 40
  when '00000000-0000-4000-8000-000000000103' then 6
  else qty
end
where tenant_id = '00000000-0000-4000-8000-000000000001'
  and product_id in (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000103'
  );

insert into public.clients (id, tenant_id, display_name, phone_e164)
values
  (
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000001',
    'Айбек Токтосунов',
    '+996700111222'
  ),
  (
    '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000001',
    'Гүлмира Садыкова',
    '+996555333444'
  ),
  (
    '00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000001',
    'Орто мектеп №12',
    null
  )
on conflict (id) do update
set
  display_name = excluded.display_name,
  phone_e164 = excluded.phone_e164,
  archived_at = null;

insert into public.addresses (id, tenant_id, client_id, line, locality_id)
select
  v.id,
  '00000000-0000-4000-8000-000000000001',
  v.client_id,
  v.line,
  l.id
from (
  values
    (
      '00000000-0000-4000-8000-000000000301'::uuid,
      '00000000-0000-4000-8000-000000000201'::uuid,
      'ул. Киевская 45',
      'Ленин',
      'Ленинский'
    ),
    (
      '00000000-0000-4000-8000-000000000302'::uuid,
      '00000000-0000-4000-8000-000000000202'::uuid,
      'мкр. Асанбай 12-3',
      'Октябрь',
      'Октябрьский'
    ),
    (
      '00000000-0000-4000-8000-000000000303'::uuid,
      '00000000-0000-4000-8000-000000000203'::uuid,
      'с. Лебединовка, мектеп',
      'Аламүдүн',
      'Аламудун'
    )
) as v(id, client_id, line, name_ky, name_ru)
join public.localities l
  on l.name_ky = v.name_ky
 and l.name_ru = v.name_ru
on conflict (id) do update
set
  line = excluded.line,
  locality_id = excluded.locality_id;

insert into public.note_phrases (id, tenant_id, body, use_count)
values
  (
    '00000000-0000-4000-8000-000000000401',
    '00000000-0000-4000-8000-000000000001',
    'Чалуу керек',
    3
  ),
  (
    '00000000-0000-4000-8000-000000000402',
    '00000000-0000-4000-8000-000000000001',
    'Фильтрди алмаштырдык',
    1
  )
on conflict (id) do update
set body = excluded.body, use_count = excluded.use_count;

insert into public.orders (
  id, tenant_id, client_id, address_id, scheduled_on, status, note
)
values
  (
    '00000000-0000-4000-8000-000000000501',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000301',
    (timezone('Asia/Bishkek', now()))::date + 1,
    'open',
    'Эшикти кагыңыз'
  ),
  (
    '00000000-0000-4000-8000-000000000502',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000302',
    (timezone('Asia/Bishkek', now()))::date + 2,
    'open',
    null
  )
on conflict (id) do update
set
  scheduled_on = excluded.scheduled_on,
  status = excluded.status,
  note = excluded.note;

insert into public.order_lines (id, tenant_id, order_id, product_id, qty)
values
  (
    '00000000-0000-4000-8000-000000000601',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000501',
    '00000000-0000-4000-8000-000000000101',
    2
  ),
  (
    '00000000-0000-4000-8000-000000000602',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000502',
    '00000000-0000-4000-8000-000000000102',
    4
  )
on conflict (id) do update
set product_id = excluded.product_id, qty = excluded.qty;

insert into public.client_service (id, tenant_id, client_id, product_id, next_on)
values
  (
    '00000000-0000-4000-8000-000000000701',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000101',
    (timezone('Asia/Bishkek', now()))::date + 14
  )
on conflict (id) do update
set next_on = excluded.next_on;
