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
<<<<<<< HEAD

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
=======
  
  try {
    const { data, error } = await supabase
      .from("songs")
      .select("id, titulo, artista, genero, thumbnail_url, audio_url, video_url")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
      showError("Error cargando canciones");
      return;
    }

    canciones = data || [];
    filteredSongs = canciones;
<<<<<<< HEAD

    updateResultsCount();
    renderCanciones();
    generarFiltrosGenero();

  } catch (err) {
    console.error("ERROR GENERAL:", err);
=======
    
    updateResultsCount();
    renderCanciones();
    
  } catch (err) {
    console.error(err);
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
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
<<<<<<< HEAD

    const col = document.createElement('div');
    col.className = 'col-6 col-md-4 col-lg-3';
    col.innerHTML = songCard;

=======
    
    const col = document.createElement('div');
    col.className = 'col-6 col-md-4 col-lg-3';
    col.innerHTML = songCard;
    
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
    contenedor.appendChild(col);
  });
}

/**
<<<<<<< HEAD
 * Crear tarjeta de canción
 */
function createSongCard(song, tieneVideo) {
  const artistName = song.artists?.name || "Artista desconocido";

  return `
    <div class="song-card">
      <div class="thumbnail-wrapper">
        <img src="${song.thumbnail_url}" alt="${escapeHtml(song.titulo)}" loading="lazy">

=======
 * Crear HTML de tarjeta de canción
 */
function createSongCard(song, tieneVideo) {
  return `
    <div class="song-card">
      <div class="thumbnail-wrapper">
        <img src="${song.thumbnail_url}" alt="${song.titulo}" loading="lazy">
        
        <!-- Play Overlay -->
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
        <div class="play-overlay">
          <button class="play-btn" onclick="window.location.href='play.html?id=${song.id}'">
            <i class="bi bi-play-fill"></i>
          </button>
        </div>
<<<<<<< HEAD

        ${song.genero ? `
          <span class="genre-badge">${escapeHtml(song.genero)}</span>
        ` : ''}

=======
        
        <!-- Genre Badge -->
        ${song.genero ? `
          <span class="genre-badge">${song.genero}</span>
        ` : ''}
        
        <!-- Media Type Badge -->
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
        <span class="media-badge ${tieneVideo ? 'video' : ''}">
          <i class="bi ${tieneVideo ? 'bi-camera-video-fill' : 'bi-music-note-beamed'}"></i>
          ${tieneVideo ? 'Video' : 'Audio'}
        </span>
<<<<<<< HEAD
      </div>

      <a href="play.html?id=${song.id}" class="song-info text-decoration-none">
        <h3 class="song-title">${escapeHtml(song.titulo)}</h3>
        <p class="song-artist">${escapeHtml(artistName)}</p>
=======
        
        <!-- Options Button -->
        <button class="options-btn" onclick="abrirSheet(${JSON.stringify(song).replace(/"/g, '&quot;')})">
          <i class="bi bi-three-dots-vertical"></i>
        </button>
      </div>
      
      <a href="play.html?id=${song.id}" class="song-info text-decoration-none">
        <h3 class="song-title">${escapeHtml(song.titulo)}</h3>
        <p class="song-artist">${escapeHtml(song.artista)}</p>
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
      </a>
    </div>
  `;
}

/**
<<<<<<< HEAD
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

=======
 * Filtrar canciones
 */
function aplicarFiltros() {
  let resultado = [...canciones];
  
  // Filtro por búsqueda
  if (searchQuery) {
    resultado = resultado.filter(song =>
      song.titulo.toLowerCase().includes(searchQuery) ||
      song.artista.toLowerCase().includes(searchQuery) ||
      (song.genero && song.genero.toLowerCase().includes(searchQuery))
    );
  }
  
  // Filtro por tipo de media
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
  if (currentFilter === 'video') {
    resultado = resultado.filter(song => song.video_url);
  } else if (currentFilter === 'audio') {
    resultado = resultado.filter(song => !song.video_url);
  }
<<<<<<< HEAD

=======
  
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
  filteredSongs = resultado;
  updateResultsCount();
  renderCanciones();
}

/**
<<<<<<< HEAD
 * Contador
=======
 * Actualizar contador de resultados
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
 */
function updateResultsCount() {
  const count = filteredSongs.length;
  resultsCount.textContent = `${count} ${count === 1 ? 'canción' : 'canciones'}`;
}

/**
<<<<<<< HEAD
 * Loading
=======
 * Mostrar/ocultar loading
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
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
<<<<<<< HEAD
 * Estado vacío
=======
 * Mostrar/ocultar estado vacío
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
 */
function showEmptyState(show) {
  if (emptyState) {
    emptyState.style.display = show ? 'block' : 'none';
  }
}

/**
<<<<<<< HEAD
 * Error
=======
 * Mostrar error
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
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
<<<<<<< HEAD
 * Buscador
=======
 * Buscador con debounce
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
 */
let searchTimeout;
buscador?.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchQuery = e.target.value.toLowerCase().trim();
<<<<<<< HEAD

=======
  
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
  searchTimeout = setTimeout(() => {
    aplicarFiltros();
  }, 300);
});

/**
<<<<<<< HEAD
 * Filtros tipo media
=======
 * Filtros de tipo de media
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
 */
filters?.addEventListener('click', (e) => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
<<<<<<< HEAD

  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');

=======
  
  // Update active state
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  
  // Apply filter
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
  currentFilter = chip.dataset.filter;
  aplicarFiltros();
});

/**
<<<<<<< HEAD
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

=======
 * Generar géneros dinámicos (opcional)
 */
function generarFiltrosGenero() {
  const generos = [...new Set(canciones.map(s => s.genero).filter(Boolean))];
  
  if (generos.length === 0) return;
  
  generos.forEach(genero => {
    const chip = document.createElement('button');
    chip.className = 'filter-chip';
    chip.dataset.filter = genero.toLowerCase();
    chip.innerHTML = `<i class="bi bi-tag-fill"></i> ${genero}`;
    
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      
      const filtered = canciones.filter(s => s.genero === genero);
      filteredSongs = filtered;
      updateResultsCount();
      renderCanciones();
    });
    
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
    filters?.appendChild(chip);
  });
}

<<<<<<< HEAD
cargarCanciones();
=======
// Cargar canciones al iniciar
cargarCanciones();
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
