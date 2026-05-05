-- Prompt2Git — pgvector + caché semántico
-- Habilita búsqueda por similitud de embeddings para cachear comandos generados

-- 1. Activar pgvector
create extension if not exists vector with schema public;

-- 2. Columna de embedding en commands (1536 = text-embedding-3-small)
alter table commands
  add column if not exists embedding vector(1536);

-- 3. Índice IVFFlat para búsqueda por similitud coseno
create index if not exists commands_embedding_idx
  on commands using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 4. Función de búsqueda por similitud semántica
create or replace function match_commands(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  query_user_id uuid
) returns table (
  id uuid,
  input text,
  command text,
  explanation jsonb,
  flags jsonb,
  provider text,
  model text,
  created_at timestamptz,
  similarity float
) language plpgsql as $$
begin
  return query
  select
    commands.id,
    commands.input,
    commands.command,
    commands.explanation,
    commands.flags,
    commands.provider,
    commands.model,
    commands.created_at,
    1 - (commands.embedding <=> query_embedding) as similarity
  from commands
  where commands.user_id = query_user_id
    and commands.embedding is not null
    and 1 - (commands.embedding <=> query_embedding) > match_threshold
  order by commands.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 5. Fix constraints de provider para incluir los 6 proveedores
alter table provider_keys
  drop constraint if exists provider_keys_provider_check;

alter table provider_keys
  add constraint provider_keys_provider_check
  check (provider in ('anthropic', 'openai', 'gemini', 'groq', 'mistral', 'openrouter'));

alter table commands
  drop constraint if exists commands_provider_check;

alter table commands
  add constraint commands_provider_check
  check (provider in ('anthropic', 'openai', 'gemini', 'groq', 'mistral', 'openrouter'));
