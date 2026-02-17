import { supabase } from "./supabase.js";
import { registrarVista, registrarHistorial } from "./metrics.js";
import { getUser } from "./auth.js";

const params = new URLSearchParams(window.location.search);
const songId = params.get("id");

export async function cargarCancion() {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("id", songId)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  document.getElementById("titulo").textContent = data.titulo;
  document.getElementById("artista").textContent = data.artista;
  document.getElementById("cover").src = data.thumbnail_url;

  const audio = document.getElementById("audio");
  audio.src = data.audio_url;
  audio.play();

  // métricas
  registrarVista(songId);

  const user = await getUser();
  if (user) registrarHistorial(user.id, songId);
}

cargarCancion();
