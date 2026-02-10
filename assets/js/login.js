import { supabase } from "./supabase.js";

const btnLogin = document.getElementById("loginBtn");

btnLogin.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Ingresa correo y contraseña"
    });
    return;
  }

  try {
    Swal.fire({
      title: "Iniciando sesión...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    Swal.fire({
      icon: "success",
      title: "Bienvenido 🎧",
      text: "Inicio de sesión correcto"
    }).then(() => {
      window.location.href = "index.html";
    });

  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.message
    });
  }
});
