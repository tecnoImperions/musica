import { supabase } from "./supabase.js";

// REGISTRO
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) throw error;
  return data;
}

// LOGIN
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

// LOGOUT
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// USUARIO ACTUAL
export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}
