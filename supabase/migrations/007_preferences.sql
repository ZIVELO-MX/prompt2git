-- GitSpeak — User preferences
-- Configuración persistente del usuario, con fallback a localStorage

create table if not exists user_preferences (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references auth.users(id) on delete cascade,
  lang         text not null default 'es' check (lang in ('es', 'en')),
  show_sidebar boolean not null default true,
  edu_mode     boolean not null default false,
  provider     text check (provider in ('anthropic', 'openai', 'gemini', 'groq', 'mistral', 'openrouter')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists user_preferences_user_idx on user_preferences (user_id);

alter table user_preferences enable row level security;

create policy "user_preferences: solo el dueño"
  on user_preferences for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
