import { Platform } from "react-native";
import { supabase } from "./supabase";

// ─── Email / Password ─────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, name?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: name ?? "" },
    },
  });
  if (error) throw error;
  return data;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

// ─── OAuth ────────────────────────────────────────────────────────────────────
// On web: opens the provider's sign-in page in the same tab (Supabase redirects back).
// On native: requires expo-auth-session + expo-web-browser for a proper PKCE flow.
// See: https://supabase.com/docs/guides/auth/social-login/auth-google?platform=react-native

export async function signInWithGoogle() {
  if (Platform.OS !== "web") {
    // TODO: implement native OAuth using expo-auth-session + expo-web-browser
    // Install: npx expo install expo-auth-session expo-web-browser
    throw new Error("Google sign-in on native requires expo-auth-session. See lib/auth.ts.");
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithApple() {
  if (Platform.OS !== "web") {
    // TODO: implement native Apple sign-in using expo-apple-authentication
    // Install: npx expo install expo-apple-authentication
    throw new Error("Apple sign-in on native requires expo-apple-authentication. See lib/auth.ts.");
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
    },
  });
  if (error) throw error;
  return data;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}
