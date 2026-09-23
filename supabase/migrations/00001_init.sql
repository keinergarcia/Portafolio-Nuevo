-- ============================================================
-- ElChivalez — Esquema inicial
-- Aplica este archivo en Supabase: SQL Editor > New query > Run
-- ============================================================

-- ------------------------------------------------------------------
-- Utilidades
-- ------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Crea automáticamente el perfil cuando se crea un usuario de auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Verifica (mediante RLS) si el usuario actual es administrador
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- ------------------------------------------------------------------
-- Tablas
-- ------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  photo_url text,
  professional_title text,
  bio text,
  formation jsonb,
  experience jsonb,
  location text,
  email text,
  phone text,
  resume_url text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  icon text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  problem text,
  solution text,
  features jsonb,
  results jsonb,
  category text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  cover_image text,
  github_url text,
  demo_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  url text not null,
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('frontend', 'backend', 'database', 'ia-automatizacion')),
  icon text,
  description text,
  level integer check (level between 0 and 100),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_technologies (
  project_id uuid not null references public.projects(id) on delete cascade,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  primary key (project_id, technology_id)
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  service_type text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  page text not null check (page in ('general', 'home', 'seo', 'projects')),
  key text not null,
  value jsonb,
  updated_at timestamptz not null default now(),
  unique (page, key)
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- Índices
-- ------------------------------------------------------------------
create index if not exists idx_services_category    on public.services (category_id);
create index if not exists idx_services_active      on public.services (is_active, sort_order);
create index if not exists idx_projects_status      on public.projects (status, featured, sort_order);
create index if not exists idx_project_images_proj  on public.project_images (project_id);
create index if not exists idx_technologies_activo  on public.technologies (is_active, sort_order);
create index if not exists idx_messages_status      on public.contact_messages (status, created_at desc);
create index if not exists idx_profiles_public      on public.profiles (role);
create unique index if not exists uq_technologies_name on public.technologies (name);
create unique index if not exists uq_social_links_platform on public.social_links (platform);

-- ------------------------------------------------------------------
-- Triggers de updated_at
-- ------------------------------------------------------------------
drop trigger if exists trg_profiles_updated_at          on public.profiles;
drop trigger if exists trg_categories_updated_at        on public.service_categories;
drop trigger if exists trg_services_updated_at          on public.services;
drop trigger if exists trg_projects_updated_at          on public.projects;
drop trigger if exists trg_technologies_updated_at      on public.technologies;
drop trigger if exists trg_site_settings_updated_at     on public.site_settings;
drop trigger if exists trg_social_links_updated_at      on public.social_links;
drop trigger if exists trg_on_auth_user_created         on auth.users;

create trigger trg_profiles_updated_at      before update on public.profiles          for each row execute function public.handle_updated_at();
create trigger trg_categories_updated_at    before update on public.service_categories for each row execute function public.handle_updated_at();
create trigger trg_services_updated_at      before update on public.services           for each row execute function public.handle_updated_at();
create trigger trg_projects_updated_at      before update on public.projects           for each row execute function public.handle_updated_at();
create trigger trg_technologies_updated_at  before update on public.technologies       for each row execute function public.handle_updated_at();
create trigger trg_site_settings_updated_at before update on public.site_settings      for each row execute function public.handle_updated_at();
create trigger trg_social_links_updated_at  before update on public.social_links       for each row execute function public.handle_updated_at();
create trigger trg_on_auth_user_created     after insert on auth.users                 for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------------
alter table public.profiles             enable row level security;
alter table public.service_categories   enable row level security;
alter table public.services             enable row level security;
alter table public.projects             enable row level security;
alter table public.project_images       enable row level security;
alter table public.technologies         enable row level security;
alter table public.project_technologies enable row level security;
alter table public.contact_messages     enable row level security;
alter table public.site_settings        enable row level security;
alter table public.social_links         enable row level security;

-- Perfil: lectura pública; escritura y rol solo administradores
drop policy if exists "profiles_read_public"       on public.profiles;
drop policy if exists "profiles_admin_all"         on public.profiles;
drop policy if exists "profiles_insert_on_signup"  on public.profiles;
create policy "profiles_read_public"      on public.profiles for select              using (true);
create policy "profiles_insert_on_signup" on public.profiles for insert              with check (true);
create policy "profiles_admin_all"        on public.profiles for all                 using (public.is_admin()) with check (public.is_admin());

-- Contenido público: lectura abierta; administración autenticada
create policy "categories_read_public" on public.service_categories for select using (true);
create policy "categories_admin_all"   on public.service_categories for all using (public.is_admin()) with check (public.is_admin());

create policy "services_read_public" on public.services for select using (true);
create policy "services_admin_all"   on public.services for all using (public.is_admin()) with check (public.is_admin());

-- Proyectos: el público ve solo publicados; el admin gestiona todos
create policy "projects_read_published" on public.projects for select using (status = 'published');
create policy "projects_admin_all"      on public.projects for all using (public.is_admin()) with check (public.is_admin());

create policy "project_images_read_public" on public.project_images for select using (true);
create policy "project_images_admin_all"   on public.project_images for all using (public.is_admin()) with check (public.is_admin());

create policy "technologies_read_public" on public.technologies for select using (true);
create policy "technologies_admin_all"   on public.technologies for all using (public.is_admin()) with check (public.is_admin());

create policy "pt_read_public" on public.project_technologies for select using (true);
create policy "pt_admin_all"   on public.project_technologies for all using (public.is_admin()) with check (public.is_admin());

-- Mensajes: cualquiera puede dejar uno; solo el admin los lee/gestiona
create policy "messages_insert_public" on public.contact_messages for insert with check (true);
create policy "messages_admin_all"     on public.contact_messages for select, update, delete using (public.is_admin());

create policy "settings_read_public" on public.site_settings for select using (true);
create policy "settings_admin_all"   on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

create policy "social_read_public" on public.social_links for select using (true);
create policy "social_admin_all"   on public.social_links for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------------
-- Permisos de rol
-- ------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.profiles, public.service_categories, public.services,
  public.project_images, public.technologies, public.project_technologies,
  public.site_settings, public.social_links to anon;
grant select on public.projects to anon;
grant insert on public.contact_messages to anon;

grant select, insert, update, delete on public.profiles, public.service_categories,
  public.services, public.projects, public.project_images, public.technologies,
  public.project_technologies, public.contact_messages, public.site_settings,
  public.social_links to authenticated;

-- ------------------------------------------------------------------
-- Storage: bucket público para portafolio
-- ------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'])
on conflict (id) do nothing;

drop policy if exists "portfolio_public_read"   on storage.objects;
drop policy if exists "portfolio_admin_insert"  on storage.objects;
drop policy if exists "portfolio_admin_update"  on storage.objects;
drop policy if exists "portfolio_admin_delete"  on storage.objects;

create policy "portfolio_public_read"  on storage.objects for select using (bucket_id = 'portfolio');
create policy "portfolio_admin_insert" on storage.objects for insert with check (bucket_id = 'portfolio' and public.is_admin());
create policy "portfolio_admin_update" on storage.objects for update using (bucket_id = 'portfolio' and public.is_admin());
create policy "portfolio_admin_delete" on storage.objects for delete using (bucket_id = 'portfolio' and public.is_admin());