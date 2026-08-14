-- Inspira Church · 001 · Extensiones y tipos enumerados
-- Tipos fijos del dominio (no van a cambiar con frecuencia). Los valores que sí
-- podrían crecer sin una migración (p. ej. "tipo de grupo") se dejan como texto
-- libre validado en la aplicación, no como enum — ver 006_growth_groups.sql.

create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'editor');

create type public.team_member_type as enum ('pastor', 'lider');

create type public.event_status as enum ('proximo', 'finalizado', 'cancelado');

create type public.schedule_type as enum ('servicio', 'reunion', 'grupo', 'actividad');

create type public.contact_reason as enum (
  'visitar',
  'grupo',
  'oracion',
  'informacion',
  'servir',
  'otro'
);

-- Estado de seguimiento compartido por contactos, solicitudes de grupo y
-- peticiones de oración: mismo flujo de trabajo en las tres bandejas del admin.
create type public.form_status as enum (
  'nueva',
  'contactada',
  'en_seguimiento',
  'finalizada'
);
