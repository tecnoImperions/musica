import { supabase } from "./supabase.js";

const contenedor = document.getElementById("listaMusica");
const buscador = document.getElementById("search");
const resultsCount = document.getElementById("resultsCount");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const filters = document.getElementById("filters");

let canciones = [];
let filteredSongs = [];
let currentFilter = 'all';
let searchQuery = '';

/**
 * Cargar canciones desde Supabase
 */
export async function cargarCanciones() {
  showLoading(true);

  try {
    const { data, error } = await supabase
      .from("songs")
      .select(`
        id,
        titulo,
        genero,
        thumbnail_url,
        audio_url,
        video_url,
        created_at,
        artists (
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ERROR CARGANDO:", error);
      showError("Error cargando canciones");
      return;
    }

    canciones = data || [];
    filteredSongs = canciones;

    updateResultsCount();
    renderCanciones();
    generarFiltrosGenero();

  } catch (err) {
    console.error("ERROR GENERAL:", err);
    showError("Error de conexión");
  } finally {
    showLoading(false);
  }
}

/**
 * Renderizar canciones
 */
function renderCanciones() {
  contenedor.innerHTML = "";

  if (filteredSongs.length === 0) {
    showEmptyState(true);
    return;
  }

  showEmptyState(false);

  filteredSongs.forEach(song => {
    const tieneVideo = !!song.video_url;
    const songCard = createSongCard(song, tieneVideo);

    const col = document.createElement('div');
    col.className = 'col-6 col-md-4 col-lg-3';
    col.innerHTML = songCard;

    contenedor.appendChild(col);
  });
}

/**
 * Crear tarjeta de canción
 */
function createSongCard(song, tieneVideo) {
  const artistName = song.artists?.name || "Artista desconocido";

  return `
    <div class="song-card">
      <div class="thumbnail-wrapper">
        <img src="${song.thumbnail_url}" alt="${escapeHtml(song.titulo)}" loading="lazy">

        <div class="play-overlay">
          <button class="play-btn" onclick="window.location.href='play.html?id=${song.id}'">
            <i class="bi bi-play-fill"></i>
          </button>
        </div>

        ${song.genero ? `
          <span class="genre-badge">${escapeHtml(song.genero)}</span>
        ` : ''}

        <span class="media-badge ${tieneVideo ? 'video' : ''}">
          <i class="bi ${tieneVideo ? 'bi-camera-video-fill' : 'bi-music-note-beamed'}"></i>
          ${tieneVideo ? 'Video' : 'Audio'}
        </span>
      </div>

      <a href="play.html?id=${song.id}" class="song-info text-decoration-none">
        <h3 class="song-title">${escapeHtml(song.titulo)}</h3>
        <p class="song-artist">${escapeHtml(artistName)}</p>
      </a>
    </div>
  `;
}

/**
 * Aplicar filtros
 */
function aplicarFiltros() {
  let resultado = [...canciones];

  if (searchQuery) {
    resultado = resultado.filter(song =>
      song.titulo.toLowerCase().includes(searchQuery) ||
      (song.artists?.name || '').toLowerCase().includes(searchQuery) ||
      (song.genero && song.genero.toLowerCase().includes(searchQuery))
    );
  }

  if (currentFilter === 'video') {
    resultado = resultado.filter(song => song.video_url);
  } else if (currentFilter === 'audio') {
    resultado = resultado.filter(song => !song.video_url);
  }

  filteredSongs = resultado;
  updateResultsCount();
  renderCanciones();
}

/**
 * Contador
 */
function updateResultsCount() {
  const count = filteredSongs.length;
  resultsCount.textContent = `${count} ${count === 1 ? 'canción' : 'canciones'}`;
}

/**
 * Loading
 */
function showLoading(show) {
  if (loadingState) {
    loadingState.style.display = show ? 'block' : 'none';
  }
  if (show) {
    contenedor.innerHTML = '';
    showEmptyState(false);
  }
}

/**
 * Estado vacío
 */
function showEmptyState(show) {
  if (emptyState) {
    emptyState.style.display = show ? 'block' : 'none';
  }
}

/**
 * Error
 */
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

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Buscador
 */
let searchTimeout;
buscador?.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchQuery = e.target.value.toLowerCase().trim();

  searchTimeout = setTimeout(() => {
    aplicarFiltros();
  }, 300);
});

/**
 * Filtros tipo media
 */
filters?.addEventListener('click', (e) => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;

  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');

  currentFilter = chip.dataset.filter;
  aplicarFiltros();
});

/**
 * Generar filtros dinámicos por género
 */
function generarFiltrosGenero() {
  const generos = [...new Set(canciones.map(s => s.genero).filter(Boolean))];

  generos.forEach(genero => {
    const chip = document.createElement('button');
    chip.className = 'filter-chip';
    chip.innerHTML = genero;

    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      filteredSongs = canciones.filter(s => s.genero === genero);
      updateResultsCount();
      renderCanciones();
    });

    filters?.appendChild(chip);
  });
}

cargarCanciones();
