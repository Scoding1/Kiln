import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { getStockStatus } from "@/lib/types";
import type { Material } from "@/lib/types";
import { MaterialDetailSheet } from "@/components/sheets/MaterialDetailSheet";
import { AddMaterialSheet } from "@/components/sheets/AddMaterialSheet";

// TODO: replace with Supabase query
const SEED_MATERIALS: Material[] = [
  { id: "1", name: "Stoneware B-Mix",     category: "Clay",  quantity: 3,   unit: "kg", maxQuantity: 25,   alertThreshold: 5   },
  { id: "2", name: "Floating Blue Glaze", category: "Glaze", quantity: 750, unit: "g",  maxQuantity: 1000, alertThreshold: 150 },
  { id: "3", name: "Celadon Leach",       category: "Glaze", quantity: 280, unit: "g",  maxQuantity: 1000, alertThreshold: 200 },
  { id: "4", name: "Porcelain",           category: "Clay",  quantity: 2,   unit: "kg", maxQuantity: 10,   alertThreshold: 2   },
  { id: "5", name: "Majolica White",      category: "Glaze", quantity: 600, unit: "g",  maxQuantity: 1000, alertThreshold: 200 },
  { id: "6", name: "Kiln Wash",           category: "Other", quantity: 80,  unit: "g",  maxQuantity: 500,  alertThreshold: 100 },
];

const STOCK_META = {
  low:           { border: Colors.error,   bg: Colors.errorLight,   text: Colors.error,   label: "Low Stock"   },
  "running-low": { border: Colors.warning, bg: Colors.warningLight, text: Colors.warning, label: "Running Low" },
  good:          { border: Colors.success, bg: Colors.successLight, text: Colors.success, label: "Good"        },
};

const CAT_META: Record<Material["category"], { bg: string; text: string }> = {
  Clay:  { bg: Colors.clay[50],   text: Colors.clay[600]  },
  Glaze: { bg: Colors.infoLight,  text: Colors.info       },
  Other: { bg: Colors.smoke[100], text: Colors.smoke[700] },
};

function LowStockBanner({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <View
      style={{
        backgroundColor: Colors.errorLight,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.error + "40",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 14,
        gap: 10,
      }}
    >
      <View
        style={{
          width: 32, height: 32, borderRadius: 16,
          backgroundColor: Colors.error + "22",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <Ionicons name="warning-outline" size={17} color={Colors.error} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.error }}>
          {count} item{count !== 1 ? "s" : ""} low on stock
        </Text>
        <Text style={{ fontSize: 12, color: Colors.error, opacity: 0.72 }}>
          Tap a card to update quantities
        </Text>
      </View>
    </View>
  );
}

function MaterialCard({ material, onPress }: { material: Material; onPress: () => void }) {
  const status = getStockStatus(material);
  const meta = STOCK_META[status];
  const catMeta = CAT_META[material.category];
  const fillPct = Math.min(material.quantity / material.maxQuantity, 1) * 100;

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 10,
        flexDirection: "row",
        overflow: "hidden",
      }}
    >
      <View style={{ width: 4, backgroundColor: meta.border }} />
      <View style={{ flex: 1, padding: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <Text
            style={{ fontFamily: "Georgia", fontSize: 16, color: Colors.textPrimary, flex: 1, marginRight: 8 }}
            numberOfLines={1}
          >
            {material.name}
          </Text>
          <View style={{ backgroundColor: meta.bg, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 }}>
            <Text style={{ fontSize: 11, fontWeight: "600", color: meta.text }}>{meta.label}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <View style={{ backgroundColor: catMeta.bg, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ fontSize: 10, fontWeight: "600", color: catMeta.text }}>{material.category}</Text>
          </View>
          <Text style={{ fontSize: 13, color: Colors.textTertiary }}>
            {material.quantity} {material.unit} of {material.maxQuantity} {material.unit}
          </Text>
        </View>
        <View style={{ height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: "hidden" }}>
          <View style={{ width: `${fillPct}%`, height: 6, backgroundColor: meta.border, borderRadius: 3 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function InventoryScreen() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>(SEED_MATERIALS);
  const [detailMaterial, setDetailMaterial] = useState<Material | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  function handleUpdateQuantity(id: string, qty: number) {
    setMaterials((p) => p.map((m) => (m.id === id ? { ...m, quantity: qty } : m)));
  }
  function handleRestock(id: string) {
    setMaterials((p) => p.map((m) => (m.id === id ? { ...m, quantity: m.maxQuantity } : m)));
  }
  function handleAddMaterial(material: Material) {
    setMaterials((p) => [material, ...p]);
  }

  const lowCount = materials.filter((m) => getStockStatus(m) === "low").length;
  const syncedDetail = detailMaterial
    ? materials.find((m) => m.id === detailMaterial.id) ?? null
    : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["top"]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderColor: Colors.border,
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: Colors.surface,
            borderWidth: 1, borderColor: Colors.border,
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Georgia", fontSize: 22, color: Colors.textPrimary }}>
            Inventory
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
            {materials.length} material{materials.length !== 1 ? "s" : ""} tracked
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAdd(true)}
          style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: Colors.primary,
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Ionicons name="add" size={20} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 18,
          paddingBottom: Platform.OS === "ios" ? 40 : 28,
        }}
        showsVerticalScrollIndicator={false}
      >
        <LowStockBanner count={lowCount} />

        {materials.length > 0 ? (
          materials.map((m) => (
            <MaterialCard key={m.id} material={m} onPress={() => setDetailMaterial(m)} />
          ))
        ) : (
          <View
            style={{
              alignItems: "center", paddingVertical: 60,
              backgroundColor: Colors.surface, borderRadius: 16,
              borderWidth: 1, borderColor: Colors.border,
            }}
          >
            <Text style={{ fontSize: 32, marginBottom: 12 }}>📦</Text>
            <Text style={{ fontFamily: "Georgia", fontSize: 18, color: Colors.textPrimary, marginBottom: 6 }}>
              No materials yet
            </Text>
            <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: "center", paddingHorizontal: 24 }}>
              Tap + to start tracking your clay, glazes and supplies.
            </Text>
          </View>
        )}
      </ScrollView>

      <MaterialDetailSheet
        material={syncedDetail}
        onClose={() => setDetailMaterial(null)}
        onUpdateQuantity={handleUpdateQuantity}
        onRestock={handleRestock}
      />
      <AddMaterialSheet
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={handleAddMaterial}
      />
    </SafeAreaView>
  );
}
