-- =========================
-- VARIAN MUSIC DATABASE
-- Complete schema with all tables and policies
-- =========================

-- Enable necessary extensions
create extension if not exists "pgcrypto";

-- =========================
-- PROFILES (USUARIOS)
-- =========================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  email text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Public read profiles"
on profiles for select
using (true);

create policy "User update own profile"
on profiles for update
using (auth.uid() = id);

-- =========================
-- ARTISTS (ARTISTAS)
-- =========================
create table if not exists artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

alter table artists enable row level security;

create policy "Public read artists"
on artists for select
using (true);

create policy "Admin manage artists"
on artists for all
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.is_admin = true
  )
);

-- =========================
-- SONGS (CANCIONES)
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

alter table songs enable row level security;

create policy "Public read songs"
on songs for select
using (true);

create policy "Admin manage songs"
on songs for all
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.is_admin = true
  )
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

alter table favorites enable row level security;

create policy "User manage favorites"
on favorites for all
using (auth.uid() = user_id);

-- =========================
-- HISTORY (REPRODUCCIONES)
-- =========================
create table if not exists history (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  song_id uuid references songs(id) on delete cascade,
  played_at timestamptz default now()
);

alter table history enable row level security;

create policy "User manage history"
on history for all
using (auth.uid() = user_id);

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

alter table likes enable row level security;

create policy "User manage likes"
on likes for all
using (auth.uid() = user_id);

-- =========================
-- VIEWS (PUBLICAS)
-- =========================
create table if not exists views (
  id bigint generated always as identity primary key,
  song_id uuid references songs(id) on delete cascade,
  viewed_at timestamptz default now()
);

alter table views enable row level security;

create policy "Public insert views"
on views for insert
with check (true);

create policy "Public read views"
on views for select
using (true);

-- =========================
-- PLAYLISTS DEL USUARIO
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

alter table playlists enable row level security;

create policy "User manage playlists"
on playlists for all
using (auth.uid() = user_id);

create policy "Public read public playlists"
on playlists for select
using (is_public = true);

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

alter table playlist_songs enable row level security;

create policy "User manage playlist songs"
on playlist_songs for all
using (
  auth.uid() = (
    select user_id from playlists
    where playlists.id = playlist_songs.playlist_id
  )
);

create policy "Public read public playlist songs"
on playlist_songs for select
using (
  exists (
    select 1 from playlists
    where playlists.id = playlist_songs.playlist_id
    and playlists.is_public = true
  )
);

-- =========================
-- VIDEOS MUSICALES
-- =========================
create table if not exists videos (
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

create policy "Admin manage videos"
on videos for all
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.is_admin = true
  )
);

-- =========================
-- TRIGGER: AUTO PROFILE
-- =========================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- =========================
-- INDEXES FOR PERFORMANCE
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

-- =========================
-- FUNCTIONS FOR STATS
-- =========================

-- Get most played songs
create or replace function get_most_played_songs(limit_count int default 10)
returns table (
  song_id uuid,
  titulo text,
  artista text,
  thumbnail_url text,
  play_count bigint
) as $$
begin
  return query
  select 
    s.id,
    s.titulo,
    s.artista,
    s.thumbnail_url,
    count(v.id) as play_count
  from songs s
  left join views v on v.song_id = s.id
  group by s.id
  order by play_count desc
  limit limit_count;
end;
$$ language plpgsql;

-- Get user's favorite artists
create or replace function get_user_favorite_artists(user_uuid uuid, limit_count int default 10)
returns table (
  artista text,
  song_count bigint
) as $$
begin
  return query
  select 
    s.artista,
    count(*) as song_count
  from favorites f
  join songs s on s.id = f.song_id
  where f.user_id = user_uuid
  group by s.artista
  order by song_count desc
  limit limit_count;
end;
$$ language plpgsql;

-- =========================
-- SAMPLE DATA (OPTIONAL)
-- =========================

-- Insert a sample admin user (update with your user ID after registration)
-- update profiles set is_admin = true where email = 'tu_email@ejemplo.com';

-- Sample song insert
-- insert into songs (titulo, artista, genero, audio_url, thumbnail_url)
-- values (
--   'Mi Canción de Prueba',
--   'Artista Ejemplo',
--   'Pop',
--   'https://res.cloudinary.com/YOUR_CLOUD/video/upload/v1234567890/audio/song.mp3',
--   'https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1234567890/thumbnails/cover.jpg'
-- );

-- =========================
-- COMPLETED
-- =========================
-- Run this script in your Supabase SQL Editor
-- Then update the auth.js and metrics.js files in your project