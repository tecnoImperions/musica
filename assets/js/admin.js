import { supabase } from "./supabase.js";

// ========================================
// AGREGAR CANCION
// ========================================
document.getElementById("agregarCancion").addEventListener("click", async () => {
  const titulo = document.getElementById("titulo").value.trim();
  const artista = document.getElementById("artista").value.trim();
  const genero = document.getElementById("genero").value.trim();
  const audio_url = document.getElementById("audio_url").value.trim();
  const thumbnail_url = document.getElementById("thumbnail_url").value.trim();

  if (!titulo || !artista || !audio_url || !thumbnail_url) {
    alert("Faltan campos obligatorios");
    return;
  }

  try {
    const { data, error } = await supabase
      .from("songs")
      .insert([{ titulo, artista, genero, audio_url, thumbnail_url }]);

    if (error) throw error;

    alert("Canción agregada ✅");

    // Limpiar campos
    document.getElementById("titulo").value = "";
    document.getElementById("artista").value = "";
    document.getElementById("genero").value = "";
    document.getElementById("audio_url").value = "";
    document.getElementById("thumbnail_url").value = "";

    // Opcional: recargar lista de canciones si quieres mostrarla
    // listarCanciones();
  } catch (err) {
    console.error(err);
    alert("Error al agregar canción: " + err.message);
  }
});

// ========================================
// LISTAR USUARIOS (desde tabla profiles)
// ========================================
async function listarUsuarios() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url");

    const lista = document.getElementById("listaUsuarios");
    lista.innerHTML = "";

    if (error) throw error;

    if (!data.length) {
      lista.innerHTML = `<li class="list-group-item text-secondary">No hay usuarios aún</li>`;
      return;
    }

    data.forEach(u => {
      lista.innerHTML += `
        <li class="list-group-item d-flex align-items-center justify-content-between">
          <span>${u.username || u.id}</span>
          ${u.avatar_url ? `<img src="${u.avatar_url}" alt="avatar" style="width:30px;height:30px;border-radius:50%;">` : ""}
        </li>`;
    });
  } catch (err) {
    console.error(err);
    const lista = document.getElementById("listaUsuarios");
    lista.innerHTML = `<li class="list-group-item text-danger">Error al cargar usuarios: ${err.message}</li>`;
  }
}

listarUsuarios();
