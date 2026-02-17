import { supabase } from "./supabase.js";
import { uploadFile } from "./cloudinary.js";

// =====================
// VARIABLES GLOBALES
// =====================

let dbArtists = [];
let dbGenres = [];
let selectedArtistId = null;
let selectedGenresIds = [];
let currentContext = "artist";

// =====================
// CARGAR ARTISTAS + GÉNEROS
// =====================

async function cargarCatalogos() {
  try {
    const { data: artists } = await supabase
      .from("artists")
      .select("id, name")
      .order("name");

    const { data: genres } = await supabase
      .from("genres")
      .select("id, name")
      .order("name");

    dbArtists = artists || [];
    dbGenres = genres || [];

    setupSearch(
      "artistSearch",
      "artistResults",
      dbArtists,
      a => {
        selectedArtistId = a.id;
        document.getElementById("artistSearch").value = a.name;
      }
    );

    setupSearch(
      "genreSearch",
      "genreResults",
      dbGenres,
      g => {
        if (!selectedGenresIds.includes(g.id)) {
          selectedGenresIds.push(g.id);
          renderGenres();
        }
      }
    );

  } catch (err) {
    console.error("Error cargando catálogos:", err);
  }
}

// =====================
// BUSCADOR INTELIGENTE
// =====================

function setupSearch(inputId, resultsId, dataArray, onSelect) {
  const input = document.getElementById(inputId);
  const results = document.getElementById(resultsId);

  input.addEventListener("input", e => {
    const term = e.target.value.toLowerCase();
    results.innerHTML = "";

    if (!term) {
      results.classList.add("d-none");
      return;
    }

    const filtered = dataArray
      .filter(item => item.name.toLowerCase().includes(term))
      .slice(0, 8);

    filtered.forEach(item => {
      const div = document.createElement("div");
      div.className = "result-item";
      div.textContent = item.name;

      div.onclick = () => {
        onSelect(item);
        results.classList.add("d-none");
        input.value = "";
      };

      results.appendChild(div);
    });

    results.classList.toggle("d-none", filtered.length === 0);
  });
}

// =====================
// RENDER GÉNEROS
// =====================

function renderGenres() {
  const container = document.getElementById("selectedGenresList");

  container.innerHTML = selectedGenresIds
    .map(id => {
      const g = dbGenres.find(x => x.id === id);
      return `
        <span class="genre-tag">
          ${g.name}
          <i class="bi bi-x-lg ms-1" style="cursor:pointer"
             onclick="removeGenre('${id}')"></i>
        </span>`;
    })
    .join("");
}

window.removeGenre = id => {
  selectedGenresIds = selectedGenresIds.filter(x => x !== id);
  renderGenres();
};

window.setContext = ctx => {
  currentContext = ctx;
  document.getElementById("panelTitle").textContent =
    ctx === "artist" ? "Nuevo Artista" : "Nuevo Género";
};

// =====================
// GUARDAR NUEVO ARTISTA / GÉNERO
// =====================

document.getElementById("saveNewBtn").onclick = async () => {
  const name = document.getElementById("newName").value.trim();
  if (!name) return;

  const table = currentContext === "artist" ? "artists" : "genres";

  const { data, error } = await supabase
    .from(table)
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    alert(error.message);
    return;
  }

  if (currentContext === "artist") {
    dbArtists.push(data);
    selectedArtistId = data.id;
    document.getElementById("artistSearch").value = data.name;
  } else {
    dbGenres.push(data);
    selectedGenresIds.push(data.id);
    renderGenres();
  }

  bootstrap.Offcanvas.getInstance(
    document.getElementById("panelAdd")
  ).hide();

  document.getElementById("newName").value = "";
};

// =====================
// PUBLICAR CANCIÓN
// =====================

document
  .getElementById("agregarCancion")
  .addEventListener("click", async () => {

    const titulo = document.getElementById("titulo").value.trim();
    const audio = document.getElementById("audio").files[0];
    const video = document.getElementById("video").files[0];
    const cover = document.getElementById("cover").files[0];

    if (!titulo || !selectedArtistId || !audio || !cover) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Título, artista, audio y portada son obligatorios",
        background: "#0a0e17",
        color: "#fff"
      });
      return;
    }

    try {
      Swal.fire({
        title: "Subiendo archivos...",
        text: "Esto puede tardar unos segundos",
        allowOutsideClick: false,
        background: "#0a0e17",
        color: "#fff",
        didOpen: () => Swal.showLoading()
      });

      console.log("Subiendo a Cloudinary...");

      const [audioUrl, coverUrl, videoUrl] = await Promise.all([
        uploadFile(audio),
        uploadFile(cover),
        video ? uploadFile(video) : Promise.resolve(null)
      ]);

      console.log("Insertando en Supabase...");

      const { data: song, error } = await supabase
        .from("songs")
        .insert([{
          titulo,
          artist_id: selectedArtistId,
          audio_url: audioUrl,
          thumbnail_url: coverUrl,
          video_url: videoUrl
        }])
        .select()
        .single();

      if (error) throw error;

      if (selectedGenresIds.length > 0) {
        const links = selectedGenresIds.map(gid => ({
          song_id: song.id,
          genre_id: gid
        }));

        await supabase.from("song_genres").insert(links);
      }

      Swal.fire({
        icon: "success",
        title: "¡Publicado!",
        text: "Tu música ya está disponible",
        background: "#0a0e17",
        color: "#fff"
      }).then(() => location.reload());

    } catch (err) {
      console.error("Error subiendo:", err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
        background: "#0a0e17",
        color: "#fff"
      });
    }
  });

// =====================
// INICIAR
// =====================

cargarCatalogos();
