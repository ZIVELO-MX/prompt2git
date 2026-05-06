-- GitSpeak — GitHub connections
-- Guarda el token de acceso de GitHub en Vault para consultas read-only
-- El provider_token viene de la sesión Supabase post GitHub OAuth

create table if not exists github_connections (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references auth.users(id) on delete cascade,
  vault_id     uuid not null,
  username     text not null,
  connected_at timestamptz not null default now()
);

alter table github_connections enable row level security;

create policy "github_connections: solo el dueño"
  on github_connections for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
