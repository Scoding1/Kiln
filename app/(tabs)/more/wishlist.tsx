import { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";

// TODO: replace with shared Zustand/Supabase state (synced with glazes.tsx, toolkit.tsx)
interface SavedGlaze { id: string; name: string; colorHex: string; type: string }
const SEED_SAVED_GLAZES: SavedGlaze[] = [
  { id: "celadon",       name: "Celadon",       colorHex: "#8BB99A", type: "Glossy · Cone 10" },
  { id: "floating-blue", name: "Floating Blue",  colorHex: "#5E82A0", type: "Glossy · Cone 6"  },
];

interface WishTool { id: string; name: string; primaryUse: string; iconName: string; iconColor: string }
const SEED_WISH_TOOLS: WishTool[] = [
  { id: "t5", name: "Sponge on a Stick", primaryUse: "Removing water from inside vessels", iconName: "water-outline",      iconColor: Colors.info    },
  { id: "t7", name: "Chamois Leather",   primaryUse: "Smoothing and compressing rims",     iconName: "hand-right-outline", iconColor: Colors.warning },
  { id: "t8", name: "Pottery Bat",       primaryUse: "Throwing without distorting pieces",  iconName: "disc-outline",       iconColor: "#8A6048"      },
];

interface BookmarkedTechnique { id: string; name: string; category: string; thumbnailColor: string }
const SEED_BOOKMARKED: BookmarkedTechnique[] = [
  { id: "applying-glaze", name: "Applying Glaze",  category: "Glazing",   thumbnailColor: "#5F9178" },
  { id: "trimming",       name: "Trimming a Bowl", category: "Finishing", thumbnailColor: "#8A6048" },
];

type WishItemKind = "glaze" | "tool" | "technique";

interface WishItem {
  id: string;
  kind: WishItemKind;
  name: string;
  subtitle: string;
  colorHex?: string;
  iconName?: string;
  iconColor?: string;
  thumbnailColor?: string;
}

const KIND_META: Record<WishItemKind, { label: string; bg: string; text: string }> = {
  glaze:     { label: "Glaze",     bg: Colors.infoLight,    text: Colors.info      },
  tool:      { label: "Tool",      bg: Colors.clay[50],     text: Colors.clay[500] },
  technique: { label: "Technique", bg: Colors.successLight, text: Colors.success   },
};

function WishListRow({ item, onRemove }: { item: WishItem; onRemove: () => void }) {
  const kindMeta = KIND_META[item.kind];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderColor: Colors.border,
      }}
    >
      {item.kind === "glaze" && item.colorHex ? (
        <View
          style={{
            width: 44, height: 44, borderRadius: 12,
            backgroundColor: item.colorHex, flexShrink: 0,
            borderWidth: 1, borderColor: Colors.border,
          }}
        />
      ) : item.kind === "tool" && item.iconName ? (
        <View
          style={{
            width: 44, height: 44, borderRadius: 12,
            backgroundColor: (item.iconColor ?? Colors.clay[500]) + "20",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <Ionicons name={item.iconName as any} size={22} color={item.iconColor ?? Colors.clay[500]} />
        </View>
      ) : (
        <View
          style={{
            width: 44, height: 44, borderRadius: 12,
            backgroundColor: (item.thumbnailColor ?? Colors.clay[400]) + "28",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <Ionicons name="book-outline" size={20} color={item.thumbnailColor ?? Colors.clay[500]} />
        </View>
      )}

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{ fontSize: 14, fontWeight: "600", color: Colors.textPrimary, marginBottom: 3 }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ backgroundColor: kindMeta.bg, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ fontSize: 10, fontWeight: "600", color: kindMeta.text }}>{kindMeta.label}</Text>
          </View>
          <Text style={{ fontSize: 12, color: Colors.textTertiary }} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        style={{
          width: 30, height: 30, borderRadius: 15,
          backgroundColor: Colors.surface,
          borderWidth: 1, borderColor: Colors.border,
          alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
      >
        <Ionicons name="close" size={15} color={Colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
}

export default function WishListScreen() {
  const router = useRouter();
  const [savedGlazes, setSavedGlazes] = useState<SavedGlaze[]>(SEED_SAVED_GLAZES);
  const [wishTools, setWishTools]     = useState<WishTool[]>(SEED_WISH_TOOLS);
  const [bookmarked, setBookmarked]   = useState<BookmarkedTechnique[]>(SEED_BOOKMARKED);

  const wishItems: WishItem[] = useMemo(() => [
    ...savedGlazes.map((g) => ({ id: g.id, kind: "glaze" as const, name: g.name, subtitle: g.type, colorHex: g.colorHex })),
    ...wishTools.map((t) => ({ id: t.id, kind: "tool" as const, name: t.name, subtitle: t.primaryUse, iconName: t.iconName, iconColor: t.iconColor })),
    ...bookmarked.map((t) => ({ id: t.id, kind: "technique" as const, name: t.name, subtitle: t.category, thumbnailColor: t.thumbnailColor })),
  ], [savedGlazes, wishTools, bookmarked]);

  function removeWishItem(item: WishItem) {
    if (item.kind === "glaze")     setSavedGlazes((p) => p.filter((g) => g.id !== item.id));
    if (item.kind === "tool")      setWishTools((p) => p.filter((t) => t.id !== item.id));
    if (item.kind === "technique") setBookmarked((p) => p.filter((t) => t.id !== item.id));
  }

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
            Wish List
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
            {wishItems.length} saved item{wishItems.length !== 1 ? "s" : ""}
          </Text>
        </View>
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
        {wishItems.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60, paddingHorizontal: 24 }}>
            <View
              style={{
                width: 64, height: 64, borderRadius: 32,
                backgroundColor: Colors.clay[50],
                alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="heart-outline" size={30} color={Colors.primary} />
            </View>
            <Text style={{ fontFamily: "Georgia", fontSize: 18, color: Colors.textPrimary, textAlign: "center", marginBottom: 8 }}>
              Nothing saved yet
            </Text>
            <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: "center", lineHeight: 20 }}>
              Heart glazes, bookmark tools and techniques to build your wish list.
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              paddingHorizontal: 14,
              overflow: "hidden",
            }}
          >
            {wishItems.map((item, i) => (
              <View
                key={item.id + item.kind}
                style={i === wishItems.length - 1 ? { borderBottomWidth: 0 } : {}}
              >
                <WishListRow item={item} onRemove={() => removeWishItem(item)} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
