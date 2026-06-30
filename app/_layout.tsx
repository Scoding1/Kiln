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
    // screens that manage their own navigation — don't auto-redirect them
    const selfNavigating = inAuthGroup &&
      ["signup", "login", "onboarding", "confirm-email"].includes(currentScreen);

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/welcome");
    } else if (session && inAuthGroup && !selfNavigating) {
      router.replace("/(tabs)");
    } else if (session && !inAuthGroup) {
      // If email is unconfirmed and account is older than 7 days, block access
      const confirmed = !!session.user.email_confirmed_at;
      const ageDays = (Date.now() - new Date(session.user.created_at).getTime()) / 86_400_000;
      if (!confirmed && ageDays > 7) {
        router.replace("/(auth)/confirm-email");
      }
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
