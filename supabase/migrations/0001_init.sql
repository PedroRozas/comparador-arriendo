-- =============================================================================
-- Comparador de arriendos · Migración inicial
-- Tablas + RLS + Storage privado + allowlist opcional
-- Ejecutar completo en el SQL Editor de Supabase (o via supabase db push)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tablas
-- ---------------------------------------------------------------------------

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  alias text not null,
  status text not null check (status in ('current', 'candidate')),
  listing_url text not null,
  address text,
  photo_path text,
  monthly_rent integer not null check (monthly_rent > 0),
  has_brokerage boolean not null default false,
  brokerage_amount integer check (brokerage_amount >= 0),
  deposit_months numeric not null default 1 check (deposit_months >= 0),
  exit_penalty integer not null default 0 check (exit_penalty >= 0),
  floors integer check (floors >= 1),
  kitchen_type text check (kitchen_type in ('american', 'closed')),
  kitchen_area numeric check (kitchen_area >= 0),
  living_dining_area numeric check (living_dining_area >= 0),
  has_laundry boolean not null default false,
  has_patio boolean not null default false,
  patio_surface text check (patio_surface in ('dirt', 'grass', 'concrete', 'deck')),
  patio_covered boolean not null default false,
  patio_area numeric check (patio_area >= 0),
  has_quincho boolean not null default false,
  in_condo boolean not null default false,
  has_guards boolean not null default false,
  has_thermopane boolean not null default false,
  master_walkin_closet boolean not null default false,
  notes text
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  name text not null,
  area numeric check (area >= 0),
  has_closet boolean not null default false,
  is_master boolean not null default false
);

create table public.bathrooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  name text,
  type text not null check (type in ('tub', 'shower')),
  area numeric check (area >= 0)
);

create index properties_user_id_idx on public.properties (user_id);
create index rooms_property_id_idx on public.rooms (property_id);
create index bathrooms_property_id_idx on public.bathrooms (property_id);

-- ---------------------------------------------------------------------------
-- 2. Row Level Security (políticas explícitas por operación)
-- ---------------------------------------------------------------------------

alter table public.properties enable row level security;
alter table public.rooms enable row level security;
alter table public.bathrooms enable row level security;

create policy "properties_select_own"
  on public.properties for select
  to authenticated
  using (auth.uid() = user_id);

create policy "properties_insert_own"
  on public.properties for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "properties_update_own"
  on public.properties for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "properties_delete_own"
  on public.properties for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "rooms_select_own"
  on public.rooms for select
  to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

create policy "rooms_insert_own"
  on public.rooms for insert
  to authenticated
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

create policy "rooms_update_own"
  on public.rooms for update
  to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

create policy "rooms_delete_own"
  on public.rooms for delete
  to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

create policy "bathrooms_select_own"
  on public.bathrooms for select
  to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

create policy "bathrooms_insert_own"
  on public.bathrooms for insert
  to authenticated
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

create policy "bathrooms_update_own"
  on public.bathrooms for update
  to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

create policy "bathrooms_delete_own"
  on public.bathrooms for delete
  to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 3. Storage: bucket privado para fotos
--    Cada usuario solo accede a archivos bajo su carpeta: {auth.uid()}/...
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', false)
on conflict (id) do nothing;

create policy "property_photos_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'property-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "property_photos_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "property_photos_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'property-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'property-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "property_photos_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'property-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- 4. OPCIONAL · Allowlist de correos para signup
--    Restringe el registro solo a los correos listados en public.allowed_emails.
--    ACTIVAR: descomenta este bloque completo y agrega tu correo al insert.
--    DESACTIVAR: ejecuta
--      drop trigger if exists enforce_email_allowlist_trigger on auth.users;
-- ---------------------------------------------------------------------------

-- create table public.allowed_emails (
--   email text primary key
-- );
--
-- alter table public.allowed_emails enable row level security;
--
-- create or replace function public.enforce_email_allowlist()
-- returns trigger
-- language plpgsql
-- security definer
-- set search_path = public
-- as $$
-- begin
--   if not exists (
--     select 1 from public.allowed_emails
--     where lower(email) = lower(new.email)
--   ) then
--     raise exception 'signup_not_allowed';
--   end if;
--   return new;
-- end;
-- $$;
--
-- create trigger enforce_email_allowlist_trigger
--   before insert on auth.users
--   for each row execute function public.enforce_email_allowlist();
--
-- insert into public.allowed_emails (email)
-- values ('tu-correo@ejemplo.com');
