import { supabase } from "./supabase.js";

const btnLogin = document.getElementById("loginBtn");

btnLogin.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Ingresa usuario y contraseña"
    });
    return;
  }

  try {
    Swal.fire({
      title: "Iniciando sesión...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    // 1️⃣ Buscar email según username
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", username)
      .single();

    if (profileError || !profile) {
      throw new Error("Usuario no encontrado");
    }

    // 2️⃣ Login usando email
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: password
    });

    if (loginError) throw loginError;

    Swal.fire({
      icon: "success",
      title: "Bienvenido 🎶",
      timer: 1200,
      showConfirmButton: false
    }).then(() => {
      window.location.href = "index.html";
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.message || "Credenciales incorrectas"
    });
  }
});
