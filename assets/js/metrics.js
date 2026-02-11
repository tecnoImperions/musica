import { supabase } from "./supabase.js";
import { getUser } from "./auth.js";

/**
 * =============================
 * FAVORITOS
 * =============================
 */

/**
 * Agregar canción a favoritos
 */
export async function addToFavorites(songId) {
  const user = await getUser();
  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  const { data, error } = await supabase
    .from("favorites")
    .insert({
      user_id: user.id,
      song_id: songId,
    })
    .select();

  if (error) {
    console.error("Error agregando a favoritos:", error);
    throw error;
  }

  return data;
}

/**
 * Quitar canción de favoritos
 */
export async function removeFromFavorites(songId) {
  const user = await getUser();
  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("song_id", songId);

  if (error) {
    console.error("Error quitando de favoritos:", error);
    throw error;
  }

  return true;
}

/**
 * Verificar si una canción está en favoritos
 */
export async function isFavorite(songId) {
  const user = await getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("song_id", songId)
    .maybeSingle();

  if (error) {
    console.error("Error verificando favorito:", error);
    return false;
  }

  return !!data;
}

/**
 * Obtener todas las canciones favoritas del usuario
 */
export async function getFavorites() {
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      id,
      created_at,
      song_id,
      songs (
        id,
        titulo,
        artista,
        genero,
        audio_url,
        video_url,
        thumbnail_url
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error obteniendo favoritos:", error);
    return [];
  }

  return data.map(item => ({
    ...item.songs,
    favorited_at: item.created_at,
  }));
}

/**
 * =============================
 * LIKES
 * =============================
 */

/**
 * Dar like a una canción
 */
export async function likeSong(songId) {
  const user = await getUser();
  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  const { data, error } = await supabase
    .from("likes")
    .insert({
      user_id: user.id,
      song_id: songId,
    })
    .select();

  if (error) {
    console.error("Error dando like:", error);
    throw error;
  }

  return data;
}

/**
 * Quitar like de una canción
 */
export async function unlikeSong(songId) {
  const user = await getUser();
  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("user_id", user.id)
    .eq("song_id", songId);

  if (error) {
    console.error("Error quitando like:", error);
    throw error;
  }

  return true;
}

/**
 * Verificar si el usuario dio like a una canción
 */
export async function hasLiked(songId) {
  const user = await getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("song_id", songId)
    .maybeSingle();

  if (error) {
    console.error("Error verificando like:", error);
    return false;
  }

  return !!data;
}

/**
 * Obtener canciones con like del usuario
 */
export async function getLikedSongs() {
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("likes")
    .select(`
      id,
      created_at,
      song_id,
      songs (
        id,
        titulo,
        artista,
        genero,
        audio_url,
        video_url,
        thumbnail_url
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error obteniendo likes:", error);
    return [];
  }

  return data.map(item => ({
    ...item.songs,
    liked_at: item.created_at,
  }));
}

/**
 * =============================
 * HISTORIAL
 * =============================
 */

/**
 * Registrar reproducción en historial
 */
export async function addToHistory(songId) {
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("history")
    .insert({
      user_id: user.id,
      song_id: songId,
    })
    .select();

  if (error) {
    console.error("Error agregando al historial:", error);
    return null;
  }

  return data;
}

/**
 * Obtener historial de reproducción
 */
export async function getHistory(limit = 50) {
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("history")
    .select(`
      id,
      played_at,
      song_id,
      songs (
        id,
        titulo,
        artista,
        genero,
        audio_url,
        video_url,
        thumbnail_url
      )
    `)
    .eq("user_id", user.id)
    .order("played_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error obteniendo historial:", error);
    return [];
  }

  return data.map(item => ({
    ...item.songs,
    played_at: item.played_at,
  }));
}

/**
 * Limpiar historial
 */
export async function clearHistory() {
  const user = await getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("history")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    console.error("Error limpiando historial:", error);
    return false;
  }

  return true;
}

/**
 * =============================
 * VISTAS (MÉTRICAS PÚBLICAS)
 * =============================
 */

/**
 * Registrar vista de una canción
 */
export async function registerView(songId) {
  const { data, error } = await supabase
    .from("views")
    .insert({
      song_id: songId,
    })
    .select();

  if (error) {
    console.error("Error registrando vista:", error);
    return null;
  }

  return data;
}

/**
 * Obtener número de vistas de una canción
 */
export async function getSongViews(songId) {
  const { count, error } = await supabase
    .from("views")
    .select("*", { count: "exact", head: true })
    .eq("song_id", songId);

  if (error) {
    console.error("Error obteniendo vistas:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Obtener canciones más escuchadas
 */
export async function getMostPlayed(limit = 10) {
  const { data, error } = await supabase
    .from("views")
    .select(`
      song_id,
      songs (
        id,
        titulo,
        artista,
        genero,
        audio_url,
        video_url,
        thumbnail_url
      )
    `)
    .order("viewed_at", { ascending: false });

  if (error) {
    console.error("Error obteniendo más reproducidas:", error);
    return [];
  }

  // Contar vistas por canción
  const songCounts = {};
  data.forEach(item => {
    const songId = item.song_id;
    if (!songCounts[songId]) {
      songCounts[songId] = {
        song: item.songs,
        count: 0,
      };
    }
    songCounts[songId].count++;
  });

  // Ordenar y limitar
  return Object.values(songCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(item => ({
      ...item.song,
      play_count: item.count,
    }));
}

/**
 * =============================
 * PLAYLISTS
 * =============================
 */

/**
 * Crear nueva playlist
 */
export async function createPlaylist(nombre) {
  const user = await getUser();
  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  const { data, error } = await supabase
    .from("playlists")
    .insert({
      user_id: user.id,
      nombre,
    })
    .select();

  if (error) {
    console.error("Error creando playlist:", error);
    throw error;
  }

  return data[0];
}

/**
 * Obtener playlists del usuario
 */
export async function getUserPlaylists() {
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("playlists")
    .select(`
      id,
      nombre,
      created_at,
      playlist_songs (count)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error obteniendo playlists:", error);
    return [];
  }

  return data;
}

/**
 * Agregar canción a playlist
 */
export async function addSongToPlaylist(playlistId, songId) {
  const { data, error } = await supabase
    .from("playlist_songs")
    .insert({
      playlist_id: playlistId,
      song_id: songId,
    })
    .select();

  if (error) {
    console.error("Error agregando canción a playlist:", error);
    throw error;
  }

  return data;
}

/**
 * Quitar canción de playlist
 */
export async function removeSongFromPlaylist(playlistId, songId) {
  const { error } = await supabase
    .from("playlist_songs")
    .delete()
    .eq("playlist_id", playlistId)
    .eq("song_id", songId);

  if (error) {
    console.error("Error quitando canción de playlist:", error);
    throw error;
  }

  return true;
}

/**
 * Obtener canciones de una playlist
 */
export async function getPlaylistSongs(playlistId) {
  const { data, error } = await supabase
    .from("playlist_songs")
    .select(`
      id,
      song_id,
      songs (
        id,
        titulo,
        artista,
        genero,
        audio_url,
        video_url,
        thumbnail_url
      )
    `)
    .eq("playlist_id", playlistId);

  if (error) {
    console.error("Error obteniendo canciones de playlist:", error);
    return [];
  }

  return data.map(item => item.songs);
}

/**
 * Eliminar playlist
 */
export async function deletePlaylist(playlistId) {
  const { error } = await supabase
    .from("playlists")
    .delete()
    .eq("id", playlistId);

  if (error) {
    console.error("Error eliminando playlist:", error);
    throw error;
  }

  return true;
}

/**
 * =============================
 * ESTADÍSTICAS
 * =============================
 */

/**
 * Obtener estadísticas del usuario
 */
export async function getUserStats() {
  const user = await getUser();
  if (!user) return null;

  const [favorites, likes, history, playlists] = await Promise.all([
    supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("likes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("history").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("playlists").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  return {
    favorites: favorites.count || 0,
    likes: likes.count || 0,
    history: history.count || 0,
    playlists: playlists.count || 0,
  };
}