import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/AuthContext";
import { Colors } from "@/constants/colors";

export default function ConfirmEmailScreen() {
  const { session, signOut } = useSession();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const email = session?.user.email ?? "";

  async function handleResend() {
    if (!email || resending) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      setResent(true);
    } catch (err) {
      Alert.alert("Couldn't resend", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setResending(false);
    }
  }

  async function handleSignOut() {
    await signOut();
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.background }}
      edges={["top", "bottom"]}
    >
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        {/* Icon */}
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: Colors.warningLight,
            borderWidth: 2,
            borderColor: Colors.warning + "40",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Ionicons name="mail-outline" size={40} color={Colors.warning} />
        </View>

        {/* Heading */}
        <Text
          style={{
            fontFamily: "Georgia",
            fontSize: 26,
            color: Colors.textPrimary,
            textAlign: "center",
            marginBottom: 10,
            lineHeight: 34,
          }}
        >
          Please confirm{"\n"}your email
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: Colors.textSecondary,
            textAlign: "center",
            lineHeight: 22,
            marginBottom: 8,
          }}
        >
          We sent a confirmation link to
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: Colors.textPrimary,
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          {email}
        </Text>

        {/* Resend button */}
        {resent ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: Colors.successLight,
              borderRadius: 14,
              paddingHorizontal: 20,
              paddingVertical: 14,
              marginBottom: 12,
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={{ fontSize: 15, fontWeight: "600", color: Colors.success }}>
              Email sent — check your inbox
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleResend}
            disabled={resending}
            activeOpacity={0.88}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 16,
              paddingVertical: 16,
              paddingHorizontal: 24,
              width: "100%",
              alignItems: "center",
              marginBottom: 12,
              opacity: resending ? 0.7 : 1,
            }}
          >
            <Text style={{ fontFamily: "Georgia", fontSize: 16, color: Colors.textInverse }}>
              {resending ? "Sending…" : "Resend confirmation email"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Sign out */}
        <TouchableOpacity onPress={handleSignOut} style={{ paddingVertical: 12 }}>
          <Text style={{ fontSize: 14, color: Colors.textTertiary }}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
