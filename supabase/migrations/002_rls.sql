-- Prompt2Git — Row Level Security
-- Cada usuario solo puede ver y modificar sus propios datos

-- RLS en provider_keys
alter table provider_keys enable row level security;

create policy "provider_keys: solo el dueño"
  on provider_keys for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- RLS en commands
alter table commands enable row level security;

create policy "commands: solo el dueño"
  on commands for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
