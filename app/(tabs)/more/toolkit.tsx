import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import type { Tool } from "@/lib/types";
import { ToolDetailSheet } from "@/components/sheets/ToolDetailSheet";

// TODO: replace with Supabase query
const SEED_TOOLS: Tool[] = [
  { id: "t1", name: "Wire Clay Cutter",    primaryUse: "Cutting and sectioning clay",        iconName: "cut-outline",               iconColor: Colors.clay[500],  owned: true,  wishList: false,
    description: "A thin, taut wire strung between two wooden or metal handles. Used to cut clay off the wheel head after throwing, to section a block of wedged clay, and to remove finished pieces from the bat. Simple, essential, irreplaceable." },
  { id: "t2", name: "Trimming Loop Tool",  primaryUse: "Trimming foot rings and bases",      iconName: "ellipse-outline",           iconColor: Colors.earth[400], owned: true,  wishList: false,
    description: "A looped metal blade set in a handle, available in several loop shapes — round, square, and angled. The primary tool for trimming the base and foot ring of leather-hard thrown work. The loop cuts cleanly without dragging." },
  { id: "t3", name: "Wooden Rib",          primaryUse: "Shaping and smoothing surfaces",     iconName: "tablet-landscape-outline",  iconColor: "#B07840",         owned: true,  wishList: false,
    description: "A paddle-shaped tool cut from hardwood with one or more curved edges. Held against the outside of a spinning piece to refine the profile, compress the wall, and produce a smooth surface." },
  { id: "t4", name: "Metal Kidney",        primaryUse: "Scraping and smoothing surfaces",    iconName: "analytics-outline",         iconColor: Colors.smoke[600], owned: true,  wishList: false,
    description: "A thin, flexible steel tool roughly kidney-shaped. Used for scraping excess slip, smoothing hand-built or thrown work, and compressing the exterior." },
  { id: "t5", name: "Sponge on a Stick",   primaryUse: "Removing water from inside vessels", iconName: "water-outline",             iconColor: Colors.info,       owned: false, wishList: true,
    description: "A natural sea sponge lashed to a dowel rod. The only practical way to remove excess throwing water from inside narrow-necked pots and bottles where your hand can't reach." },
  { id: "t6", name: "Needle Tool",         primaryUse: "Scoring, measuring and trimming",    iconName: "pencil-outline",            iconColor: Colors.clay[600],  owned: true,  wishList: false,
    description: "A sharp steel needle set in a turned handle. Used for scoring before joining, measuring base thickness, trimming rims, and incising fine decorative lines." },
  { id: "t7", name: "Chamois Leather",     primaryUse: "Smoothing and compressing rims",     iconName: "hand-right-outline",        iconColor: Colors.warning,    owned: false, wishList: true,
    description: "A small square of natural chamois leather, kept damp. Laid over the rim of a spinning piece and gently pinched, it compresses and polishes the rim to a silky, crack-resistant finish." },
  { id: "t8", name: "Pottery Bat",         primaryUse: "Throwing without distorting pieces",  iconName: "disc-outline",              iconColor: "#8A6048",         owned: false, wishList: true,
    description: "A flat disc — plastic, plywood, or plaster — that clips onto bat pins on the wheel head. Allows a completed piece to be lifted off the wheel without distortion." },
];

function SubLabel({ text }: { text: string }) {
  return (
    <Text
      style={{
        fontSize: 11, fontWeight: "600",
        color: Colors.textTertiary,
        textTransform: "uppercase",
        letterSpacing: 0.7,
        marginBottom: 10,
      }}
    >
      {text}
    </Text>
  );
}

function ToolCard({ tool, onPress }: { tool: Tool; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: tool.owned ? Colors.success + "40" : Colors.warning + "30",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: 80,
          backgroundColor: tool.iconColor + "18",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Ionicons name={tool.iconName as any} size={32} color={tool.iconColor} />
        {tool.owned && (
          <View
            style={{
              position: "absolute", top: 7, right: 7,
              width: 20, height: 20, borderRadius: 10,
              backgroundColor: Colors.success,
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        )}
        {!tool.owned && tool.wishList && (
          <View
            style={{
              position: "absolute", top: 7, right: 7,
              width: 20, height: 20, borderRadius: 10,
              backgroundColor: Colors.warning,
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name="bookmark" size={11} color="#fff" />
          </View>
        )}
      </View>
      <View style={{ padding: 10 }}>
        <Text
          style={{ fontSize: 13, fontWeight: "600", color: Colors.textPrimary, marginBottom: 2 }}
          numberOfLines={1}
        >
          {tool.name}
        </Text>
        <Text
          style={{ fontSize: 11, color: Colors.textTertiary, lineHeight: 15 }}
          numberOfLines={2}
        >
          {tool.primaryUse}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function ToolGrid({
  tools,
  onPress,
  emptyMessage,
}: {
  tools: Tool[];
  onPress: (t: Tool) => void;
  emptyMessage: string;
}) {
  if (tools.length === 0) {
    return (
      <View
        style={{
          paddingVertical: 18, paddingHorizontal: 14,
          backgroundColor: Colors.surface,
          borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 13, color: Colors.textTertiary }}>{emptyMessage}</Text>
      </View>
    );
  }

  const pairs: [Tool, Tool | null][] = [];
  for (let i = 0; i < tools.length; i += 2) {
    pairs.push([tools[i], tools[i + 1] ?? null]);
  }

  return (
    <View style={{ gap: 10 }}>
      {pairs.map(([left, right], i) => (
        <View key={i} style={{ flexDirection: "row", gap: 10 }}>
          <ToolCard tool={left} onPress={() => onPress(left)} />
          {right ? (
            <ToolCard tool={right} onPress={() => onPress(right)} />
          ) : (
            <View style={{ flex: 1 }} />
          )}
        </View>
      ))}
    </View>
  );
}

export default function ToolKitScreen() {
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>(SEED_TOOLS);
  const [detailTool, setDetailTool] = useState<Tool | null>(null);

  function handleToggleOwned(id: string) {
    setTools((p) =>
      p.map((t) =>
        t.id === id ? { ...t, owned: !t.owned, wishList: t.owned ? t.wishList : false } : t
      )
    );
  }
  function handleToggleWishList(id: string) {
    setTools((p) => p.map((t) => (t.id === id ? { ...t, wishList: !t.wishList } : t)));
  }

  const ownedTools = tools.filter((t) => t.owned);
  const wishTools  = tools.filter((t) => t.wishList && !t.owned);
  const syncedDetail = detailTool
    ? tools.find((t) => t.id === detailTool.id) ?? null
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
            Tool Kit
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
            {ownedTools.length} owned · {wishTools.length} on wish list
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
        {/* Stats strip */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: Colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: Colors.border,
            marginBottom: 22,
            overflow: "hidden",
          }}
        >
          <View style={{ flex: 1, alignItems: "center", paddingVertical: 14 }}>
            <Text style={{ fontFamily: "Georgia", fontSize: 22, color: Colors.success, marginBottom: 2 }}>
              {ownedTools.length}
            </Text>
            <Text style={{ fontSize: 11, color: Colors.textTertiary }}>Owned</Text>
          </View>
          <View style={{ width: 1, backgroundColor: Colors.border }} />
          <View style={{ flex: 1, alignItems: "center", paddingVertical: 14 }}>
            <Text style={{ fontFamily: "Georgia", fontSize: 22, color: Colors.warning, marginBottom: 2 }}>
              {wishTools.length}
            </Text>
            <Text style={{ fontSize: 11, color: Colors.textTertiary }}>Wish List</Text>
          </View>
        </View>

        <SubLabel text="In your kit" />
        <ToolGrid
          tools={ownedTools}
          onPress={setDetailTool}
          emptyMessage="No tools owned yet — browse and mark tools as owned."
        />

        {/* Divider */}
        <View style={{ marginTop: 22, marginBottom: 18, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
          <View
            style={{
              flexDirection: "row", alignItems: "center", gap: 5,
              backgroundColor: Colors.warningLight,
              borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
              borderWidth: 1, borderColor: Colors.warning + "40",
            }}
          >
            <Ionicons name="bookmark" size={11} color={Colors.warning} />
            <Text style={{ fontSize: 11, fontWeight: "600", color: Colors.warning }}>Wish List</Text>
          </View>
          <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
        </View>

        <ToolGrid
          tools={wishTools}
          onPress={setDetailTool}
          emptyMessage="No tools on your wish list yet."
        />
      </ScrollView>

      <ToolDetailSheet
        tool={syncedDetail}
        onClose={() => setDetailTool(null)}
        onToggleOwned={handleToggleOwned}
        onToggleWishList={handleToggleWishList}
      />
    </SafeAreaView>
  );
}
