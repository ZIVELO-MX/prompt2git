-- GitSpeak — Add 'zen' to all provider check constraints
-- El nuevo provider 'zen' (OpenCode Zen) no estaba incluido en los CHECK constraints

-- provider_keys
alter table provider_keys
  drop constraint if exists provider_keys_provider_check;

alter table provider_keys
  add constraint provider_keys_provider_check
  check (provider in ('anthropic', 'openai', 'gemini', 'groq', 'mistral', 'openrouter', 'zen'));

-- commands
alter table commands
  drop constraint if exists commands_provider_check;

alter table commands
  add constraint commands_provider_check
  check (provider in ('anthropic', 'openai', 'gemini', 'groq', 'mistral', 'openrouter', 'zen'));

-- user_preferences
alter table user_preferences
  drop constraint if exists user_preferences_provider_check;

alter table user_preferences
  add constraint user_preferences_provider_check
  check (provider in ('anthropic', 'openai', 'gemini', 'groq', 'mistral', 'openrouter', 'zen'));
