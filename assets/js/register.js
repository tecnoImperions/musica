import { supabase } from "./supabase.js";

const btnRegister = document.getElementById("registerBtn");

btnRegister.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !email || !password) {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Completa todos los campos"
    });
    return;
  }

  try {
    Swal.fire({
      title: "Creando cuenta...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    // 1️⃣ Crear usuario en auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;
    if (!data.user) throw new Error("No se pudo crear el usuario");

    // 2️⃣ Guardar perfil en tabla profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        username: username,
        email: email,
        avatar_url: null
      });

    if (profileError) throw profileError;

    Swal.fire({
      icon: "success",
      title: "Cuenta creada 🎉",
      text: "Ahora puedes iniciar sesión"
    }).then(() => {
      window.location.href = "login.html";
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.message || "Ocurrió un error inesperado"
    });
  }
});
