-- GitSpeak — Unique constraint on user_favorites
-- Evita duplicados: mismo usuario no puede favoritar el mismo comando dos veces

alter table user_favorites
  add constraint user_favorites_user_command_unique
  unique (user_id, command_id);
