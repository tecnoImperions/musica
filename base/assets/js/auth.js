import { supabase } from "./supabase.js";

// SweetAlert loader dinámico
function loadSwal() {
  if (!window.Swal) {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
    document.head.appendChild(script);
  }
}

loadSwal();

// =====================
// REGISTER
// =====================
export async function register(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message
    });

    return { success: false };
  }

  const user = data.user;

  if (!user) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se creó usuario"
    });

    return { success: false };
  }

  await new Promise(r => setTimeout(r, 300));

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      username,
      email
    });

  if (profileError) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: profileError.message
    });

    return { success: false };
  }

  Swal.fire({
    icon: "success",
    title: "Registro exitoso",
    text: "Tu cuenta fue creada correctamente"
  });

  return { success: true };
}

// =====================
// LOGIN
// =====================
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Login fallido",
      text: error.message
    });

    return { success: false };
  }

  await Swal.fire({
    icon: "success",
    title: "Bienvenido",
    text: "Login correcto",
    timer: 1500,
    showConfirmButton: false
  });

  return { success: true, user: data.user };
}

// =====================
// LOGOUT
// =====================
export async function logout() {
  await supabase.auth.signOut();

  Swal.fire({
    icon: "info",
    title: "Sesión cerrada",
    timer: 1200,
    showConfirmButton: false
  });

  setTimeout(() => {
    window.location.href = "../login.html";
  }, 1200);
}

// =====================
// CHECK AUTH
// =====================
export async function checkAuth() {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

// =====================
// GET CURRENT USER
// =====================
export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
