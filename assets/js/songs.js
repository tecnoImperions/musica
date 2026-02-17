import { supabase } from "./supabase.js";

const contenedor = document.getElementById("listaMusica");
const buscador = document.getElementById("search");
const resultsCount = document.getElementById("resultsCount");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const filters = document.getElementById("filters");

let canciones = [];
let filteredSongs = [];
let currentFilter = "all";
let searchQuery = "";

/**
 * =========================
 * CARGAR CANCIONES
 * =========================
 */
export async function cargarCanciones() {
  showLoading(true);

  try {
    const { data, error } = await supabase
      .from("songs")
      .select(`
        id,
        titulo,
        audio_url,
        video_url,
        thumbnail_url,
        artists(name),
        song_genres(
          genres(name)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // 🔥 Transformar estructura de géneros
    canciones = (data || []).map(song => ({
      ...song,
      generos:
        song.song_genres
          ?.map(g => g.genres?.name)
          .filter(Boolean) || []
    }));

    filteredSongs = canciones;

    updateResultsCount();
    renderCanciones();
    generarFiltrosGenero();

  } catch (err) {
    console.error("ERROR:", err);
    showError("Error cargando canciones");
  } finally {
    showLoading(false);
  }
}

/**
 * =========================
 * RENDER CANCIONES
 * =========================
 */
function renderCanciones() {
  contenedor.innerHTML = "";

  if (filteredSongs.length === 0) {
    showEmptyState(true);
    return;
  }

  showEmptyState(false);

  filteredSongs.forEach(song => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-3";
    col.innerHTML = createSongCard(song);
    contenedor.appendChild(col);
  });
}

/**
 * =========================
 * TARJETA DE CANCIÓN
 * =========================
 */
function createSongCard(song) {
  const artistName = song.artists?.name || "Artista desconocido";
  const tieneVideo = !!song.video_url;
  const genreText = song.generos.join(", ");

  return `
    <div class="song-card">
      <div class="thumbnail-wrapper">

        <img src="${song.thumbnail_url}" 
             alt="${escapeHtml(song.titulo)}"
             loading="lazy">

        <div class="play-overlay">
          <button class="play-btn"
            onclick="window.location.href='play.html?id=${song.id}'">
            <i class="bi bi-play-fill"></i>
          </button>
        </div>

        ${genreText ? `
          <span class="genre-badge">
            ${escapeHtml(genreText)}
          </span>
        ` : ""}

        <span class="media-badge ${tieneVideo ? "video" : ""}">
          <i class="bi ${
            tieneVideo
              ? "bi-camera-video-fill"
              : "bi-music-note-beamed"
          }"></i>
          ${tieneVideo ? "Video" : "Audio"}
        </span>

      </div>

      <a href="play.html?id=${song.id}"
         class="song-info text-decoration-none">

        <h3 class="song-title">
          ${escapeHtml(song.titulo)}
        </h3>

        <p class="song-artist">
          ${escapeHtml(artistName)}
        </p>

      </a>
    </div>
  `;
}

/**
 * =========================
 * FILTROS
 * =========================
 */
function aplicarFiltros() {
  let resultado = [...canciones];

  if (searchQuery) {
    resultado = resultado.filter(song =>
      song.titulo.toLowerCase().includes(searchQuery) ||
      (song.artists?.name || "")
        .toLowerCase()
        .includes(searchQuery) ||
      song.generos.some(g =>
        g.toLowerCase().includes(searchQuery)
      )
    );
  }

  if (currentFilter === "video") {
    resultado = resultado.filter(song => song.video_url);
  } else if (currentFilter === "audio") {
    resultado = resultado.filter(song => !song.video_url);
  }

  filteredSongs = resultado;
  updateResultsCount();
  renderCanciones();
}

/**
 * =========================
 * FILTROS DINÁMICOS GÉNERO
 * =========================
 */
function generarFiltrosGenero() {
  if (!filters) return;

  const generos = new Set();

  canciones.forEach(song => {
    song.generos.forEach(g => generos.add(g));
  });

  generos.forEach(genero => {
    const chip = document.createElement("button");
    chip.className = "filter-chip";
    chip.textContent = genero;

    chip.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-chip")
        .forEach(c => c.classList.remove("active"));

      chip.classList.add("active");

      filteredSongs = canciones.filter(song =>
        song.generos.includes(genero)
      );

      updateResultsCount();
      renderCanciones();
    });

    filters.appendChild(chip);
  });
}

/**
 * =========================
 * UI HELPERS
 * =========================
 */
function updateResultsCount() {
  const count = filteredSongs.length;
  resultsCount.textContent =
    `${count} ${count === 1 ? "canción" : "canciones"}`;
}

function showLoading(show) {
  if (loadingState) {
    loadingState.style.display = show ? "block" : "none";
  }
  if (show) {
    contenedor.innerHTML = "";
    showEmptyState(false);
  }
}

function showEmptyState(show) {
  if (emptyState) {
    emptyState.style.display = show ? "block" : "none";
  }
}

function showError(message) {
  contenedor.innerHTML = `
    <div class="col-12">
      <div class="empty-state">
        <div class="empty-icon">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <h3 class="empty-title">Error</h3>
        <p class="empty-text">${message}</p>
      </div>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * =========================
 * BUSCADOR
 * =========================
 */
let searchTimeout;

buscador?.addEventListener("input", e => {
  clearTimeout(searchTimeout);

  searchQuery =
    e.target.value.toLowerCase().trim();

  searchTimeout = setTimeout(
    aplicarFiltros,
    300
  );
});

/**
 * =========================
 * FILTROS AUDIO / VIDEO
 * =========================
 */
filters?.addEventListener("click", e => {
  const chip = e.target.closest(".filter-chip");
  if (!chip) return;

  document
    .querySelectorAll(".filter-chip")
    .forEach(c => c.classList.remove("active"));

  chip.classList.add("active");

  currentFilter = chip.dataset.filter || "all";
  aplicarFiltros();
});

/**
 * =========================
 * INICIAR
 * =========================
 */
cargarCanciones();
