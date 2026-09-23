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
  ('home', 'hero_eyebrow', 'Hola, soy'),
  ('home', 'hero_name', 'KEINER GARCÍA'),
  ('home', 'hero_title', 'Desarrollador y Analista de Software'),
  ('home', 'hero_tagline', 'Creo soluciones digitales modernas mediante desarrollo web, aplicaciones de escritorio, automatización e inteligencia artificial.'),
  ('home', 'services_heading', '¿Qué puedo hacer por ti?'),
  ('home', 'automation_heading', 'Automatiza tu negocio'),
  ('general', 'contact_email', 'TODO'),
  ('general', 'contact_phone', 'TODO')
on conflict (page, key) do nothing;