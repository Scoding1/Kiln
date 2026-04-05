import "../global.css";

import { useState, useEffect, useRef } from "react";
import { View, Text } from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";
import { Colors } from "@/constants/colors";

function KilnSplash() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontFamily: "Georgia", fontSize: 44, color: Colors.primary, letterSpacing: 1 }}>
        Kiln
      </Text>
    </View>
  );
}

// Returns true if the user has a name saved — i.e. has completed onboarding.
// Applies to all sign-in methods (Google, email, Apple).
async function profileHasName(sess: Session): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("profiles") as any)
    .select("name")
    .eq("id", sess.user.id)
    .single();
  const profile = data as { name: string } | null;
  return !!(profile?.name && profile.name.trim().length > 0);
}

export default function RootLayout() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const mounted = useRef(true);
  const initialRedirectDone = useRef(false);
  // Prevent a second redirect firing while the first async one is in flight
  const isRedirecting = useRef(false);

  async function doRedirect(sess: Session | null) {
    if (!mounted.current || isRedirecting.current) return;
    isRedirecting.current = true;

    try {
      if (!sess) {
        router.replace("/(auth)/welcome");
        return;
      }

      // For every authenticated user, check if they've completed onboarding
      const hasName = await profileHasName(sess);
      if (!mounted.current) return;

      if (hasName) {
        router.replace("/(tabs)");
      } else {
        // New user (Google OAuth, email signup, etc.) — send to onboarding
        router.replace("/(auth)/onboarding");
      }
    } finally {
      // Allow the next auth event to trigger a redirect after a short cooldown
      setTimeout(() => { isRedirecting.current = false; }, 1000);
    }
  }

  useEffect(() => {
    mounted.current = true;

    // Register listener before getSession so we don't miss rapid sign-in events
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted.current) return;
      // INITIAL_SESSION mirrors getSession() below — handled there
      if (event === "INITIAL_SESSION") return;

      setSession(newSession);

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        doRedirect(newSession);
      } else if (event === "SIGNED_OUT") {
        doRedirect(null);
      }
    });

    // Delay 500ms so the router tree is fully mounted before we navigate
    const timer = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        if (!mounted.current) return;
        if (initialRedirectDone.current) return;
        initialRedirectDone.current = true;

        setSession(currentSession);
        setReady(true);
        doRedirect(currentSession);
      });
    }, 500);

    return () => {
      mounted.current = false;
      clearTimeout(timer);
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!ready) return <KilnSplash />;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
