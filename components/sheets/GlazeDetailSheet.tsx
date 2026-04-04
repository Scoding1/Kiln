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
import type { Glaze, FoodSafe } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true when the hex colour is light enough to need dark text on top. */
function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

// ─── Badge configs ────────────────────────────────────────────────────────────

const TYPE_META: Record<Glaze["type"], { bg: string; text: string }> = {
  Glossy: { bg: Colors.infoLight,    text: Colors.info },
  Matte:  { bg: Colors.earth[50],    text: Colors.earth[400] },
  Satin:  { bg: Colors.clay[50],     text: Colors.clay[500] },
};

const ATM_META: Record<Glaze["atmosphere"], { bg: string; text: string }> = {
  Oxidation: { bg: Colors.infoLight,    text: Colors.info },
  Reduction: { bg: Colors.warningLight, text: Colors.warning },
  Either:    { bg: Colors.smoke[100],   text: Colors.smoke[600] },
};

const FOOD_SAFE_META: Record<FoodSafe, { icon: string; bg: string; text: string; explanation: string }> = {
  "Food safe": {
    icon: "checkmark-circle",
    bg: "#E8F5EE",
    text: Colors.success,
    explanation: "This glaze has been formulated to be safe for surfaces that contact food and drink once properly fired.",
  },
  "Check with supplier": {
    icon: "alert-circle",
    bg: Colors.warningLight,
    text: Colors.warning,
    explanation: "Food safety depends on the specific batch and firing conditions. Contact your supplier or test with a certified food-safe test kit before using on functional ware.",
  },
  "Not food safe": {
    icon: "close-circle",
    bg: "#FDECEA",
    text: Colors.error,
    explanation: "This glaze contains compounds that are not safe for contact with food or drink. Use on decorative pieces only.",
  },
};

function Pill({
  label,
  bg,
  text,
}: {
  label: string;
  bg: string;
  text: string;
}) {
  return (
    <View
      className="px-3 py-1 rounded-full"
      style={{ backgroundColor: bg }}
    >
      <Text className="text-xs font-semibold" style={{ color: text }}>
        {label}
      </Text>
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  glaze: Glaze | null;
  saved: boolean;
  onClose: () => void;
  onToggleSave: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GlazeDetailSheet({ glaze, saved, onClose, onToggleSave }: Props) {
  if (!glaze) return null;

  const swatchDark = !isLight(glaze.color_hex);
  const swatchTextColor = swatchDark ? "rgba(255,255,255,0.92)" : "rgba(40,20,10,0.80)";
  const swatchSubColor = swatchDark ? "rgba(255,255,255,0.60)" : "rgba(40,20,10,0.50)";

  return (
    <Modal
      visible={!!glaze}
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
          maxHeight: "88%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 24,
        }}
      >
        {/* Handle */}
        <View className="items-center pt-3">
          <View
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: Colors.border }}
          />
        </View>

        {/* Close button — absolute so it floats over the swatch */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 10,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "rgba(0,0,0,0.25)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="close" size={18} color="#fff" />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* ── Full-width colour swatch ── */}
          <View
            style={{
              height: 200,
              backgroundColor: glaze.color_hex,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              justifyContent: "flex-end",
              padding: 20,
            }}
          >
            {/* Subtle bottom gradient via layered view */}
            <View
              style={{
                ...{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, borderRadius: 4 },
                backgroundColor: swatchDark
                  ? "rgba(0,0,0,0.28)"
                  : "rgba(255,255,255,0.22)",
              }}
              pointerEvents="none"
            />

            <Text
              style={{
                fontFamily: "Georgia",
                fontSize: 26,
                color: swatchTextColor,
                marginBottom: 4,
              }}
            >
              {glaze.name}
            </Text>
            <Text style={{ fontSize: 13, color: swatchSubColor }}>
              {glaze.type} · {glaze.cone} · {glaze.atmosphere}
            </Text>
          </View>

          {/* ── Badges ── */}
          <View className="flex-row flex-wrap gap-2 px-5 pt-4 pb-1">
            <Pill
              label={glaze.type}
              {...TYPE_META[glaze.type]}
            />
            <Pill
              label={glaze.cone}
              bg={Colors.clay[50]}
              text={Colors.clay[600]}
            />
            <Pill
              label={glaze.atmosphere}
              {...ATM_META[glaze.atmosphere]}
            />
            <Pill
              label={glaze.surface}
              bg={Colors.smoke[100]}
              text={Colors.smoke[700]}
            />
          </View>

          {/* ── Description ── */}
          <View className="px-5 pt-4 pb-5">
            <Text
              className="text-lg mb-2"
              style={{ fontFamily: "Georgia", color: Colors.textPrimary }}
            >
              About this glaze
            </Text>
            <Text
              className="text-sm leading-relaxed"
              style={{ color: Colors.textSecondary }}
            >
              {glaze.description}
            </Text>
          </View>

          {/* ── Food safety ── */}
          {(() => {
            const fs = FOOD_SAFE_META[glaze.food_safe];
            return (
              <View
                style={{
                  marginHorizontal: 20,
                  marginBottom: 20,
                  backgroundColor: fs.bg,
                  borderRadius: 14,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <Ionicons
                  name={fs.icon as React.ComponentProps<typeof Ionicons>["name"]}
                  size={22}
                  color={fs.text}
                  style={{ marginTop: 1, flexShrink: 0 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: fs.text, marginBottom: 4 }}>
                    {glaze.food_safe}
                  </Text>
                  <Text style={{ fontSize: 13, color: fs.text, lineHeight: 19, opacity: 0.85 }}>
                    {fs.explanation}
                  </Text>
                </View>
              </View>
            );
          })()}

          {/* ── Divider ── */}
          <View
            style={{
              height: 1,
              backgroundColor: Colors.border,
              marginHorizontal: 20,
              marginBottom: 20,
            }}
          />

          {/* ── Ingredients ── */}
          <View className="px-5 mb-6">
            <Text
              className="text-lg mb-4"
              style={{ fontFamily: "Georgia", color: Colors.textPrimary }}
            >
              Ingredients
            </Text>
            {glaze.ingredients.map((ing, i) => (
              <View key={i} className="mb-3">
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text
                    className="text-sm font-medium"
                    style={{ color: Colors.textPrimary }}
                  >
                    {ing.name}
                  </Text>
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: Colors.textTertiary }}
                  >
                    {ing.percentage}%
                  </Text>
                </View>
                {/* Percentage bar */}
                <View
                  style={{
                    height: 5,
                    backgroundColor: Colors.border,
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${ing.percentage}%`,
                      height: 5,
                      backgroundColor: glaze.color_hex,
                      opacity: isLight(glaze.color_hex) ? 0.55 : 0.75,
                      borderRadius: 3,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* ── Save / unsave button ── */}
          <View className="px-5">
            <TouchableOpacity
              onPress={() => onToggleSave(glaze.id)}
              className="rounded-2xl py-4 flex-row items-center justify-center gap-2"
              style={{
                backgroundColor: saved ? Colors.clay[100] : Colors.primary,
                borderWidth: saved ? 1.5 : 0,
                borderColor: saved ? Colors.primary : "transparent",
              }}
            >
              <Ionicons
                name={saved ? "heart" : "heart-outline"}
                size={18}
                color={saved ? Colors.primary : Colors.textInverse}
              />
              <Text
                className="text-base font-semibold"
                style={{ color: saved ? Colors.primary : Colors.textInverse }}
              >
                {saved ? "Saved to Collection" : "Save to Collection"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
