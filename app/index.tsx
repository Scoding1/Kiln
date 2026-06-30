import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";

function KilnSplash() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FDFAF7", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontFamily: "Georgia", fontSize: 44, color: "#C4845A", letterSpacing: 1 }}>
        Kiln
      </Text>
    </View>
  );
}

export default function IndexScreen() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/welcome");
      }
    });

    // React to future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === "SIGNED_IN") {
        router.replace("/(tabs)");
      } else if (event === "SIGNED_OUT") {
        router.replace("/(auth)/welcome");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <KilnSplash />;
}
