import { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { Technique, TechniqueStep } from "@/lib/types";

// ─── Category badge colours ───────────────────────────────────────────────────

const CAT_META: Record<Technique["category"], { bg: string; text: string }> = {
  Throwing:       { bg: Colors.infoLight,    text: Colors.info },
  "Hand-building":{ bg: Colors.clay[50],     text: Colors.clay[500] },
  Glazing:        { bg: Colors.successLight, text: Colors.success },
  Finishing:      { bg: Colors.warningLight, text: Colors.warning },
};

const LEVEL_META: Record<Technique["level"], { bg: string; text: string }> = {
  Beginner:     { bg: Colors.successLight, text: Colors.success },
  Intermediate: { bg: Colors.warningLight, text: Colors.warning },
  Advanced:     { bg: Colors.clay[100],    text: Colors.clay[600] },
};

// ─── Single step row ──────────────────────────────────────────────────────────

function StepRow({
  step,
  index,
  completed,
  selectedMethod,
  onToggle,
  onSelectMethod,
}: {
  step: TechniqueStep;
  index: number;
  completed: boolean;
  selectedMethod: string | null;
  onToggle: () => void;
  onSelectMethod: (methodId: string) => void;
}) {
  const hasMethods = !!step.methods?.length;
  const activeMethod = hasMethods
    ? step.methods!.find((m) => m.id === selectedMethod) ?? null
    : null;

  const instruction = activeMethod ? activeMethod.instruction : step.detail;

  return (
    <View
      style={{
        backgroundColor: completed ? Colors.clay[50] : Colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: completed ? Colors.clay[200] : Colors.border,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* ── Header row: number · title · time · checkbox ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 10,
          marginBottom: hasMethods || instruction ? 12 : 0,
        }}
      >
        {/* Step number circle */}
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: completed ? Colors.primary : Colors.background,
            borderWidth: completed ? 0 : 1.5,
            borderColor: Colors.clay[300],
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          {completed ? (
            <Ionicons name="checkmark" size={14} color={Colors.textInverse} />
          ) : (
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: Colors.clay[500],
              }}
            >
              {index + 1}
            </Text>
          )}
        </View>

        {/* Title + time */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: completed ? Colors.clay[600] : Colors.textPrimary,
              marginBottom: 3,
            }}
          >
            {step.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="time-outline" size={12} color={Colors.textTertiary} />
            <Text style={{ fontSize: 12, color: Colors.textTertiary }}>
              {step.timeEstimate}
            </Text>
          </View>
        </View>

        {/* Tick button */}
        <TouchableOpacity
          onPress={onToggle}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: completed ? Colors.primary : Colors.background,
            borderWidth: 1.5,
            borderColor: completed ? Colors.primary : Colors.border,
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {completed && (
            <Ionicons name="checkmark" size={16} color={Colors.textInverse} />
          )}
        </TouchableOpacity>
      </View>

      {/* ── Method selector pills ── */}
      {hasMethods && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 12,
            marginLeft: 36,
          }}
        >
          {step.methods!.map((method) => {
            const active = selectedMethod === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                onPress={() => onSelectMethod(method.id)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: active ? Colors.primary : Colors.background,
                  borderWidth: 1.5,
                  borderColor: active ? Colors.primary : Colors.clay[200],
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: active ? "600" : "400",
                    color: active ? Colors.textInverse : Colors.textSecondary,
                  }}
                >
                  {method.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ── Instruction text ── */}
      {instruction ? (
        <View style={{ marginLeft: 36 }}>
          {hasMethods && !activeMethod && (
            <Text
              style={{
                fontSize: 13,
                color: Colors.textTertiary,
                fontStyle: "italic",
                marginBottom: 4,
              }}
            >
              Select a method above to see instructions.
            </Text>
          )}
          {(activeMethod || !hasMethods) && (
            <Text
              style={{
                fontSize: 14,
                color: completed ? Colors.clay[600] : Colors.textSecondary,
                lineHeight: 22,
              }}
            >
              {instruction}
            </Text>
          )}
        </View>
      ) : null}

      {/* ── Pro tip callout ── */}
      {(() => {
        const tip =
          (hasMethods && selectedMethod && step.methodProTips?.[selectedMethod]) ||
          (!hasMethods && step.pro_tip) ||
          null;
        if (!tip) return null;
        return (
          <View
            style={{
              marginLeft: 36,
              marginTop: 10,
              backgroundColor: Colors.clay[50],
              borderRadius: 10,
              borderWidth: 1,
              borderColor: Colors.clay[100],
              padding: 12,
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <Ionicons name="bulb-outline" size={15} color={Colors.clay[500]} style={{ marginTop: 1, flexShrink: 0 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.clay[500], marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Pro tip
              </Text>
              <Text style={{ fontSize: 13, color: Colors.clay[600], lineHeight: 19 }}>
                {tip}
              </Text>
            </View>
          </View>
        );
      })()}
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  technique: Technique | null;
  completedStepIds: Set<string>;
  onClose: () => void;
  onToggleStep: (techniqueId: string, stepId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TechniqueDetailSheet({
  technique,
  completedStepIds,
  onClose,
  onToggleStep,
}: Props) {
  // stepId → methodId; lives here because it's presentation-only UI state
  const [selectedMethods, setSelectedMethods] = useState<Record<string, string>>({});

  // Reset method selections when a different technique opens
  useEffect(() => {
    setSelectedMethods({});
  }, [technique?.id]);

  if (!technique) return null;

  const catMeta = CAT_META[technique.category];
  const levelMeta = LEVEL_META[technique.level];
  const completedCount = completedStepIds.size;
  const totalSteps = technique.steps.length;
  const allDone = completedCount === totalSteps;

  // Compute displayed tools: base tools + method-specific tool if a method is selected
  const displayTools: string[] = (() => {
    if (!technique.tools?.length) return [];
    const base = [...technique.tools];
    for (const step of technique.steps) {
      if (step.methodTools) {
        const selectedMethodId = selectedMethods[step.id];
        if (selectedMethodId && step.methodTools[selectedMethodId]) {
          return [...base, ...step.methodTools[selectedMethodId]];
        }
      }
    }
    return base;
  })();

  function handleSelectMethod(stepId: string, methodId: string) {
    setSelectedMethods((prev) => ({
      ...prev,
      [stepId]: prev[stepId] === methodId ? "" : methodId,
    }));
  }

  return (
    <Modal
      visible={!!technique}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Scrim */}
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(40,20,10,0.45)" }}
        onPress={onClose}
      />

      {/* Sheet */}
      <View
        style={{
          backgroundColor: Colors.background,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          maxHeight: "92%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 24,
        }}
      >
        {/* ── Large video area ── */}
        <View
          style={{
            height: 210,
            backgroundColor: technique.thumbnailColor,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <View
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -20,
              left: -20,
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: "rgba(255,255,255,0.06)",
            }}
          />

          {/* Play button */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "rgba(255,255,255,0.22)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: "rgba(255,255,255,0.90)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="play"
                size={22}
                color={technique.thumbnailColor}
                style={{ marginLeft: 3 }}
              />
            </View>
          </View>

          {/* Bottom-left badges */}
          <View
            style={{
              position: "absolute",
              bottom: 14,
              left: 16,
              flexDirection: "row",
              gap: 8,
            }}
          >
            <View
              style={{
                backgroundColor: catMeta.bg,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "600", color: catMeta.text }}>
                {technique.category}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "rgba(0,0,0,0.30)",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <Ionicons name="time-outline" size={11} color="rgba(255,255,255,0.90)" />
              <Text
                style={{ fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.90)" }}
              >
                {technique.duration}
              </Text>
            </View>
          </View>

          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "rgba(0,0,0,0.28)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Handle */}
        <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 2 }}>
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: Colors.border,
            }}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        >
          {/* ── Title block ── */}
          <View style={{ paddingTop: 10, paddingBottom: 16 }}>
            <Text
              style={{
                fontFamily: "Georgia",
                fontSize: 24,
                color: Colors.textPrimary,
                marginBottom: 8,
              }}
            >
              {technique.name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View
                style={{
                  backgroundColor: levelMeta.bg,
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: "600", color: levelMeta.text }}
                >
                  {technique.level}
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: Colors.textTertiary }}>
                {completedCount} of {totalSteps} steps complete
              </Text>
            </View>
          </View>

          {/* ── You'll need ── */}
          {displayTools.length > 0 && (
            <View style={{ marginBottom: 18 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: Colors.textTertiary,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  marginBottom: 8,
                }}
              >
                You'll need
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
                {displayTools.map((tool) => (
                  <View
                    key={tool}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                      backgroundColor: Colors.surface,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}
                  >
                    <Ionicons name="construct-outline" size={12} color={Colors.textTertiary} />
                    <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                      {tool}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Progress bar ── */}
          <View
            style={{
              height: 6,
              backgroundColor: Colors.border,
              borderRadius: 3,
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: `${(completedCount / totalSteps) * 100}%`,
                height: 6,
                backgroundColor: allDone ? Colors.success : Colors.primary,
                borderRadius: 3,
              }}
            />
          </View>

          {/* ── Steps ── */}
          {technique.steps.map((step, i) => (
            <StepRow
              key={step.id}
              step={step}
              index={i}
              completed={completedStepIds.has(step.id)}
              selectedMethod={selectedMethods[step.id] ?? null}
              onToggle={() => onToggleStep(technique.id, step.id)}
              onSelectMethod={(methodId) => handleSelectMethod(step.id, methodId)}
            />
          ))}

          {/* ── All done banner ── */}
          {allDone && (
            <View
              style={{
                backgroundColor: Colors.successLight,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: Colors.success + "40",
                padding: 18,
                alignItems: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              <Text style={{ fontSize: 28 }}>🎉</Text>
              <Text
                style={{
                  fontFamily: "Georgia",
                  fontSize: 17,
                  color: Colors.success,
                  textAlign: "center",
                }}
              >
                Technique complete!
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: Colors.success,
                  textAlign: "center",
                  opacity: 0.8,
                }}
              >
                Great work. Try applying this on your next project.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
