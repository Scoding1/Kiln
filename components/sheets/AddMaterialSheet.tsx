import { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { Material, MaterialCategory, MaterialUnit } from "@/lib/types";
import { supabase } from "@/lib/supabase";

const CATEGORIES: MaterialCategory[] = ["Clay", "Glaze", "Other"];
const UNITS: MaterialUnit[] = ["kg", "g", "L", "ml"];

const CAT_META: Record<MaterialCategory, { bg: string; text: string; activeBg: string; activeText: string }> = {
  Clay:  { bg: Colors.surface, text: Colors.textSecondary, activeBg: Colors.clay[100],  activeText: Colors.clay[600] },
  Glaze: { bg: Colors.surface, text: Colors.textSecondary, activeBg: Colors.infoLight,  activeText: Colors.info },
  Other: { bg: Colors.surface, text: Colors.textSecondary, activeBg: Colors.smoke[200], activeText: Colors.smoke[700] },
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (material: Material) => void;
}

export function AddMaterialSheet({ visible, onClose, onAdd }: Props) {
  const [category, setCategory] = useState<MaterialCategory>("Clay");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<MaterialUnit>("kg");
  const [maxQuantity, setMaxQuantity] = useState("");
  const [threshold, setThreshold] = useState("");

  function reset() {
    setCategory("Clay");
    setName("");
    setQuantity("");
    setUnit("kg");
    setMaxQuantity("");
    setThreshold("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSave() {
    const qty = parseFloat(quantity) || 0;
    const max = parseFloat(maxQuantity) || qty * 2 || 10;
    const thresh = parseFloat(threshold) || Math.round(max * 0.2);

    const session = await supabase.auth.getSession();
    const uid = session.data.session?.user.id;
    if (!uid) {
      Alert.alert("Not signed in", "Please sign in before adding materials.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("inventory") as any)
      .insert({
        user_id: uid,
        name: name.trim(),
        category,
        quantity: qty,
        unit,
        max_quantity: max,
        alert_threshold: thresh,
      })
      .select()
      .single();

    if (error) {
      Alert.alert("Save failed", error.message ?? "Unknown error");
      console.log("insert material error", error);
      return;
    }

    const material: Material = {
      id: data.id,
      name: data.name,
      category: data.category,
      quantity: Number(data.quantity),
      unit: data.unit,
      maxQuantity: Number(data.max_quantity),
      alertThreshold: Number(data.alert_threshold),
    };
    onAdd(material);
    reset();
    onClose();
  }

  const canSave = name.trim().length > 0 && quantity.length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(40,20,10,0.45)" }}
          onPress={handleClose}
        />

        <View
          style={{
            backgroundColor: Colors.background,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: "86%",
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
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
          >
            <Text style={{ fontFamily: "Georgia", fontSize: 21, color: Colors.textPrimary }}>
              Add Material
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={{
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: Colors.surface,
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
          >
            {/* ── Category ── */}
            <View style={{ marginBottom: 20 }}>
              <Text style={labelStyle}>Category</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {CATEGORIES.map((cat) => {
                  const active = cat === category;
                  const meta = CAT_META[cat];
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={{
                        flex: 1, paddingVertical: 10, borderRadius: 12,
                        backgroundColor: active ? meta.activeBg : meta.bg,
                        borderWidth: active ? 1.5 : 1,
                        borderColor: active ? meta.activeText + "80" : Colors.border,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13, fontWeight: active ? "600" : "400",
                          color: active ? meta.activeText : Colors.textSecondary,
                        }}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── Name ── */}
            <View style={{ marginBottom: 20 }}>
              <Text style={labelStyle}>Material Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Stoneware B-Mix"
                placeholderTextColor={Colors.textTertiary}
                returnKeyType="next"
                style={[inputStyle, { borderColor: name ? Colors.clay[300] : Colors.border }]}
              />
            </View>

            {/* ── Quantity + Unit ── */}
            <View style={{ marginBottom: 20 }}>
              <Text style={labelStyle}>Current Quantity</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="0"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="numeric"
                  returnKeyType="next"
                  style={[
                    inputStyle,
                    { flex: 1, borderColor: quantity ? Colors.clay[300] : Colors.border },
                  ]}
                />
                {/* Unit selector */}
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {UNITS.map((u) => {
                    const active = u === unit;
                    return (
                      <TouchableOpacity
                        key={u}
                        onPress={() => setUnit(u)}
                        style={{
                          paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12,
                          backgroundColor: active ? Colors.primary : Colors.surface,
                          borderWidth: 1,
                          borderColor: active ? Colors.primary : Colors.border,
                          alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13, fontWeight: active ? "600" : "400",
                            color: active ? Colors.textInverse : Colors.textSecondary,
                          }}
                        >
                          {u}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* ── Max quantity ── */}
            <View style={{ marginBottom: 20 }}>
              <Text style={labelStyle}>
                Max Quantity{" "}
                <Text style={{ color: Colors.smoke[400], fontWeight: "400", textTransform: "none", letterSpacing: 0 }}>
                  (for stock bar)
                </Text>
              </Text>
              <TextInput
                value={maxQuantity}
                onChangeText={setMaxQuantity}
                placeholder={`e.g. 25 ${unit}`}
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                returnKeyType="next"
                style={[inputStyle, { borderColor: maxQuantity ? Colors.clay[300] : Colors.border }]}
              />
            </View>

            {/* ── Alert threshold ── */}
            <View style={{ marginBottom: 24 }}>
              <Text style={labelStyle}>
                Low Stock Alert Below{" "}
                <Text style={{ color: Colors.smoke[400], fontWeight: "400", textTransform: "none", letterSpacing: 0 }}>
                  (optional)
                </Text>
              </Text>
              <TextInput
                value={threshold}
                onChangeText={setThreshold}
                placeholder={`e.g. 5 ${unit}`}
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                returnKeyType="done"
                style={[inputStyle, { borderColor: threshold ? Colors.clay[300] : Colors.border }]}
              />
            </View>

            {/* ── Save ── */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={!canSave}
              style={{
                backgroundColor: canSave ? Colors.primary : Colors.clay[200],
                borderRadius: 16, paddingVertical: 15, alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 15, fontWeight: "600",
                  color: canSave ? Colors.textInverse : Colors.clay[400],
                }}
              >
                Add to Inventory
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Shared input styles ──────────────────────────────────────────────────────

const labelStyle = {
  fontSize: 11,
  fontWeight: "600" as const,
  color: Colors.textTertiary,
  textTransform: "uppercase" as const,
  letterSpacing: 0.6,
  marginBottom: 8,
};

const inputStyle = {
  backgroundColor: Colors.surface,
  borderWidth: 1,
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 15,
  color: Colors.textPrimary,
};
