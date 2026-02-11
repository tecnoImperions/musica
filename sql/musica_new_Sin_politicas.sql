-- =========================
-- VARIAN MUSIC DATABASE (SIN POLICIES)
-- =========================

-- Extensiones necesarias
create extension if not exists "pgcrypto";

-- =========================
-- PROFILES
-- =========================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  email text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- =========================
-- ARTISTS
-- =========================
create table if not exists artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- =========================
-- SONGS
-- =========================
create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  artista text not null,
  artist_id uuid references artists(id),
  genero text,
  audio_url text not null,
  video_url text,
  thumbnail_url text,
  duracion_segundos integer,
  created_at timestamptz default now()
);

-- =========================
-- FAVORITES
-- =========================
create table if not exists favorites (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  song_id uuid references songs(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, song_id)
);

-- =========================
-- HISTORY
-- =========================
create table if not exists history (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  song_id uuid references songs(id) on delete cascade,
  played_at timestamptz default now()
);

-- =========================
-- LIKES
-- =========================
create table if not exists likes (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  song_id uuid references songs(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, song_id)
);

-- =========================
-- VIEWS
-- =========================
create table if not exists views (
  id bigint generated always as identity primary key,
  song_id uuid references songs(id) on delete cascade,
  viewed_at timestamptz default now()
);

-- =========================
-- PLAYLISTS
-- =========================
create table if not exists playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  nombre text not null,
  descripcion text,
  cover_url text,
  is_public boolean default false,
  created_at timestamptz default now()
);

-- =========================
-- PLAYLIST SONGS
-- =========================
create table if not exists playlist_songs (
  id bigint generated always as identity primary key,
  playlist_id uuid references playlists(id) on delete cascade,
  song_id uuid references songs(id) on delete cascade,
  position integer,
  added_at timestamptz default now(),
  unique (playlist_id, song_id)
);

-- =========================
-- VIDEOS
-- =========================
create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  artist_id uuid references artists(id),
  video_url text not null,
  thumbnail_url text,
  created_at timestamptz default now()
);

-- =========================
-- INDEXES (opcionales para performance)
-- =========================
create index if not exists idx_songs_artist on songs(artista);
create index if not exists idx_songs_genero on songs(genero);
create index if not exists idx_songs_created on songs(created_at desc);
create index if not exists idx_favorites_user on favorites(user_id);
create index if not exists idx_favorites_song on favorites(song_id);
create index if not exists idx_likes_user on likes(user_id);
create index if not exists idx_likes_song on likes(song_id);
create index if not exists idx_history_user on history(user_id);
create index if not exists idx_history_played on history(played_at desc);
create index if not exists idx_views_song on views(song_id);
create index if not exists idx_views_date on views(viewed_at desc);
create index if not exists idx_playlists_user on playlists(user_id);
create index if not exists idx_playlist_songs_playlist on playlist_songs(playlist_id);
