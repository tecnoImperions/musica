import { supabase } from "./supabase.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const { data: song } = await supabase
  .from("songs")
  .select("*")
  .eq("id", id)
  .single();

document.getElementById("titulo").textContent = song.titulo;
document.getElementById("artista").textContent = song.artista;
document.getElementById("cover").src =
  song.thumbnail_url || "https://via.placeholder.com/400";

const audio = document.getElementById("audio");
audio.src = song.audio_url;

// registrar vista pública
await supabase.from("views").insert({ song_id: id });
