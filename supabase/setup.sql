-- ============================================================
-- ElChivalez — Instalación completa del backend (UN SOLO PASO)
--
-- Cómo usarlo:
--   1. Abre tu proyecto en https://supabase.com/dashboard
--   2. Menú lateral: SQL Editor > New query
--   3. Pega TODO este archivo y pulsa Run
--   4. Authentication > Users > Add user:
--        email y contraseña de administrador, Auto Confirm User = on
--   5. En SQL Editor ejecuta:
--        update profiles set role = 'admin' where id = '<UUID del usuario>';
--      (el trigger crea el perfil automáticamente al crear el usuario;
--       también puedes filtrar por el email si la columna tiene el valor)
-- ============================================================

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

-- Verifica (mediante RLS) si el usuario actual es administrador.
-- Debe crearse DESPUÉS de las tablas (depende de public.profiles).
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
create policy "messages_admin_select"  on public.contact_messages for select using (public.is_admin());
create policy "messages_admin_update"  on public.contact_messages for update using (public.is_admin()) with check (public.is_admin());
create policy "messages_admin_delete"  on public.contact_messages for delete using (public.is_admin());

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

-- ============================================================
-- FIN DEL ESQUEMA — CONTENIDO INICIAL A CONTINUACIÓN
-- ============================================================

-- ============================================================
-- ElChivalez — Datos semilla (contenido inicial del portafolio)
-- Crea tu usuario administrador en Authentication > Users (Add user)
-- y luego:  update profiles set role = 'admin' where id = '<UUID>'
-- ============================================================

-- --------------------------------------------------------------
-- Categorías de servicios
-- --------------------------------------------------------------
insert into public.service_categories (name, slug, description, icon, sort_order, is_active)
values
  ('Desarrollo Web', 'desarrollo-web', 'Sitios y sistemas web modernos, rápidos y adaptados a cualquier dispositivo.', 'globe', 0, true),
  ('Aplicaciones de Escritorio', 'aplicaciones-de-escritorio', 'Software de escritorio para administrar, automatizar y optimizar la operación de tu negocio.', 'monitor', 1, true),
  ('Automatización e IA', 'automatizacion-e-ia', 'Procesos automatizados e inteligencia artificial para ahorrar tiempo y reducir errores.', 'bot', 2, true),
  ('Soporte y Servicios Informáticos', 'soporte-informatico', 'Instalación, configuración y mantenimiento de sistemas operativos y software.', 'wrench', 3, true)
on conflict (slug) do nothing;

-- --------------------------------------------------------------
-- Servicios
-- --------------------------------------------------------------
insert into public.services (category_id, title, slug, description, icon, is_featured, sort_order, is_active)
select c.id, s.title, s.slug, s.description, s.icon, s.is_featured, s.sort_order, true
from (values
  ('desarrollo-web', 'Landing pages', 'landing-pages', null, null, true, 0),
  ('desarrollo-web', 'Sitios empresariales', 'sitios-empresariales', null, null, false, 1),
  ('desarrollo-web', 'Portafolios', 'portafolios', null, null, false, 2),
  ('desarrollo-web', 'Tiendas online', 'tiendas-online', null, null, false, 3),
  ('desarrollo-web', 'Sistemas web', 'sistemas-web', null, null, false, 4),
  ('desarrollo-web', 'Dashboards', 'dashboards', null, null, false, 5),
  ('desarrollo-web', 'Integración de APIs', 'integracion-de-apis', null, null, false, 6),
  ('desarrollo-web', 'Sistemas personalizados', 'sistemas-personalizados', null, null, false, 7),
  ('aplicaciones-de-escritorio', 'Aplicaciones administrativas', 'aplicaciones-administrativas', null, null, true, 0),
  ('aplicaciones-de-escritorio', 'Sistemas de inventario', 'sistemas-de-inventario', null, null, false, 1),
  ('aplicaciones-de-escritorio', 'Gestión empresarial', 'gestion-empresarial', null, null, false, 2),
  ('aplicaciones-de-escritorio', 'Sistemas de ventas', 'sistemas-de-ventas', null, null, false, 3),
  ('aplicaciones-de-escritorio', 'Herramientas internas', 'herramientas-internas', null, null, false, 4),
  ('aplicaciones-de-escritorio', 'Software personalizado', 'software-personalizado', null, null, false, 5),
  ('automatizacion-e-ia', 'Automatización de procesos', 'automatizacion-de-procesos', null, null, true, 0),
  ('automatizacion-e-ia', 'Integración de APIs', 'integracion-de-apis', null, null, false, 1),
  ('automatizacion-e-ia', 'Automatización mediante n8n', 'automatizacion-n8n', null, null, false, 2),
  ('automatizacion-e-ia', 'Integraciones con WhatsApp', 'integraciones-whatsapp', null, null, false, 3),
  ('automatizacion-e-ia', 'Bots y asistentes inteligentes', 'bots-y-asistentes', null, null, false, 4),
  ('automatizacion-e-ia', 'IA generativa', 'ia-generativa', null, null, false, 5),
  ('automatizacion-e-ia', 'Procesamiento de documentos', 'procesamiento-documentos', null, null, false, 6),
  ('automatizacion-e-ia', 'Automatizaciones empresariales', 'automatizaciones-empresariales', null, null, false, 7),
  ('soporte-informatico', 'Instalación de Windows 11', 'instalacion-windows-11', null, null, false, 0),
  ('soporte-informatico', 'Configuración del sistema', 'configuracion-sistema', null, null, false, 1),
  ('soporte-informatico', 'Instalación de drivers', 'instalacion-drivers', null, null, false, 2),
  ('soporte-informatico', 'Actualizaciones y optimización', 'actualizaciones-optimizacion', null, null, false, 3),
  ('soporte-informatico', 'Configuración de software', 'configuracion-software', null, null, false, 4),
  ('soporte-informatico', 'Mantenimiento de software', 'mantenimiento-software', null, null, false, 5),
  ('soporte-informatico', 'Herramientas de productividad', 'herramientas-productividad', null, null, false, 6),
  ('soporte-informatico', 'Software con licencia legítima', 'software-licencia-legitima', null, null, false, 7),
  ('soporte-informatico', 'Configuración de herramientas PDF', 'configuracion-herramientas-pdf', null, null, false, 8)
) as s(cat_slug, title, slug, description, icon, is_featured, sort_order)
join public.service_categories c on c.slug = s.cat_slug
on conflict (category_id, slug) do nothing;

-- --------------------------------------------------------------
-- Tecnologías
-- --------------------------------------------------------------
insert into public.technologies (name, category, icon, description, level, sort_order, is_active)
values
  ('React', 'frontend', null, null, null, 0, true),
  ('JavaScript', 'frontend', null, null, null, 1, true),
  ('TypeScript', 'frontend', null, null, null, 2, true),
  ('HTML', 'frontend', null, null, null, 3, true),
  ('CSS', 'frontend', null, null, null, 4, true),
  ('Tailwind', 'frontend', null, null, null, 5, true),
  ('Laravel', 'backend', null, null, null, 0, true),
  ('Node.js', 'backend', null, null, null, 1, true),
  ('.NET', 'backend', null, null, null, 2, true),
  ('Java', 'backend', null, null, null, 3, true),
  ('Python', 'backend', null, null, null, 4, true),
  ('PostgreSQL', 'database', null, null, null, 0, true),
  ('MySQL', 'database', null, null, null, 1, true),
  ('SQLite', 'database', null, null, null, 2, true),
  ('Supabase', 'database', null, null, null, 3, true),
  ('IA generativa', 'ia-automatizacion', null, null, null, 0, true),
  ('n8n', 'ia-automatizacion', null, null, null, 1, true),
  ('APIs', 'ia-automatizacion', null, null, null, 2, true),
  ('Automatización', 'ia-automatizacion', null, null, null, 3, true)
on conflict (name) do nothing;

-- --------------------------------------------------------------
-- Enlaces sociales (reemplaza los 'TODO' por tus URLs)
-- --------------------------------------------------------------
insert into public.social_links (platform, url, icon, sort_order, is_active)
values
  ('whatsapp', 'TODO', null, 0, true),
  ('github', 'TODO', null, 1, true),
  ('linkedin', 'TODO', null, 2, true)
on conflict (platform) do nothing;

-- --------------------------------------------------------------
-- Configuración del sitio (textos de la portada)
-- --------------------------------------------------------------
insert into public.site_settings (page, key, value)
values
  ('home', 'hero_eyebrow', to_jsonb('Hola, soy'::text)),
  ('home', 'hero_name', to_jsonb('KEINER GARCÍA'::text)),
  ('home', 'hero_title', to_jsonb('Desarrollador y Analista de Software'::text)),
  ('home', 'hero_tagline', to_jsonb('Creo soluciones digitales modernas mediante desarrollo web, aplicaciones de escritorio, automatización e inteligencia artificial.'::text)),
  ('home', 'services_heading', to_jsonb('¿Qué puedo hacer por ti?'::text)),
  ('home', 'automation_heading', to_jsonb('Automatiza tu negocio'::text)),
  ('general', 'contact_email', to_jsonb('TODO'::text)),
  ('general', 'contact_phone', to_jsonb('TODO'::text))
on conflict (page, key) do nothing;

-- --------------------------------------------------------------
-- Documentos descargables (hoja de vida, títulos, certificados)
-- --------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null default 'other' check (kind in ('cv', 'title', 'certificate', 'other')),
  description text,
  file_url text not null,
  file_path text not null,
  file_size integer,
  mime_type text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  downloads integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "documents_read_public" on public.documents for select using (true);
create policy "documents_admin_all"   on public.documents for all using (public.is_admin()) with check (public.is_admin());

create trigger trg_documents_updated before update on public.documents
  for each row execute function public.handle_updated_at();

-- Contador de descargas: cualquiera puede incrementarlo vía RPC
create or replace function public.increment_document_download(doc_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.documents set downloads = downloads + 1 where id = doc_id;
$$;

grant execute on function public.increment_document_download(uuid) to anon, authenticated;
grant select on public.documents to anon, authenticated;

-- --------------------------------------------------------------
-- Promover el usuario administrador.
-- Sustituye el UUID por el id real de tu usuario (Authentication → Users)
-- o el email por el que uses; el trigger ya crea la fila en profiles.
-- --------------------------------------------------------------
update public.profiles
set role = 'admin', full_name = coalesce(full_name, 'Keiner García')
where id = (select id from auth.users where email = 'elchivalez@gmail.com');