import { supabase } from "./supabase.js";
import { uploadFile } from "./cloudinary.js";

const btn = document.getElementById("agregarCancion");

btn.onclick = async () => {
  const titulo = document.getElementById("titulo").value;
  const artista = document.getElementById("artista").value;
  const genero = document.getElementById("genero").value;

  const coverFile = document.getElementById("cover").files[0];
  const audioFile = document.getElementById("audio").files[0];

  if (!titulo || !artista || !coverFile || !audioFile) {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Completa todos los campos"
    });
    return;
  }

  try {
    Swal.fire({
      title: "Subiendo canción...",
      text: "Espera un momento",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const thumbnail_url = await uploadFile(coverFile);
    const audio_url = await uploadFile(audioFile);

    const { error } = await supabase.from("songs").insert([
      {
        titulo,
        artista,
        genero,
        audio_url,
        thumbnail_url
      }
    ]);

    if (error) throw error;

    // ✅ AQUÍ ESTÁ LA MODIFICACIÓN
    Swal.fire({
      icon: "success",
      title: "¡Canción subida!",
      text: "La música se guardó correctamente",
      confirmButtonText: "Aceptar"
    }).then(() => {
      location.reload();
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo subir la canción"
    });
  }
};
