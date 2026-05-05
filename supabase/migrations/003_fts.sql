-- GitSpeak — Full-Text Search en historial de comandos
-- Busca sobre input (español) y command (inglés/git)

alter table commands
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('spanish', coalesce(input, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(command, '')), 'B')
  ) stored;

create index if not exists commands_search_idx
  on commands using gin (search_vector);
