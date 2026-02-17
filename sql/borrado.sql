-- =========================
-- DESACTIVAR RLS Y BORRAR POLÍTICAS
-- =========================

do $$ 
declare
  r record;
begin
  for r in (
    select schemaname, tablename
    from pg_tables
    where schemaname = 'public'
  ) loop
    execute format('alter table public.%I disable row level security;', r.tablename);
  end loop;
end $$;

-- =========================
-- BORRAR TRIGGERS
-- =========================

drop trigger if exists on_auth_user_created on auth.users;

-- =========================
-- BORRAR FUNCIONES
-- =========================

drop function if exists public.handle_new_user();
drop function if exists get_most_played_songs(int);
drop function if exists get_user_favorite_artists(uuid, int);

-- =========================
-- BORRAR TABLAS (ORDEN CORRECTO POR FK)
-- =========================

drop table if exists playlist_songs cascade;
drop table if exists playlists cascade;
drop table if exists views cascade;
drop table if exists likes cascade;
drop table if exists history cascade;
drop table if exists favorites cascade;
drop table if exists songs cascade;
drop table if exists videos cascade;
drop table if exists artists cascade;
drop table if exists profiles cascade;

-- =========================
-- BORRAR ÍNDICES (POR SI ACASO)
-- =========================

drop index if exists idx_songs_artist;
drop index if exists idx_songs_genero;
drop index if exists idx_songs_created;

drop index if exists idx_favorites_user;
drop index if exists idx_favorites_song;

drop index if exists idx_likes_user;
drop index if exists idx_likes_song;

drop index if exists idx_history_user;
drop index if exists idx_history_played;

drop index if exists idx_views_song;
drop index if exists idx_views_date;

drop index if exists idx_playlists_user;
drop index if exists idx_playlist_songs_playlist;

-- =========================
-- OPCIONAL: BORRAR EXTENSIÓN
-- =========================
-- (Solo si NO la usas en nada más)
-- drop extension if exists "pgcrypto";

-- =========================
-- LISTO: BASE DE DATOS LIMPIA
-- =========================
