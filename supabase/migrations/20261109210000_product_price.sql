-- Required catalog price in whole soms.

alter table public.products
  add column if not exists price_som integer;

update public.products
set price_som = 1
where price_som is null;

alter table public.products
  alter column price_som set not null;

alter table public.products
  drop constraint if exists products_price_som_positive;

alter table public.products
  add constraint products_price_som_positive
  check (price_som >= 1 and price_som <= 100000000);
