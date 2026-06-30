import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/AuthContext";
import { Colors } from "@/constants/colors";

// ─── Step data ────────────────────────────────────────────────────────────────

const EXPERIENCE_OPTIONS = [
  {
    id: "beginner",
    emoji: "🌱",
    label: "Complete beginner",
    sub: "Never touched clay",
  },
  {
    id: "starting",
    emoji: "🎯",
    label: "Just getting started",
    sub: "Had a few sessions",
  },
  {
    id: "hobbyist",
    emoji: "🏺",
    label: "Hobbyist",
    sub: "Comfortable on the wheel",
  },
  {
    id: "experienced",
    emoji: "⭐",
    label: "More experienced",
    sub: "Know what I am doing",
  },
];

const WORK_TYPE_OPTIONS = [
  { id: "wheel",     emoji: "🎡", label: "Wheel throwing" },
  { id: "handbuilt", emoji: "🤲", label: "Hand-building"  },
  { id: "studio",    emoji: "🏫", label: "Studio class"   },
  { id: "home",      emoji: "🏠", label: "Home studio"    },
];

const GOAL_OPTIONS = [
  { id: "projects",   emoji: "📋", label: "Track my projects" },
  { id: "techniques", emoji: "📚", label: "Learn techniques"  },
  { id: "glazes",     emoji: "🎨", label: "Explore glazes"    },
  { id: "all",        emoji: "✨", label: "All of the above"  },
];

// ─── Shared primitives ────────────────────────────────────────────────────────

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === current ? Colors.primary : Colors.clay[100],
            borderWidth: i < current ? 0 : 0,
          }}
        />
      ))}
    </View>
  );
}

function StepHeader({
  question,
  sub,
}: {
  question: string;
  sub?: string;
}) {
  return (
    <View style={{ marginBottom: 28 }}>
      <Text
        style={{
          fontFamily: "Georgia",
          fontSize: 26,
          color: Colors.textPrimary,
          marginBottom: sub ? 8 : 0,
          lineHeight: 34,
        }}
      >
        {question}
      </Text>
      {sub ? (
        <Text style={{ fontSize: 15, color: Colors.textSecondary, lineHeight: 22 }}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

// ─── Step 0: Name ─────────────────────────────────────────────────────────────

function StepName({
  value,
  onChange,
  onContinue,
}: {
  value: string;
  onChange: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <StepHeader
        question="What's your name?"
        sub="We'll use this to personalise your experience."
      />

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Your first name"
        placeholderTextColor={Colors.textTertiary}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={() => value.trim() && onContinue()}
        style={{
          backgroundColor: Colors.surface,
          borderWidth: 1.5,
          borderColor: value.trim() ? Colors.primary : Colors.border,
          borderRadius: 16,
          paddingHorizontal: 18,
          paddingVertical: 16,
          fontSize: 18,
          color: Colors.textPrimary,
          marginBottom: 8,
          fontFamily: "Georgia",
          ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
        }}
      />

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        onPress={onContinue}
        disabled={!value.trim()}
        activeOpacity={0.88}
        style={{
          backgroundColor: value.trim() ? Colors.primary : Colors.clay[200],
          borderRadius: 20,
          paddingVertical: 17,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: "Georgia",
            fontSize: 17,
            color: value.trim() ? Colors.textInverse : Colors.clay[400],
          }}
        >
          Continue
        </Text>
      </TouchableOpacity>

    </View>
  );
}

// ─── Step 1: Experience ───────────────────────────────────────────────────────

function StepExperience({
  selected,
  onSelect,
  onContinue,
  onBack,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <StepHeader question="How would you describe yourself?" />

      <View style={{ gap: 10, marginBottom: 8 }}>
        {EXPERIENCE_OPTIONS.map((opt) => {
          const active = selected === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => onSelect(opt.id)}
              activeOpacity={0.85}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                padding: 16,
                borderRadius: 16,
                backgroundColor: active ? Colors.clay[50] : Colors.surface,
                borderWidth: active ? 2 : 1,
                borderColor: active ? Colors.primary : Colors.border,
              }}
            >
              <Text style={{ fontSize: 28 }}>{opt.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: active ? Colors.primaryDark : Colors.textPrimary,
                    marginBottom: 2,
                  }}
                >
                  {opt.label}
                </Text>
                <Text style={{ fontSize: 13, color: Colors.textTertiary }}>
                  {opt.sub}
                </Text>
              </View>
              {active && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />
      <ContinueRow onContinue={onContinue} onBack={onBack} canContinue={!!selected} />
    </View>
  );
}

// ─── Step 2: Work type (multi-select) ─────────────────────────────────────────

function StepWorkType({
  selected,
  onToggle,
  onContinue,
  onBack,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <StepHeader
        question="What do you mainly work with?"
        sub="Select all that apply."
      />

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 8,
        }}
      >
        {WORK_TYPE_OPTIONS.map((opt) => {
          const active = selected.includes(opt.id);
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => onToggle(opt.id)}
              activeOpacity={0.85}
              style={{
                width: "47%",
                padding: 18,
                borderRadius: 16,
                alignItems: "center",
                backgroundColor: active ? Colors.clay[50] : Colors.surface,
                borderWidth: active ? 2 : 1,
                borderColor: active ? Colors.primary : Colors.border,
              }}
            >
              <Text style={{ fontSize: 32, marginBottom: 8 }}>{opt.emoji}</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: active ? Colors.primaryDark : Colors.textPrimary,
                  textAlign: "center",
                }}
              >
                {opt.label}
              </Text>
              {active && (
                <View
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: Colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />
      <ContinueRow
        onContinue={onContinue}
        onBack={onBack}
        canContinue={selected.length > 0}
        continueLabel={selected.length === 0 ? "Select at least one" : "Continue"}
      />
    </View>
  );
}

// ─── Step 3: Goal ─────────────────────────────────────────────────────────────

function StepGoal({
  selected,
  onToggle,
  onContinue,
  onBack,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <StepHeader
        question="What do you most want from Kiln?"
        sub="Select all that apply."
      />

      <View style={{ gap: 10, marginBottom: 8 }}>
        {GOAL_OPTIONS.map((opt) => {
          const active = selected.includes(opt.id);
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => onToggle(opt.id)}
              activeOpacity={0.85}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                padding: 16,
                borderRadius: 16,
                backgroundColor: active ? Colors.clay[50] : Colors.surface,
                borderWidth: active ? 2 : 1,
                borderColor: active ? Colors.primary : Colors.border,
              }}
            >
              <Text style={{ fontSize: 26 }}>{opt.emoji}</Text>
              <Text
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: "600",
                  color: active ? Colors.primaryDark : Colors.textPrimary,
                }}
              >
                {opt.label}
              </Text>
              {active && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />
      <ContinueRow onContinue={onContinue} onBack={onBack} canContinue={selected.length > 0} />
    </View>
  );
}

// ─── Final confirmation screen ────────────────────────────────────────────────

function StepFinal({
  name,
  experience,
  workTypes,
  goal,
  onOpen,
}: {
  name: string;
  experience: string;
  workTypes: string[];
  goal: string[];
  onOpen: () => void;
}) {
  const displayName = name.trim() || "Potter";

  const experienceLabel =
    EXPERIENCE_OPTIONS.find((o) => o.id === experience)?.label ?? "";
  const workLabels = WORK_TYPE_OPTIONS.filter((o) =>
    workTypes.includes(o.id)
  ).map((o) => o.label);
  const goalLabels = GOAL_OPTIONS.filter((o) => goal.includes(o.id)).map((o) => o.label);

  const chips = [
    ...(experienceLabel ? [experienceLabel] : []),
    ...workLabels,
    ...goalLabels,
  ];

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {/* Celebration icon */}
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: Colors.clay[50],
          borderWidth: 2,
          borderColor: Colors.clay[100],
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 44 }}>🎉</Text>
      </View>

      <Text
        style={{
          fontFamily: "Georgia",
          fontSize: 28,
          color: Colors.textPrimary,
          textAlign: "center",
          marginBottom: 10,
          lineHeight: 36,
        }}
      >
        You're all set,{"\n"}{displayName}!
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: Colors.textSecondary,
          textAlign: "center",
          lineHeight: 22,
          marginBottom: 28,
          paddingHorizontal: 16,
        }}
      >
        Here's what we know about you so far.
      </Text>

      {/* Chips summary */}
      {chips.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 8,
            marginBottom: 36,
            paddingHorizontal: 8,
          }}
        >
          {chips.map((chip) => (
            <View
              key={chip}
              style={{
                backgroundColor: Colors.clay[50],
                borderRadius: 20,
                borderWidth: 1,
                borderColor: Colors.clay[100],
                paddingHorizontal: 14,
                paddingVertical: 7,
              }}
            >
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: Colors.primaryDark }}
              >
                {chip}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Open Kiln */}
      <TouchableOpacity
        onPress={onOpen}
        activeOpacity={0.88}
        style={{
          backgroundColor: Colors.primary,
          borderRadius: 20,
          paddingVertical: 17,
          paddingHorizontal: 48,
          alignItems: "center",
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
          }}
        >
          Open Kiln
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Shared bottom row ────────────────────────────────────────────────────────

function ContinueRow({
  onContinue,
  onBack,
  canContinue,
  continueLabel = "Continue",
}: {
  onContinue: () => void;
  onBack: () => void;
  canContinue: boolean;
  continueLabel?: string;
}) {
  return (
    <View style={{ gap: 10 }}>
      <TouchableOpacity
        onPress={canContinue ? onContinue : undefined}
        activeOpacity={0.88}
        style={{
          backgroundColor: canContinue ? Colors.primary : Colors.clay[200],
          borderRadius: 20,
          paddingVertical: 17,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "Georgia",
            fontSize: 17,
            color: canContinue ? Colors.textInverse : Colors.clay[400],
          }}
        >
          {continueLabel}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onBack}
        style={{
          paddingVertical: 12,
          alignItems: "center",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: Colors.border,
        }}
      >
        <Text style={{ fontSize: 15, color: Colors.textSecondary, fontWeight: "500" }}>
          Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const { setSession } = useSession();
  const [step, setStep] = useState(0);

  // Answers
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [goal, setGoal] = useState<string[]>([]);

  function toggleWorkType(id: string) {
    setWorkTypes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleGoal(id: string) {
    setGoal((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const isFinal = step === 4;

  async function handleOpenKiln() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("profiles") as any)
        .update({
          name: name.trim() || (session.user.user_metadata?.name as string) || "",
          experience_level: experience || null,
          goals: [...workTypes, ...goal],
        })
        .eq("id", session.user.id);
      // Sync AuthContext before navigating so AuthGuard sees session !== null
      // and doesn't bounce the user back to the welcome screen
      setSession(session);
    }
    router.replace("/(tabs)");
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
            flexGrow: 1,
            paddingHorizontal: 28,
            paddingTop: 24,
            paddingBottom: 16,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress dots — only on steps 0-3 */}
          {!isFinal && <ProgressDots total={4} current={step} />}

          {/* Step content */}
          {step === 0 && (
            <StepName
              value={name}
              onChange={setName}
              onContinue={() => setStep(1)}
            />
          )}

          {step === 1 && (
            <StepExperience
              selected={experience}
              onSelect={setExperience}
              onContinue={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}

          {step === 2 && (
            <StepWorkType
              selected={workTypes}
              onToggle={toggleWorkType}
              onContinue={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <StepGoal
              selected={goal}
              onToggle={toggleGoal}
              onContinue={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {isFinal && (
            <StepFinal
              name={name}
              experience={experience}
              workTypes={workTypes}
              goal={goal}
              onOpen={handleOpenKiln}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
