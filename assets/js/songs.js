import { supabase } from "./supabase.js";

const contenedor = document.getElementById("listaMusica");

export async function cargarCanciones() {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    contenedor.innerHTML = `
      <div class="text-center text-danger">
        Error cargando canciones
      </div>`;
    return;
  }

  contenedor.innerHTML = "";

  data.forEach(song => {
    contenedor.innerHTML += `
      <div class="col-6 col-md-4">
        <a href="play.html?id=${song.id}" class="song-card">
          <div class="thumbnail-container">
            <img src="${song.thumbnail_url}">
            <span class="genre-badge">${song.genero || ""}</span>
          </div>
          <div class="p-2">
            <div class="fw-bold text-truncate small">${song.titulo}</div>
            <div class="text-secondary" style="font-size: 0.7rem;">
              ${song.artista}
            </div>
          </div>
        </a>
      </div>
    `;
  });
}

// AUTO LOAD
cargarCanciones();
