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
<<<<<<< HEAD
    // 1️⃣ BUSCAR ARTISTA
    // =========================
    const { data: artistaExistente, error: errorBusqueda } = await supabase
      .from("artists")
      .select("id")
      .ilike("name", artistaNombre)
      .maybeSingle(); // 👈 IMPORTANTE (no rompe si no existe)

    if (errorBusqueda) throw errorBusqueda;
=======
    // 1️⃣ BUSCAR SI EL ARTISTA YA EXISTE
    // =========================
    let { data: artistaExistente } = await supabase
      .from("artists")
      .select("id")
      .ilike("name", artistaNombre)
      .single();
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401

    let artist_id;

    if (artistaExistente) {
      artist_id = artistaExistente.id;
    } else {
      // =========================
<<<<<<< HEAD
      // 2️⃣ CREAR ARTISTA NUEVO
      // =========================
      const { data: nuevoArtista, error: errorArtista } = await supabase
        .from("artists")
        .insert({ name: artistaNombre })
=======
      // 2️⃣ CREAR NUEVO ARTISTA
      // =========================
      const { data: nuevoArtista, error: errorArtista } = await supabase
        .from("artists")
        .insert([{ name: artistaNombre }])
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
        .select()
        .single();

      if (errorArtista) throw errorArtista;

      artist_id = nuevoArtista.id;
    }

    // =========================
<<<<<<< HEAD
    // 3️⃣ SUBIR A CLOUDINARY
=======
    // 3️⃣ SUBIR ARCHIVOS A CLOUDINARY
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
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
<<<<<<< HEAD
      artist_id,
      genero,
      audio_url,
      thumbnail_url,
      video_url
    };

    const { data: insertedSong, error: errorSong } = await supabase
      .from("songs")
      .insert(songData)
      .select()
      .single();

    if (errorSong) throw errorSong;

    console.log("CANCIÓN INSERTADA:", insertedSong);

    Swal.fire({
      icon: "success",
      title: "¡Contenido subido correctamente!",
      text: "La canción fue guardada en la base de datos"
=======
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
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
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
