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
import { getStockStatus, UNIT_STEP } from "@/lib/types";
import type { Material } from "@/lib/types";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_META = {
  low:          { bg: Colors.errorLight,   text: Colors.error,   label: "Low Stock",    border: Colors.error },
  "running-low":{ bg: Colors.warningLight, text: Colors.warning, label: "Running Low",  border: Colors.warning },
  good:         { bg: Colors.successLight, text: Colors.success, label: "Good",         border: Colors.success },
};

const CAT_META = {
  Clay:  { bg: Colors.clay[50],     text: Colors.clay[600] },
  Glaze: { bg: Colors.infoLight,    text: Colors.info },
  Other: { bg: Colors.smoke[100],   text: Colors.smoke[700] },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  material: Material | null;
  onClose: () => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRestock: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MaterialDetailSheet({
  material,
  onClose,
  onUpdateQuantity,
  onRestock,
}: Props) {
  if (!material) return null;
  const m = material; // non-nullable alias for use inside closures

  const status = getStockStatus(m);
  const statusMeta = STATUS_META[status];
  const catMeta = CAT_META[m.category];
  const step = UNIT_STEP[m.unit];
  const fillPct = Math.min(m.quantity / m.maxQuantity, 1) * 100;
  const isRestocked = m.quantity >= m.maxQuantity;

  function decrement() {
    const next = Math.max(0, m.quantity - step);
    onUpdateQuantity(m.id, next);
  }

  function increment() {
    const next = Math.min(m.maxQuantity, m.quantity + step);
    onUpdateQuantity(m.id, next);
  }

  return (
    <Modal
      visible={!!material}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(40,20,10,0.45)" }}
        onPress={onClose}
      />

      <View
        style={{
          backgroundColor: Colors.background,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          maxHeight: "75%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 24,
        }}
      >
        {/* Handle */}
        <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border }} />
        </View>

        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 16,
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text
              style={{
                fontFamily: "Georgia",
                fontSize: 22,
                color: Colors.textPrimary,
                marginBottom: 6,
              }}
            >
              {m.name}
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View
                style={{
                  backgroundColor: catMeta.bg,
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: catMeta.text }}>
                  {m.category}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: statusMeta.bg,
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: statusMeta.text }}>
                  {statusMeta.label}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: Colors.surface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 36 }}
        >
          {/* ── Quantity adjuster ── */}
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 20,
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 12, color: Colors.textTertiary, marginBottom: 16, fontWeight: "500", letterSpacing: 0.5, textTransform: "uppercase" }}>
              Current Quantity
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 24, marginBottom: 20 }}>
              {/* Minus */}
              <TouchableOpacity
                onPress={decrement}
                disabled={m.quantity <= 0}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: m.quantity <= 0 ? Colors.smoke[100] : Colors.surface,
                  borderWidth: 1.5,
                  borderColor: m.quantity <= 0 ? Colors.border : Colors.clay[300],
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="remove"
                  size={22}
                  color={m.quantity <= 0 ? Colors.textTertiary : Colors.primary}
                />
              </TouchableOpacity>

              {/* Quantity display */}
              <View style={{ alignItems: "center", minWidth: 100 }}>
                <Text
                  style={{
                    fontFamily: "Georgia",
                    fontSize: 42,
                    color: Colors.textPrimary,
                    lineHeight: 48,
                  }}
                >
                  {m.quantity}
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textTertiary, marginTop: 2 }}>
                  {m.unit}
                </Text>
              </View>

              {/* Plus */}
              <TouchableOpacity
                onPress={increment}
                disabled={isRestocked}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: isRestocked ? Colors.smoke[100] : Colors.primary,
                  borderWidth: 1.5,
                  borderColor: isRestocked ? Colors.border : Colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="add"
                  size={22}
                  color={isRestocked ? Colors.textTertiary : Colors.textInverse}
                />
              </TouchableOpacity>
            </View>

            {/* Progress bar */}
            <View style={{ width: "100%", marginBottom: 8 }}>
              <View
                style={{
                  height: 8,
                  backgroundColor: Colors.border,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${fillPct}%`,
                    height: 8,
                    backgroundColor: statusMeta.border,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>

            <Text style={{ fontSize: 12, color: Colors.textTertiary }}>
              {m.quantity} of {m.maxQuantity} {m.unit} · Alert below {m.alertThreshold} {m.unit}
            </Text>
          </View>

          {/* ── Mark as restocked ── */}
          <TouchableOpacity
            onPress={() => { onRestock(m.id); onClose(); }}
            disabled={isRestocked}
            style={{
              backgroundColor: isRestocked ? Colors.smoke[100] : Colors.primary,
              borderRadius: 16,
              paddingVertical: 15,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={isRestocked ? Colors.textTertiary : Colors.textInverse}
            />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: isRestocked ? Colors.textTertiary : Colors.textInverse,
              }}
            >
              {isRestocked ? "Already Full" : "Mark as Restocked"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}
