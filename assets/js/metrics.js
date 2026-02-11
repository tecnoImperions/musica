import { supabase } from "./supabase.js";

// VISTA (PUBLICA)
export async function registrarVista(songId) {
  await supabase.from("views").insert({
    song_id: songId
  });
}

// HISTORIAL (USUARIO)
export async function registrarHistorial(userId, songId) {
  await supabase.from("history").insert({
    user_id: userId,
    song_id: songId
  });
}

// LIKE
export async function toggleLike(userId, songId) {
  const { data } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", userId)
    .eq("song_id", songId)
    .single();

  if (data) {
    await supabase
      .from("likes")
      .delete()
      .eq("id", data.id);
    return false;
  } else {
    await supabase.from("likes").insert({
      user_id: userId,
      song_id: songId
    });
    return true;
  }
}
