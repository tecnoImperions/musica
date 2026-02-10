-- =========================
-- ARTISTS (ARTISTAS)
-- =========================
create table artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  created_at timestamptz default now()
);

alter table artists enable row level security;

create policy "Public read artists"
on artists for select
using (true);

-- =========================
-- SONGS: relación con artista
-- =========================
alter table songs
add column artist_id uuid references artists(id);

-- =========================
-- VIDEOS MUSICALES
-- =========================
create table videos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  artist_id uuid references artists(id),
  video_url text not null,
  thumbnail_url text,
  created_at timestamptz default now()
);

alter table videos enable row level security;

create policy "Public read videos"
on videos for select
using (true);

-- =========================
-- PLAYLISTS DEL USUARIO
-- =========================
create table playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  nombre text not null,
  created_at timestamptz default now()
);

alter table playlists enable row level security;

create policy "User manage playlists"
on playlists for all
using (auth.uid() = user_id);

-- =========================
-- PLAYLIST SONGS
-- =========================
create table playlist_songs (
  id bigint generated always as identity primary key,
  playlist_id uuid references playlists(id) on delete cascade,
  song_id uuid references songs(id) on delete cascade,
  unique (playlist_id, song_id)
);

alter table playlist_songs enable row level security;

create policy "User manage playlist songs"
on playlist_songs for all
using (
  auth.uid() = (
    select user_id from playlists
    where playlists.id = playlist_songs.playlist_id
  )
);
