// assets/js/cloudinary.js

const CLOUD_NAME = "duwvw6q2c";
const UPLOAD_PRESET = "varian_songs";

/**
 * Sube cualquier archivo (imagen o audio) a Cloudinary
 * @param {File} file
 * @returns {Promise<string>} URL segura del archivo
 */
export async function uploadFile(file) {
  if (!file) throw new Error("No se envió ningún archivo");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(error);
    throw new Error("Error al subir a Cloudinary");
  }

  const data = await response.json();
  return data.secure_url;
}
