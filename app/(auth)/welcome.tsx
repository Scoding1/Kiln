import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";

// ─── Feature list ─────────────────────────────────────────────────────────────

const FEATURES = [
  { num: "01", text: "Track every project from wedging to firing" },
  { num: "02", text: "Explore glazes with firing info and food safety details" },
  { num: "03", text: "Learn techniques with step-by-step visual guides" },
  { num: "04", text: "Manage your clay, glazes and tool kit in one place" },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WelcomeScreen() {
  const router = useRouter();

  function handleAlreadyHaveAccount() {
    router.push("/(auth)/login");
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* ── Hero ── */}
      <View
        style={{
          backgroundColor: Colors.clay[600],
          paddingTop: Platform.OS === "ios" ? 64 : 48,
          paddingBottom: 48,
          paddingHorizontal: 28,
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background circles */}
        <View
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 60,
            left: 20,
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        />

        {/* Pottery emoji */}
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: "rgba(255,255,255,0.14)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 22,
          }}
        >
          <Text style={{ fontSize: 48 }}>🏺</Text>
        </View>

        {/* Logo */}
        <Text
          style={{
            fontFamily: "Georgia",
            fontSize: 44,
            color: Colors.textInverse,
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          Kiln
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: Colors.clay[200],
            textAlign: "center",
            lineHeight: 24,
          }}
        >
          Your pottery companion
        </Text>
      </View>

      {/* ── Content ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 28,
          paddingTop: 32,
          paddingBottom: Platform.OS === "ios" ? 48 : 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Feature list */}
        <Text
          style={{
            fontFamily: "Georgia",
            fontSize: 20,
            color: Colors.textPrimary,
            marginBottom: 20,
          }}
        >
          Everything you need at the wheel
        </Text>

        <View style={{ marginBottom: 36, gap: 14 }}>
          {FEATURES.map((f) => (
            <View
              key={f.num}
              style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}
            >
              {/* Number pill */}
              <View
                style={{
                  minWidth: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: Colors.clay[50],
                  borderWidth: 1,
                  borderColor: Colors.clay[100],
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: Colors.primary,
                    letterSpacing: 0.5,
                  }}
                >
                  {f.num}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 15,
                  color: Colors.textSecondary,
                  lineHeight: 22,
                  flex: 1,
                  paddingTop: 5,
                }}
              >
                {f.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Get started button */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/onboarding")}
          activeOpacity={0.88}
          style={{
            backgroundColor: Colors.primary,
            borderRadius: 20,
            paddingVertical: 17,
            alignItems: "center",
            marginBottom: 14,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.28,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <Text
            style={{
              fontFamily: "Georgia",
              fontSize: 17,
              color: Colors.textInverse,
              letterSpacing: 0.3,
            }}
          >
            Get started
          </Text>
        </TouchableOpacity>

        {/* Already have account */}
        <TouchableOpacity
          onPress={handleAlreadyHaveAccount}
          activeOpacity={0.7}
          style={{
            paddingVertical: 14,
            alignItems: "center",
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: Colors.border,
          }}
        >
          <Text style={{ fontSize: 15, color: Colors.textSecondary, fontWeight: "500" }}>
            I already have an account
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
