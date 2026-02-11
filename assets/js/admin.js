import { supabase } from "./supabase.js";
import { uploadFile } from "./cloudinary.js";

const btn = document.getElementById("agregarCancion");

btn.onclick = async () => {
  const titulo = document.getElementById("titulo").value.trim();
  const artista = document.getElementById("artista").value.trim();
  const genero = document.getElementById("genero").value.trim();

  const coverFile = document.getElementById("cover").files[0];
  const audioFile = document.getElementById("audio").files[0];
  const videoFile = document.getElementById("video")?.files[0]; // opcional

  if (!titulo || !artista || !coverFile || !audioFile) {
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

    // Subidas
    const thumbnail_url = await uploadFile(coverFile);
    const audio_url = await uploadFile(audioFile);

    let video_url = null;
    if (videoFile) {
      video_url = await uploadFile(videoFile);
    }

    const { error } = await supabase.from("songs").insert([
      {
        titulo,
        artista,
        genero,
        audio_url,
        video_url,
        thumbnail_url
      }
    ]);

    if (error) throw error;

    Swal.fire({
      icon: "success",
      title: "¡Contenido subido!",
      text: video_url
        ? "Canción y video guardados correctamente"
        : "Canción guardada correctamente"
    }).then(() => location.reload());

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo subir el contenido"
    });
  }
};
