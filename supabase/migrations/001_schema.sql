-- Prompt2Git — Schema inicial
-- Ejecutar en Supabase SQL Editor o via: supabase db push

-- Tabla de API keys por proveedor
-- La clave real se cifra con Supabase Vault antes de insertar
create table if not exists provider_keys (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  provider    text not null check (provider in ('anthropic', 'openai', 'gemini')),
  model       text not null,
  vault_id    uuid not null,           -- referencia al secreto en Supabase Vault
  created_at  timestamptz not null default now(),
  unique (user_id, provider)
);

-- Tabla de comandos generados
create table if not exists commands (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  input       text not null,
  command     text not null,
  explanation jsonb not null,
  flags       jsonb not null default '[]',
  provider    text not null check (provider in ('anthropic', 'openai', 'gemini')),
  model       text not null,
  created_at  timestamptz not null default now()
);

-- Índice para paginación del historial
create index if not exists commands_user_created_at_idx
  on commands (user_id, created_at desc);
