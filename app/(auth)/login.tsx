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
import { signInWithEmail, signInWithGoogle, signInWithApple } from "@/lib/auth";
import { Colors } from "@/constants/colors";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Divider() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 20 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
      <Text style={{ fontSize: 12, color: Colors.textTertiary, paddingHorizontal: 14, fontWeight: "500" }}>
        or
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
    </View>
  );
}

interface SocialButtonProps {
  label: string;
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  loading?: boolean;
}

function SocialButton({ label, iconName, onPress, loading }: SocialButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 15,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.surface,
        marginBottom: 12,
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : (
        <>
          <Ionicons name={iconName} size={20} color={Colors.textPrimary} />
          <Text style={{ fontSize: 15, fontWeight: "500", color: Colors.textPrimary }}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  async function handleSignIn() {
    if (!email.trim() || !password) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      // _layout.tsx will pick up the session change and redirect to /(tabs)
    } catch (err) {
      Alert.alert("Sign in failed", errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      Alert.alert("Google sign in failed", errorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleAppleSignIn() {
    setAppleLoading(true);
    try {
      await signInWithApple();
    } catch (err) {
      Alert.alert("Apple sign in failed", errorMessage(err));
    } finally {
      setAppleLoading(false);
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
            Welcome back
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: Colors.textSecondary,
              lineHeight: 22,
              marginBottom: 36,
            }}
          >
            Sign in to continue to your studio.
          </Text>

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
              marginBottom: 10,
              height: 52,
            }}
          >
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} style={{ marginRight: 10 }} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.textTertiary}
              secureTextEntry={!showPassword}
              autoComplete="current-password"
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

          {/* ── Forgot password ── */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={{ alignSelf: "flex-end", marginBottom: 28 }}
          >
            <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: "500" }}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* ── Sign in button ── */}
          <TouchableOpacity
            onPress={handleSignIn}
            activeOpacity={0.88}
            disabled={loading}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 16,
              paddingVertical: 17,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
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
                Sign in
              </Text>
            )}
          </TouchableOpacity>

          {/* ── Divider ── */}
          <Divider />

          {/* ── Google ── */}
          <SocialButton
            label="Continue with Google"
            iconName="logo-google"
            onPress={handleGoogleSignIn}
            loading={googleLoading}
          />

          {/* ── Apple (iOS / macOS only) ── */}
          {Platform.OS === "ios" && (
            <SocialButton
              label="Continue with Apple"
              iconName="logo-apple"
              onPress={handleAppleSignIn}
              loading={appleLoading}
            />
          )}

          {/* ── Create account ── */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 12, gap: 4 }}>
            <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
              Don't have an account?
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/(auth)/onboarding")}
            >
              <Text style={{ fontSize: 14, color: Colors.primary, fontWeight: "600" }}>
                Create one
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
