import { supabase } from "./supabase.js";
import { uploadFile } from "./cloudinary.js";

let dbArtists = [];
let dbGenres = [];
let selectedArtistId = null;
let selectedGenresIds = [];
let currentContext = 'artist';

// 1. CARGA INICIAL: Cache en memoria para velocidad de búsqueda
async function cargarCatalogos() {
    const { data: a } = await supabase.from("artists").select("id, name").order("name");
    const { data: g } = await supabase.from("genres").select("id, name").order("name");
    dbArtists = a || [];
    dbGenres = g || [];
}

// 2. BUSCADOR INTELIGENTE (Para +1000 registros)
function setupSearch(inputId, resultsId, dataArray, onSelect) {
    const input = document.getElementById(inputId);
    const results = document.getElementById(resultsId);

    input.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        results.innerHTML = "";
        if (term.length < 1) { results.style.display = "none"; return; }

        const filtered = dataArray.filter(item => item.name.toLowerCase().includes(term)).slice(0, 10);

        filtered.forEach(item => {
            const div = document.createElement("div");
            div.className = "result-item";
            div.textContent = item.name;
            div.onclick = () => {
                onSelect(item);
                results.style.display = "none";
                if(inputId === 'artistSearch') input.value = item.name;
                else input.value = ""; 
            };
            results.appendChild(div);
        });
        results.style.display = filtered.length > 0 ? "block" : "none";
    });
}

// Configurar búsquedas
setupSearch("artistSearch", "artistResults", dbArtists, (a) => { selectedArtistId = a.id; });
setupSearch("genreSearch", "genreResults", dbGenres, (g) => {
    if (!selectedGenresIds.includes(g.id)) {
        selectedGenresIds.push(g.id);
        renderGenres();
    }
});

function renderGenres() {
    const container = document.getElementById("selectedGenresList");
    container.innerHTML = selectedGenresIds.map(id => {
        const g = dbGenres.find(x => x.id === id);
        return `<span class="badge bg-secondary p-2 rounded-pill">${g.name} <i class="bi bi-x ms-1 cursor-pointer" onclick="removeGenre('${id}')"></i></span>`;
    }).join("");
}

window.removeGenre = (id) => {
    selectedGenresIds = selectedGenresIds.filter(x => x !== id);
    renderGenres();
};

// 3. PANEL LATERAL: AGREGAR NUEVOS
window.setContext = (ctx) => {
    currentContext = ctx;
    document.getElementById("panelTitle").textContent = ctx === 'artist' ? "Nuevo Artista" : "Nuevo Género";
};

document.getElementById("saveNewBtn").onclick = async () => {
    const name = document.getElementById("newName").value.trim();
    if (!name) return;

    const table = currentContext === 'artist' ? 'artists' : 'genres';
    const { data, error } = await supabase.from(table).insert([{ name }]).select().single();

    if (!error) {
        if (currentContext === 'artist') {
            dbArtists.push(data);
            selectedArtistId = data.id;
            document.getElementById("artistSearch").value = data.name;
        } else {
            dbGenres.push(data);
            selectedGenresIds.push(data.id);
            renderGenres();
        }
        bootstrap.Offcanvas.getInstance(document.getElementById('panelNuevo')).hide();
        document.getElementById("newName").value = "";
    }
};

// 4. SUBIR CANCIÓN
document.getElementById("agregarCancion").onclick = async () => {
    const titulo = document.getElementById("titulo").value.trim();
    const coverFile = document.getElementById("cover").files[0];
    const audioFile = document.getElementById("audio").files[0];
    const videoFile = document.getElementById("video").files[0];

    if (!titulo || !selectedArtistId || !coverFile || !audioFile) {
        Swal.fire("Error", "Faltan campos obligatorios", "warning");
        return;
    }

    try {
        Swal.fire({ title: "Subiendo obra...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const thumbnail_url = await uploadFile(coverFile);
        const audio_url = await uploadFile(audioFile);
        const video_url = videoFile ? await uploadFile(videoFile) : null;

        const { data: song, error } = await supabase.from("songs").insert([{
            titulo, artist_id: selectedArtistId, artista: document.getElementById("artistSearch").value,
            audio_url, thumbnail_url, video_url
        }]).select().single();

        if (error) throw error;

        if (selectedGenresIds.length > 0) {
            const links = selectedGenresIds.map(gid => ({ song_id: song.id, genre_id: gid }));
            await supabase.from("song_genres").insert(links);
        }

        Swal.fire("¡Éxito!", "Lanzamiento publicado", "success").then(() => location.reload());
    } catch (e) {
        Swal.fire("Error", e.message, "error");
    }
};

// Preview Imagen
document.getElementById('cover').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
        document.getElementById('previewImg').src = reader.result;
        document.getElementById('previewImg').style.display = 'block';
        document.getElementById('dropText').style.display = 'none';
    };
    reader.readAsDataURL(e.target.files[0]);
};

cargarCatalogos();