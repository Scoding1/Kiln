import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signUpWithEmail } from "@/lib/auth";
import { Colors } from "@/constants/colors";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SignupScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords don't match", "Please make sure both passwords are the same.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password too short", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const data = await signUpWithEmail(email.trim(), password, name.trim());

      if (!data.session) {
        // Supabase has email confirmation enabled — user must confirm before
        // they get a session, so we can't proceed to onboarding yet
        Alert.alert(
          "Check your email",
          `We sent a confirmation link to ${email.trim()}. Tap it to confirm your account, then sign in.`,
          [{ text: "Got it", onPress: () => router.replace("/(auth)/login") }]
        );
        return;
      }

      // Session exists — new user always goes to onboarding
      router.replace("/(auth)/onboarding");
    } catch (err) {
      Alert.alert("Sign up failed", errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 28,
            paddingTop: 20,
            paddingBottom: 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Back button ── */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.border,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 36,
            }}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          {/* ── Heading ── */}
          <Text
            style={{
              fontFamily: "Georgia",
              fontSize: 32,
              color: Colors.textPrimary,
              marginBottom: 6,
            }}
          >
            Create account
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: Colors.textSecondary,
              lineHeight: 22,
              marginBottom: 36,
            }}
          >
            Join Kiln and start tracking your pottery journey.
          </Text>

          {/* ── Name field ── */}
          <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginBottom: 8 }}>
            Name
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: Colors.border,
              borderRadius: 14,
              backgroundColor: Colors.surface,
              paddingHorizontal: 14,
              marginBottom: 16,
              height: 52,
            }}
          >
            <Ionicons name="person-outline" size={18} color={Colors.textTertiary} style={{ marginRight: 10 }} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your first name"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              style={{
                flex: 1,
                fontSize: 15,
                color: Colors.textPrimary,
                height: "100%",
              }}
            />
          </View>

          {/* ── Email field ── */}
          <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginBottom: 8 }}>
            Email
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: Colors.border,
              borderRadius: 14,
              backgroundColor: Colors.surface,
              paddingHorizontal: 14,
              marginBottom: 16,
              height: 52,
            }}
          >
            <Ionicons name="mail-outline" size={18} color={Colors.textTertiary} style={{ marginRight: 10 }} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              style={{
                flex: 1,
                fontSize: 15,
                color: Colors.textPrimary,
                height: "100%",
              }}
            />
          </View>

          {/* ── Password field ── */}
          <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginBottom: 8 }}>
            Password
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: Colors.border,
              borderRadius: 14,
              backgroundColor: Colors.surface,
              paddingHorizontal: 14,
              marginBottom: 16,
              height: 52,
            }}
          >
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} style={{ marginRight: 10 }} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 6 characters"
              placeholderTextColor={Colors.textTertiary}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              style={{
                flex: 1,
                fontSize: 15,
                color: Colors.textPrimary,
                height: "100%",
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          {/* ── Confirm password field ── */}
          <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginBottom: 8 }}>
            Confirm password
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: Colors.border,
              borderRadius: 14,
              backgroundColor: Colors.surface,
              paddingHorizontal: 14,
              marginBottom: 32,
              height: 52,
            }}
          >
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} style={{ marginRight: 10 }} />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.textTertiary}
              secureTextEntry={!showConfirm}
              autoComplete="new-password"
              style={{
                flex: 1,
                fontSize: 15,
                color: Colors.textPrimary,
                height: "100%",
              }}
            />
            <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Ionicons
                name={showConfirm ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          {/* ── Sign up button ── */}
          <TouchableOpacity
            onPress={handleSignUp}
            activeOpacity={0.88}
            disabled={loading}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 16,
              paddingVertical: 17,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.28,
              shadowRadius: 10,
              elevation: 6,
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={{
                  fontFamily: "Georgia",
                  fontSize: 17,
                  color: Colors.textInverse,
                  letterSpacing: 0.3,
                }}
              >
                Create account
              </Text>
            )}
          </TouchableOpacity>

          {/* ── Sign in link ── */}
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}>
            <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
              Already have an account?
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={{ fontSize: 14, color: Colors.primary, fontWeight: "600" }}>
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
