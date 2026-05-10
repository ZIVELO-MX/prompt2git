-- GitSpeak — Beta waitlist
-- Registro de emails para lista de espera, sin crear usuario en auth.users

create table if not exists public.beta_waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  source      text default 'landing',
  lang        text default 'es',
  created_at  timestamptz default now(),
  unique(email)
);

alter table public.beta_waitlist enable row level security;

create policy "anon can insert beta waitlist"
  on public.beta_waitlist for insert
  to anon
  with check (true);
