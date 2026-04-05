import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";

// Handles the OAuth redirect from Google.
// Supabase sends the user back to /auth/callback?code=...
// We exchange the code for a session, then the _layout onAuthStateChange
// picks up SIGNED_IN and redirects to /(tabs).

export default function AuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      if (typeof window === "undefined") return;

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(window.location.href);
          // Clean the code from the URL
          window.history.replaceState({}, "", "/");
        } catch (_) {
          // Exchange failed — go to welcome so user can try again
          router.replace("/(auth)/welcome");
          return;
        }
      }

      // _layout.tsx onAuthStateChange will fire SIGNED_IN and redirect to /(tabs)
      // As a fallback, redirect after a short delay in case the listener misses it
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 300);
    }

    handleCallback();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontFamily: "Georgia", fontSize: 44, color: Colors.primary, letterSpacing: 1 }}>
        Kiln
      </Text>
    </View>
  );
}
