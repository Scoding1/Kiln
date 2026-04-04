import "../global.css";

import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";
import { Colors } from "@/constants/colors";

// ─── Splash shown while we check auth + onboarding state ─────────────────────

function KilnSplash() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: "Georgia",
          fontSize: 44,
          color: Colors.primary,
          letterSpacing: 1,
        }}
      >
        Kiln
      </Text>
    </View>
  );
}

// ─── Root layout ──────────────────────────────────────────────────────────────

export default function RootLayout() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();

  // null = still loading, true/false = known
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [session, setLocalSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    async function init() {
      const [onboardingVal, { data: { session: currentSession } }] = await Promise.all([
        AsyncStorage.getItem("kiln_onboarded"),
        supabase.auth.getSession(),
      ]);

      setSession(currentSession);
      setLocalSession(currentSession);
      setOnboarded(onboardingVal === "1");
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLocalSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, [setSession]);

  // Navigate once both onboarding and session are known
  useEffect(() => {
    if (onboarded === null || session === undefined) return; // still loading

    if (!onboarded) {
      // Brand new user — hasn't completed onboarding yet
      router.replace("/(auth)/welcome");
    } else if (!session) {
      // Completed onboarding but not signed in
      router.replace("/(auth)/login");
    } else {
      // Fully authenticated
      router.replace("/(tabs)");
    }
  }, [onboarded, session]);

  // Show splash while loading to avoid flash of wrong screen
  if (onboarded === null || session === undefined) {
    return <KilnSplash />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
