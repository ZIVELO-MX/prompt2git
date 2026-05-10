-- GitSpeak — User favorites
-- Subconjunto de comandos marcados como favoritos por el usuario

create table if not exists user_favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  command_id  uuid,                    -- nullable: referencia opcional a commands.id
  input       text not null,
  command     text not null,
  explanation jsonb not null,
  provider    text not null,
  model       text not null,
  created_at  timestamptz not null default now()
);

create index if not exists user_favorites_user_idx
  on user_favorites (user_id, created_at desc);

alter table user_favorites enable row level security;

create policy "user_favorites: solo el dueño"
  on user_favorites for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
