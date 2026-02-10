-- =========================
-- EXTENSIONES NECESARIAS
-- =========================
create extension if not exists "pgcrypto";

-- =========================
-- PROFILES (USUARIOS)
-- =========================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
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
-- SONGS (CANCIONES)
-- =========================
create table songs (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  artista text not null,
  genero text,
  audio_url text not null,
  thumbnail_url text,
  created_at timestamptz default now()
);

alter table songs enable row level security;

create policy "Public read songs"
on songs for select
using (true);

-- =========================
-- FAVORITES
-- =========================
create table favorites (
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
create table history (
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
create table likes (
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
create table views (
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
-- TRIGGER: AUTO PROFILE
-- =========================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
