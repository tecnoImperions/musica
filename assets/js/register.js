import { supabase } from "./supabase.js";

const btnRegister = document.getElementById("registerBtn");

btnRegister.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !email || !password) {
    window.Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Completa todos los campos"
    });
    return;
  }

  try {
    window.Swal.fire({
      title: "Creando cuenta...",
      allowOutsideClick: false,
      didOpen: () => window.Swal.showLoading()
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;
    if (!data.user) throw new Error("Usuario no creado");

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", data.user.id);

    if (profileError) throw profileError;

    window.Swal.fire({
      icon: "success",
      title: "Cuenta creada 🎉",
      text: "Ahora puedes iniciar sesión"
    }).then(() => {
      window.location.href = "login.html";
    });

  } catch (err) {
    console.error(err);
    window.Swal.fire({
      icon: "error",
      title: "Error",
      text: err.message || "Error inesperado"
    });
  }
});
