import { supabase } from "./supabase.js";
import { uploadFile } from "./cloudinary.js";

const btn = document.getElementById("agregarCancion");

btn.onclick = async () => {
  const titulo = document.getElementById("titulo").value.trim();
  const artistaNombre = document.getElementById("artista").value.trim();
  const genero = document.getElementById("genero").value.trim();

  const coverFile = document.getElementById("cover").files[0];
  const audioFile = document.getElementById("audio").files[0];
  const videoFile = document.getElementById("video")?.files[0];

  if (!titulo || !artistaNombre || !coverFile || !audioFile) {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Título, artista, portada y audio son obligatorios"
    });
    return;
  }

  try {
    Swal.fire({
      title: "Subiendo contenido...",
      text: "Por favor espera",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    // =========================
    // 1️⃣ BUSCAR SI EL ARTISTA YA EXISTE
    // =========================
    let { data: artistaExistente } = await supabase
      .from("artists")
      .select("id")
      .ilike("name", artistaNombre)
      .single();

    let artist_id;

    if (artistaExistente) {
      artist_id = artistaExistente.id;
    } else {
      // =========================
      // 2️⃣ CREAR NUEVO ARTISTA
      // =========================
      const { data: nuevoArtista, error: errorArtista } = await supabase
        .from("artists")
        .insert([{ name: artistaNombre }])
        .select()
        .single();

      if (errorArtista) throw errorArtista;

      artist_id = nuevoArtista.id;
    }

    // =========================
    // 3️⃣ SUBIR ARCHIVOS A CLOUDINARY
    // =========================
    const thumbnail_url = await uploadFile(coverFile);
    const audio_url = await uploadFile(audioFile);

    let video_url = null;
    if (videoFile) {
      video_url = await uploadFile(videoFile);
    }

    // =========================
    // 4️⃣ INSERTAR CANCIÓN
    // =========================
    const songData = {
      titulo,
      genero,
      audio_url,
      thumbnail_url,
      artist_id
    };

    if (video_url) {
      songData.video_url = video_url;
    }

    const { error: errorSong } = await supabase
      .from("songs")
      .insert([songData]);

    if (errorSong) throw errorSong;

    Swal.fire({
      icon: "success",
      title: "¡Contenido subido correctamente!",
    }).then(() => location.reload());

  } catch (err) {
    console.error("ERROR REAL:", err);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.message || "No se pudo subir el contenido"
    });
  }
};
