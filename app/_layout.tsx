import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { SessionProvider, useSession } from "../lib/AuthContext";

function AuthGuard() {
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const currentScreen = (segments as string[])[1] ?? "";
    // signup, login, and onboarding all manage their own post-auth navigation —
    // suppress the auto-redirect so AuthGuard doesn't race them to /(tabs)
    const selfNavigating = inAuthGroup && ["signup", "login", "onboarding"].includes(currentScreen);

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/welcome");
    } else if (session && inAuthGroup && !selfNavigating) {
      router.replace("/(tabs)");
    }
  }, [session, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" />
      </Stack>
    </SessionProvider>
  );
}
