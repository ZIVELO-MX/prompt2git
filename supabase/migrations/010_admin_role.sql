-- GitSpeak — Add selected_model + role to user_preferences
-- selected_model: preferencia del modelo free elegido por el usuario (plan Pro)
-- role: rol del usuario (user | admin) — admin tiene acceso ilimitado

alter table user_preferences
  add column if not exists selected_model text,
  add column if not exists role text not null default 'user' check (role in ('user', 'admin'));

comment on column user_preferences.selected_model is
  'Clave del modelo free seleccionado por el usuario (ej: big-pickle, llama-3.1-8b, minimax-m2.5)';

comment on column user_preferences.role is
  'Rol del usuario: user (default) o admin (acceso ilimitado)';
