-- =============================================================================
-- Migración 2 · Dimensiones (largo × ancho) y ajustes de casa actual
-- - Las superficies se registran como largo × ancho; el área se calcula en cliente
-- - listing_url pasa a ser opcional (obligatoria solo para candidatas)
-- - Nuevo flag: living y comedor separados
-- Ejecutar DESPUÉS de 0001_init.sql
-- =============================================================================

alter table public.properties alter column listing_url drop not null;

alter table public.properties
  add constraint properties_candidate_requires_listing_url
  check (status <> 'candidate' or listing_url is not null);

alter table public.properties
  add column kitchen_length numeric check (kitchen_length > 0),
  add column kitchen_width numeric check (kitchen_width > 0),
  add column living_dining_length numeric check (living_dining_length > 0),
  add column living_dining_width numeric check (living_dining_width > 0),
  add column living_dining_separated boolean not null default false,
  add column patio_length numeric check (patio_length > 0),
  add column patio_width numeric check (patio_width > 0);

alter table public.properties
  drop column kitchen_area,
  drop column living_dining_area,
  drop column patio_area;

alter table public.rooms
  add column length numeric check (length > 0),
  add column width numeric check (width > 0);

alter table public.rooms drop column area;

alter table public.bathrooms
  add column length numeric check (length > 0),
  add column width numeric check (width > 0);

alter table public.bathrooms drop column area;
