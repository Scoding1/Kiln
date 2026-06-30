import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { Glaze, FoodSafe } from "@/lib/types";
import { GlazeDetailSheet } from "@/components/sheets/GlazeDetailSheet";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/AuthContext";

// ─── Free tier ────────────────────────────────────────────────────────────────

const FREE_SAVE_LIMIT = 5;

// ─── Sample glaze data ────────────────────────────────────────────────────────

const GLAZES: Glaze[] = [
  {
    id: "celadon",
    name: "Celadon",
    type: "Glossy",
    cone: "Cone 10",
    atmosphere: "Reduction",
    surface: "Smooth",
    color_hex: "#8BB99A",
    food_safe: "Check with supplier",
    description:
      "A classic East Asian glaze prized for its soft jade-green transparency. In reduction firing, iron oxide transforms into a delicate sea-green that pools beautifully in carved textures. One of the most revered glazes in ceramic history.",
    ingredients: [
      { name: "Custer Feldspar", percentage: 25 },
      { name: "Silica", percentage: 35 },
      { name: "Whiting", percentage: 20 },
      { name: "Kaolin", percentage: 9 },
      { name: "Zinc Oxide", percentage: 10 },
      { name: "Iron Oxide (red)", percentage: 1 },
    ],
  },
  {
    id: "floating-blue",
    name: "Floating Blue",
    type: "Glossy",
    cone: "Cone 6",
    atmosphere: "Oxidation",
    surface: "Variegated",
    color_hex: "#5E82A0",
    food_safe: "Food safe",
    description:
      "A popular mid-fire glaze known for its dramatic cloudlike movement. Cobalt provides a rich blue base while rutile breaks through in soft ivory wisps, creating an effect that looks different on every piece.",
    ingredients: [
      { name: "Custer Feldspar", percentage: 35 },
      { name: "Silica", percentage: 30 },
      { name: "Whiting", percentage: 20 },
      { name: "Zircopax", percentage: 11 },
      { name: "Rutile", percentage: 3 },
      { name: "Cobalt Carbonate", percentage: 1 },
    ],
  },
  {
    id: "shino",
    name: "Shino",
    type: "Matte",
    cone: "Cone 10",
    atmosphere: "Reduction",
    surface: "Textured",
    color_hex: "#D4956A",
    food_safe: "Check with supplier",
    description:
      "A celebrated Japanese glaze with ancient roots. High in nepheline syenite, it produces a thick, milky-orange surface interrupted by carbon trapping and fire flashing. No two Shino pieces ever look alike.",
    ingredients: [
      { name: "Nepheline Syenite", percentage: 75 },
      { name: "EPK Kaolin", percentage: 25 },
    ],
  },
  {
    id: "temmoku",
    name: "Temmoku",
    type: "Glossy",
    cone: "Cone 10",
    atmosphere: "Reduction",
    surface: "Smooth",
    color_hex: "#2D1B12",
    food_safe: "Check with supplier",
    description:
      "A high-iron reduction glaze that fires to a deep, lustrous black-brown. Thin applications on rims and edges break to a rich rust-amber, giving pieces a dramatic two-tone quality. Originally used for tea ceremony bowls in Song dynasty China.",
    ingredients: [
      { name: "Custer Feldspar", percentage: 40 },
      { name: "Silica", percentage: 30 },
      { name: "Whiting", percentage: 10 },
      { name: "Kaolin", percentage: 10 },
      { name: "Iron Oxide (red)", percentage: 10 },
    ],
  },
  {
    id: "majolica-white",
    name: "Majolica White",
    type: "Glossy",
    cone: "Cone 6",
    atmosphere: "Oxidation",
    surface: "Smooth",
    color_hex: "#EDE9DF",
    food_safe: "Food safe",
    description:
      "A bright, opaque tin-white glaze that serves as the traditional base for majolica earthenware decoration. Provides a clean, reflective surface ideal for underglaze painting. Fires to a slightly warm white with excellent colour response.",
    ingredients: [
      { name: "Custer Feldspar", percentage: 25 },
      { name: "Silica", percentage: 25 },
      { name: "Whiting", percentage: 20 },
      { name: "Talc", percentage: 15 },
      { name: "Zircopax", percentage: 15 },
    ],
  },
  {
    id: "robin-egg",
    name: "Robin Egg",
    type: "Satin",
    cone: "Cone 6",
    atmosphere: "Oxidation",
    surface: "Smooth",
    color_hex: "#6BB8B8",
    food_safe: "Food safe",
    description:
      "A soft, luminous turquoise glaze reminiscent of a robin's egg. Copper carbonate in a Gerstley borate base produces a lively, varied surface with subtle depth. Works beautifully on both thrown and hand-built work.",
    ingredients: [
      { name: "Gerstley Borate", percentage: 24 },
      { name: "Custer Feldspar", percentage: 28 },
      { name: "Silica", percentage: 20 },
      { name: "Whiting", percentage: 14 },
      { name: "Kaolin", percentage: 11 },
      { name: "Copper Carbonate", percentage: 3 },
    ],
  },
  {
    id: "ash-satin",
    name: "Ash Satin",
    type: "Satin",
    cone: "Cone 10",
    atmosphere: "Either",
    surface: "Variegated",
    color_hex: "#BFB09A",
    food_safe: "Check with supplier",
    description:
      "A natural wood-ash glaze with warm, earthy character. The ash creates a subtle surface texture with slight variations in colour where it pools and thins. Works in both oxidation and reduction, with reduction bringing out softer greens.",
    ingredients: [
      { name: "Wood Ash (washed)", percentage: 40 },
      { name: "Potash Feldspar", percentage: 30 },
      { name: "Silica", percentage: 20 },
      { name: "Kaolin", percentage: 10 },
    ],
  },
  {
    id: "buttermilk",
    name: "Buttermilk",
    type: "Matte",
    cone: "Cone 6",
    atmosphere: "Oxidation",
    surface: "Smooth",
    color_hex: "#F0E2C0",
    food_safe: "Food safe",
    description:
      "A warm, creamy matte glaze that softens a piece without hiding the clay body beneath. Titanium dioxide creates a gentle buttery opacity. Lovely on textured surfaces where the slight translucency reveals handwork detail.",
    ingredients: [
      { name: "Custer Feldspar", percentage: 30 },
      { name: "Silica", percentage: 25 },
      { name: "Whiting", percentage: 25 },
      { name: "Titanium Dioxide", percentage: 10 },
      { name: "Kaolin", percentage: 10 },
    ],
  },
];

// ─── Filter config ────────────────────────────────────────────────────────────

type FilterKey = "All" | "Glossy" | "Matte" | "Satin" | "Cone 6" | "Cone 10" | "Food safe" | "Saved";
const FILTER_KEYS: FilterKey[] = ["All", "Glossy", "Matte", "Satin", "Cone 6", "Cone 10", "Food safe", "Saved"];

// ─── Badge configs (reused on card + sheet) ───────────────────────────────────

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

// ─── Food safety badge config ─────────────────────────────────────────────────

const FOOD_SAFE_META: Record<FoodSafe, { icon: string; bg: string; text: string }> = {
  "Food safe":           { icon: "checkmark-circle", bg: "#E8F5EE", text: Colors.success },
  "Check with supplier": { icon: "alert-circle",     bg: Colors.warningLight, text: Colors.warning },
  "Not food safe":       { icon: "close-circle",     bg: "#FDECEA", text: Colors.error },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

// ─── Upgrade modal ────────────────────────────────────────────────────────────

function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(40,20,10,0.50)", alignItems: "center", justifyContent: "center", padding: 28 }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            style={{
              backgroundColor: Colors.background,
              borderRadius: 24,
              padding: 28,
              alignItems: "center",
              maxWidth: 340,
              width: "100%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.18,
              shadowRadius: 24,
              elevation: 24,
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: Colors.clay[50],
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <Ionicons name="lock-closed" size={28} color={Colors.primary} />
            </View>

            <Text
              style={{
                fontFamily: "Georgia",
                fontSize: 20,
                color: Colors.textPrimary,
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Glaze Collection Full
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.textSecondary,
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 24,
              }}
            >
              Free potters can save up to {FREE_SAVE_LIMIT} glazes. Upgrade to Kiln Pro for unlimited saves and full recipe access.
            </Text>

            {/* Upgrade button */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 16,
                paddingVertical: 14,
                paddingHorizontal: 32,
                alignItems: "center",
                width: "100%",
                marginBottom: 12,
              }}
            >
              <Text style={{ color: Colors.textInverse, fontSize: 15, fontWeight: "700" }}>
                Upgrade to Pro
              </Text>
            </TouchableOpacity>

            {/* Dismiss */}
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: Colors.textTertiary, fontSize: 14 }}>Not now</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Glaze card ───────────────────────────────────────────────────────────────

function GlazeCard({
  glaze,
  saved,
  onPress,
  onToggleSave,
}: {
  glaze: Glaze;
  saved: boolean;
  onPress: () => void;
  onToggleSave: () => void;
}) {
  const typeMeta = TYPE_META[glaze.type];
  const atmMeta = ATM_META[glaze.atmosphere];
  const swatchBorder = isLight(glaze.color_hex)
    ? { borderWidth: 1, borderColor: Colors.border }
    : {};

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 12,
        flexDirection: "row",
        padding: 14,
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      {/* Colour swatch */}
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 14,
          backgroundColor: glaze.color_hex,
          flexShrink: 0,
          ...swatchBorder,
        }}
      />

      {/* Content */}
      <View style={{ flex: 1, minWidth: 0 }}>
        {/* Name + heart row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "Georgia",
              fontSize: 16,
              color: Colors.textPrimary,
              flex: 1,
              marginRight: 8,
            }}
          >
            {glaze.name}
          </Text>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons
              name={saved ? "heart" : "heart-outline"}
              size={20}
              color={saved ? Colors.primary : Colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        {/* Tag row 1: type + cone */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 5 }}>
          <View
            style={{
              backgroundColor: typeMeta.bg,
              borderRadius: 20,
              paddingHorizontal: 9,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "600", color: typeMeta.text }}>
              {glaze.type}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: Colors.clay[50],
              borderRadius: 20,
              paddingHorizontal: 9,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "600", color: Colors.clay[600] }}>
              {glaze.cone}
            </Text>
          </View>
        </View>

        {/* Tag row 2: atmosphere + surface */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 5 }}>
          <View
            style={{
              backgroundColor: atmMeta.bg,
              borderRadius: 20,
              paddingHorizontal: 9,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "600", color: atmMeta.text }}>
              {glaze.atmosphere}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: Colors.smoke[100],
              borderRadius: 20,
              paddingHorizontal: 9,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 11, color: Colors.smoke[600] }}>
              {glaze.surface}
            </Text>
          </View>
        </View>

        {/* Food safety badge */}
        {(() => {
          const fs = FOOD_SAFE_META[glaze.food_safe];
          return (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons
                name={fs.icon as React.ComponentProps<typeof Ionicons>["name"]}
                size={12}
                color={fs.text}
              />
              <Text style={{ fontSize: 11, fontWeight: "600", color: fs.text }}>
                {glaze.food_safe}
              </Text>
            </View>
          );
        })()}
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty states ─────────────────────────────────────────────────────────────

function EmptySearch({ query }: { query: string }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 56, paddingHorizontal: 24 }}>
      <Text style={{ fontSize: 36, marginBottom: 12 }}>🔍</Text>
      <Text
        style={{
          fontFamily: "Georgia",
          fontSize: 18,
          color: Colors.textPrimary,
          marginBottom: 6,
          textAlign: "center",
        }}
      >
        No glazes found
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: Colors.textSecondary,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        No results for "{query}". Try a different name, type, or description.
      </Text>
    </View>
  );
}

function EmptySaved() {
  return (
    <View style={{ alignItems: "center", paddingVertical: 56, paddingHorizontal: 24 }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: Colors.clay[50],
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Ionicons name="heart-outline" size={32} color={Colors.primary} />
      </View>
      <Text
        style={{
          fontFamily: "Georgia",
          fontSize: 18,
          color: Colors.textPrimary,
          marginBottom: 6,
          textAlign: "center",
        }}
      >
        No saved glazes yet
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: Colors.textSecondary,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        Tap the heart on any glaze to save it to your collection.
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function GlazesScreen() {
  const { session } = useSession();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [detailGlaze, setDetailGlaze] = useState<Glaze | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // ── Load saved glazes from Supabase ───────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("saved_glazes") as any)
      .select("glaze_id")
      .eq("user_id", session.user.id)
      .then(({ data }: { data: { glaze_id: string }[] | null }) => {
        if (data) setSavedIds(new Set(data.map((r) => r.glaze_id)));
      });
  }, [session?.user.id]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = GLAZES;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.type.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.surface.toLowerCase().includes(q) ||
          g.atmosphere.toLowerCase().includes(q)
      );
    }

    switch (activeFilter) {
      case "Glossy":
      case "Matte":
      case "Satin":
        result = result.filter((g) => g.type === activeFilter);
        break;
      case "Cone 6":
        result = result.filter((g) => g.cone === "Cone 6");
        break;
      case "Cone 10":
        result = result.filter((g) => g.cone === "Cone 10" || g.cone === "Cone 10-12");
        break;
      case "Food safe":
        result = result.filter((g) => g.food_safe === "Food safe");
        break;
      case "Saved":
        result = result.filter((g) => savedIds.has(g.id));
        break;
    }

    return result;
  }, [search, activeFilter, savedIds]);

  // ── Save / unsave ──────────────────────────────────────────────────────────
  async function handleToggleSave(id: string) {
    if (savedIds.has(id)) {
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (session) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("saved_glazes") as any)
          .delete()
          .eq("user_id", session.user.id)
          .eq("glaze_id", id);
      }
    } else {
      if (savedIds.size >= FREE_SAVE_LIMIT) {
        setShowUpgrade(true);
        return;
      }
      setSavedIds((prev) => new Set(prev).add(id));
      if (session) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("saved_glazes") as any)
          .insert({ user_id: session.user.id, glaze_id: id });
      }
    }
  }

  const savedCount = savedIds.size;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.background }}
      edges={["top"]}
    >
      {/* ── Fixed header area ── */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 28,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderColor: Colors.border,
        }}
      >
        {/* Title row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <View>
            <Text
              style={{
                fontFamily: "Georgia",
                fontSize: 30,
                color: Colors.textPrimary,
                marginBottom: 2,
              }}
            >
              Glazes
            </Text>
            <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
              {savedCount} / {FREE_SAVE_LIMIT} saved
            </Text>
          </View>

          {/* Saved count chip */}
          {savedCount > 0 && (
            <TouchableOpacity
              onPress={() => setActiveFilter("Saved")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: Colors.clay[50],
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: Colors.clay[100],
              }}
            >
              <Ionicons name="heart" size={13} color={Colors.primary} />
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: Colors.primary }}
              >
                {savedCount}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: Colors.surface,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: searchFocused ? Colors.primary : Colors.border,
            paddingHorizontal: 12,
            paddingVertical: Platform.OS === "ios" ? 10 : 8,
            marginBottom: 14,
            gap: 8,
          }}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={searchFocused ? Colors.primary : Colors.textTertiary}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search by name, type, description…"
            placeholderTextColor={Colors.textTertiary}
            returnKeyType="search"
            style={{
              flex: 1,
              fontSize: 15,
              color: Colors.textPrimary,
              // Remove default web outline
              ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
            }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 4 }}
        >
          {FILTER_KEYS.map((key) => {
            const active = activeFilter === key;
            const isSavedKey = key === "Saved";
            const isFoodSafeKey = key === "Food safe";
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveFilter(key)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: active ? Colors.primary : Colors.surface,
                  borderWidth: 1,
                  borderColor: active ? Colors.primary : Colors.border,
                }}
              >
                {isSavedKey && (
                  <Ionicons
                    name={active ? "heart" : "heart-outline"}
                    size={12}
                    color={active ? Colors.textInverse : Colors.textTertiary}
                  />
                )}
                {isFoodSafeKey && (
                  <Ionicons
                    name="checkmark-circle"
                    size={12}
                    color={active ? Colors.textInverse : Colors.success}
                  />
                )}
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: active ? "600" : "400",
                    color: active ? Colors.textInverse : Colors.textSecondary,
                  }}
                >
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Scrollable glaze list ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Platform.OS === "ios" ? 32 : 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Results count when filtering */}
        {(search.trim() || activeFilter !== "All") && filtered.length > 0 && (
          <Text
            style={{
              fontSize: 12,
              color: Colors.textTertiary,
              marginBottom: 12,
              fontWeight: "500",
            }}
          >
            {filtered.length} glaze{filtered.length !== 1 ? "s" : ""}
            {activeFilter !== "All" ? ` · ${activeFilter}` : ""}
            {search.trim() ? ` matching "${search.trim()}"` : ""}
          </Text>
        )}

        {/* Empty states */}
        {filtered.length === 0 && activeFilter === "Saved" && !search.trim() && (
          <EmptySaved />
        )}
        {filtered.length === 0 && search.trim().length > 0 && (
          <EmptySearch query={search.trim()} />
        )}

        {/* Glaze cards */}
        {filtered.map((glaze) => (
          <GlazeCard
            key={glaze.id}
            glaze={glaze}
            saved={savedIds.has(glaze.id)}
            onPress={() => setDetailGlaze(glaze)}
            onToggleSave={() => handleToggleSave(glaze.id)}
          />
        ))}
      </ScrollView>

      {/* ── Sheets & modals ── */}
      <GlazeDetailSheet
        glaze={detailGlaze}
        saved={detailGlaze ? savedIds.has(detailGlaze.id) : false}
        onClose={() => setDetailGlaze(null)}
        onToggleSave={(id) => {
          handleToggleSave(id);
          // Keep sheet open so user sees the state change
        }}
      />

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </SafeAreaView>
  );
}
