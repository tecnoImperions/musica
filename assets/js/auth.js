import { supabase } from "./supabase.js";

/**
 * Obtener usuario actual
 */
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error obteniendo usuario:", error);
    return null;
  }
  return user;
}

/**
 * Obtener perfil del usuario
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error obteniendo perfil:", error);
    return null;
  }
  return data;
}

/**
 * Registro de nuevo usuario
 */
export async function register(email, password, username) {
  try {
<<<<<<< HEAD
    // 1️⃣ Crear usuario en Auth
=======
    // 1. Crear usuario en Auth
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

<<<<<<< HEAD
    const userId = authData.user.id;

    // 2️⃣ Insertar perfil directamente
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        username,
        email,
        avatar_url: null
      });

    if (profileError) throw profileError;

    // ✅ Usuario creado correctamente
    Swal.fire({
      icon: 'success',
      title: '¡Usuario creado!',
      text: 'Ya puedes iniciar sesión con tu correo.',
      confirmButtonText: 'OK'
    });

    return { success: true, user: authData.user };

  } catch (error) {
    console.error("Error en registro:", error);

    // ❌ Mostrar error al usuario
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message,
      confirmButtonText: 'OK'
    });

=======
    // 2. Actualizar perfil con username y email
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ 
        username, 
        email 
      })
      .eq("id", authData.user.id);

    if (profileError) throw profileError;

    return { success: true, user: authData.user };
  } catch (error) {
    console.error("Error en registro:", error);
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
    return { success: false, error: error.message };
  }
}

<<<<<<< HEAD

=======
>>>>>>> e202cdadf19849e2881bccdcca0dc1822b7b2401
/**
 * Login con email o username
 */
export async function login(identifier, password) {
  try {
    // Intentar login directo con email
    let result = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    // Si falla, intentar buscar por username
    if (result.error && result.error.message.includes("Invalid")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", identifier)
        .single();

      if (profile?.email) {
        result = await supabase.auth.signInWithPassword({
          email: profile.email,
          password,
        });
      }
    }

    if (result.error) throw result.error;

    return { success: true, user: result.data.user };
  } catch (error) {
    console.error("Error en login:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Logout
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error al cerrar sesión:", error);
    return false;
  }
  return true;
}

/**
 * Verificar si hay sesión activa
 */
export async function checkAuth() {
  const user = await getUser();
  return !!user;
}

/**
 * Actualizar perfil
 */
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("Error actualizando perfil:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Cambiar contraseña
 */
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("Error cambiando contraseña:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Verificar si el usuario es admin
 */
export async function isAdmin() {
  const user = await getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return data?.is_admin || false;
}

/**
 * Redirigir si no está autenticado
 */
export async function requireAuth(redirectTo = "/login.html") {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

/**
 * Redirigir si no es admin
 */
export async function requireAdmin(redirectTo = "/index.html") {
  const admin = await isAdmin();
  if (!admin) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}