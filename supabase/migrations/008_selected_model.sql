-- GitSpeak — Add selected_model to user_preferences
-- Almacena la preferencia del modelo free elegido por el usuario (plan Pro)

alter table user_preferences
  add column if not exists selected_model text;

comment on column user_preferences.selected_model is
  'Clave del modelo free seleccionado por el usuario (ej: big-pickle, llama-3.1-8b, minimax-m2.5)';
