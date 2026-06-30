import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { Technique } from "@/lib/types";
import { TechniqueDetailSheet } from "@/components/sheets/TechniqueDetailSheet";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/AuthContext";

// ─── Technique data ───────────────────────────────────────────────────────────

const TECHNIQUES: Technique[] = [
  {
    id: "centring",
    name: "Centring Clay",
    category: "Throwing",
    level: "Beginner",
    duration: "12 min",
    description:
      "The essential first skill for wheel throwing. Learn to feel the clay moving under your hands and bring it into perfect alignment with the wheel's axis.",
    thumbnailColor: "#9E6E50",
    tools: ["Wheel", "Wire cutter", "Sponge on a stick"],
    steps: [
      {
        id: "centring-1",
        title: "Wedge your clay",
        detail:
          "Wedge about 500g–1kg of clay on a flat surface for at least 30 full turns to remove air pockets and homogenise the clay body. Pockets of trapped air can cause pieces to explode in the kiln.",
        timeEstimate: "3 min",
      },
      {
        id: "centring-2",
        title: "Attach to the wheel",
        detail:
          "Slam the clay firmly onto the centre of a dampened wheel head. Wet your hands and the clay surface generously. Brace your elbows against your thighs — stability from your body, not your arms.",
        timeEstimate: "1 min",
        pro_tip: "Keep a bucket of water nearby and re-wet your hands every few pulls. Dry hands drag the clay and cause unevenness.",
      },
      {
        id: "centring-3",
        title: "Cone the clay up",
        detail:
          "With the wheel turning fast, press in with both palms and push upward to cone the clay into a tall point. Keep your elbows braced and your core engaged. Repeat 2–3 times to work out unevenness.",
        timeEstimate: "3 min",
      },
      {
        id: "centring-4",
        title: "Push down and centre",
        detail:
          "On the last cone-down, press both palms inward and simultaneously downward. Feel for the vibration smoothing out — if the clay is fighting you, go back to the cone. The clay should feel like it's disappearing into the wheel.",
        timeEstimate: "4 min",
      },
      {
        id: "centring-5",
        title: "Test your centre",
        detail:
          "Hold your thumb lightly on the spinning clay's surface — it should feel completely still. A pin tool rested on top will confirm: no wobble means centred. If you feel any bucking, repeat the cone and press.",
        timeEstimate: "1 min",
      },
    ],
  },

  {
    id: "pulling-walls",
    name: "Opening and Pulling Walls",
    category: "Throwing",
    level: "Intermediate",
    duration: "18 min",
    description:
      "Transform a centred lump into a cylinder. This is the foundation of every thrown form — bowls, mugs, vases all start here. Patience and consistent pressure are everything.",
    thumbnailColor: "#5B849E",
    tools: ["Wheel", "Wooden rib", "Sponge on a stick"],
    steps: [
      {
        id: "pw-1",
        title: "Create the opening",
        detail:
          "With thumbs together over the clay's centre, push straight down — stopping about 8–10mm from the wheel head. Keep your wrists locked and descend slowly. Speed here collapses the opening off-centre.",
        timeEstimate: "3 min",
      },
      {
        id: "pw-2",
        title: "Widen the base",
        detail:
          "Draw your thumbs apart horizontally to open the floor to the desired width, leaving an even base thickness of 8–10mm. Use a pin tool to check: insert it through the clay until it hits the wheel, measure the exposed portion.",
        timeEstimate: "3 min",
      },
      {
        id: "pw-3",
        title: "First wall pull",
        detail:
          "Anchor your outside hand's knuckle against the base of the wall. Inside fingers press outward, matching the outside hand's position. Lift both hands in one slow, steady motion from base to rim. Don't rush this — one smooth pull.",
        timeEstimate: "4 min",
        pro_tip: "Pull slowly and with even pressure — speed is the enemy of even walls. One slow pull is worth three rushed ones.",
      },
      {
        id: "pw-4",
        title: "Refine the walls",
        detail:
          "Make 2–3 more pulls, always starting from the base and working upward. Each pull should remove a little clay from the lower wall and move it up. Thin gradually — removing too much at once causes the wall to wobble and collapse.",
        timeEstimate: "6 min",
      },
      {
        id: "pw-5",
        title: "Compress the rim",
        detail:
          "Cup both hands around the rim, applying gentle inward pressure while the wheel turns slowly. This compresses the clay and prevents cracking as the piece dries. Finish by sponging excess water from the base.",
        timeEstimate: "2 min",
      },
    ],
  },

  {
    id: "pinch-pot",
    name: "Hand-building a Pinch Pot",
    category: "Hand-building",
    level: "Beginner",
    duration: "20 min",
    description:
      "The oldest pottery technique in the world. Just your hands, a ball of clay, and patience. Perfect for beginners and experienced potters alike — no wheel needed.",
    thumbnailColor: "#B07840",
    tools: ["No tools needed"],
    steps: [
      {
        id: "pp-1",
        title: "Form a smooth ball",
        detail:
          "Wedge about 200g of clay and roll it between your palms into an even sphere. The smoother and rounder the ball, the more even your walls will be. Any lopsidedness here gets amplified as you work.",
        timeEstimate: "2 min",
      },
      {
        id: "pp-2",
        title: "Make the thumb hole",
        detail:
          "Cradle the ball in your non-dominant hand. Press your dominant thumb into the centre, rotating the ball as you press. Stop 8–10mm from the bottom — leaving a thick, stable base. Keep your thumb straight.",
        timeEstimate: "2 min",
      },
      {
        id: "pp-3",
        title: "Pinch and rotate",
        detail:
          "Pinch the walls between your thumb (inside) and two or three fingers (outside). Apply even pressure and rotate the pot a quarter-turn with each pinch, working in upward spiral passes. Your goal is consistent 5–7mm wall thickness.",
        timeEstimate: "10 min",
        pro_tip: "Work from the base upward and keep rotating the pot as you go. If you stay in one spot the walls will become uneven very quickly.",
      },
      {
        id: "pp-4",
        title: "Refine the shape",
        detail:
          "Once the walls are evenly thin, gently coax the shape. Set the pot down and press lightly to flatten the base. Paddle the outside with a flat tool to close any sagging. Use a damp finger to smooth the exterior.",
        timeEstimate: "4 min",
      },
      {
        id: "pp-5",
        title: "Smooth and compress the rim",
        detail:
          "Wet a finger and run it around the rim with gentle pressure to compress it and seal any cracks. Small rim cracks can be blended inward. A slightly uneven rim has beautiful handmade character — don't over-correct it.",
        timeEstimate: "2 min",
      },
    ],
  },

  {
    id: "applying-glaze",
    name: "Applying Glaze",
    category: "Glazing",
    level: "Beginner",
    duration: "15 min",
    description:
      "Glaze application is as much a skill as throwing. The method you choose dramatically affects the final surface. Understand the options and when to use each one.",
    thumbnailColor: "#5F9178",
    tools: ["Glaze bucket", "Damp sponge", "Kiln shelf"],
    steps: [
      {
        id: "ag-1",
        title: "Prepare your bisqueware",
        detail:
          "Wipe the bisque-fired piece with a clean damp sponge to remove all dust and fingerprints. Allow it to dry completely before glazing — any moisture in the clay will prevent even absorption. Warmer bisque absorbs glaze faster.",
        timeEstimate: "3 min",
      },
      {
        id: "ag-2",
        title: "Choose your application method",
        detail:
          "Each method produces a distinct surface quality. Dipping and pouring give the most even coverage. Brushing allows deliberate marks and layering. Spraying is ideal for large batches and graduated effects.",
        timeEstimate: "1 min",
        methods: [
          {
            id: "dipping",
            label: "Dipping",
            instruction:
              "Stir your glaze bucket thoroughly — glaze settles fast. Hold the piece firmly by the foot ring and submerge it for 3–5 seconds, then withdraw smoothly at a slight angle. The bisque absorbs glaze almost instantly. Work quickly and confidently.",
          },
          {
            id: "pouring",
            label: "Pouring",
            instruction:
              "Hold the piece over a catch basin. Pour glaze steadily over the outside, rotating the piece to get full coverage. Then pour a measured amount inside and swirl to coat the interior completely before pouring out the excess. Overlap pour lines slightly.",
          },
          {
            id: "brushing",
            label: "Brushing",
            instruction:
              "Use a wide, soft glaze brush loaded with glaze. Apply 3 coats, letting each dry to the touch before the next (usually 5–10 min). Alternate brush direction with each coat — horizontal, vertical, diagonal — to build even coverage without brush marks.",
          },
          {
            id: "spraying",
            label: "Spraying",
            instruction:
              "Use a spray gun in overlapping passes at 20–30cm distance. Build 3 thin coats, allowing brief drying between each. Keep the gun moving constantly to avoid drips. Work in a spray booth and wear a respirator — dry glaze particles are hazardous.",
          },
        ],
        methodProTips: {
          brushing: "Apply 3 thin coats in alternating directions — horizontal, then vertical, then horizontal. Let each coat dry to touch before the next.",
        },
        methodTools: {
          dipping:  ["Dipping tongs"],
          brushing: ["Soft brush (medium)"],
          spraying: ["Spray gun + booth"],
        },
      },
      {
        id: "ag-3",
        title: "Clean the foot ring",
        detail:
          "Wipe all glaze from the bottom 5mm of the foot ring and the entire base using a damp sponge or a damp finger. Any glaze touching the kiln shelf will fuse permanently — this is the most important step. Be thorough.",
        timeEstimate: "2 min",
        pro_tip: "Wipe at least 5–8mm from the base. Glaze on the foot will fuse your piece permanently to the kiln shelf. When in doubt, wipe more.",
      },
      {
        id: "ag-4",
        title: "Check coverage",
        detail:
          "Hold the piece up to a strong light and look for thin spots, drips, and missed areas. The glaze layer should be about 1–2mm thick — roughly a credit card's width. Drips can be scraped flat. Thin patches should be touched up before drying.",
        timeEstimate: "2 min",
      },
      {
        id: "ag-5",
        title: "Allow to dry fully",
        detail:
          "Place on a clean kiln shelf and allow the glaze to dry completely before loading the kiln. Wet glaze will crawl, flake, or crack during firing. Bisqueware dries quickly — 30 minutes is usually enough in a warm, dry space.",
        timeEstimate: "30 min",
      },
    ],
  },

  {
    id: "trimming",
    name: "Trimming a Bowl",
    category: "Finishing",
    level: "Intermediate",
    duration: "10 min",
    description:
      "Trimming refines your thrown form, removes excess weight, and creates the foot ring that elevates the piece. Timing is everything — too wet and it sags, too dry and it crumbles.",
    thumbnailColor: "#8A6048",
    tools: ["Wheel", "Trimming loop tool", "Needle tool"],
    steps: [
      {
        id: "tr-1",
        title: "Check leather-hardness",
        detail:
          "The piece should hold its shape firmly but feel cool and slightly damp against your cheek. Press a fingernail lightly into the base — it should leave a faint mark without crumbling. Too soft and the clay will smear; too hard and the tool will skip.",
        timeEstimate: "1 min",
        pro_tip: "Tap the base of the bowl. A hollow sound means it's ready to trim. A dull thud means it needs more drying time — be patient or you'll distort the form.",
      },
      {
        id: "tr-2",
        title: "Centre and secure",
        detail:
          "Place the bowl upside-down on the wheel head. Spin slowly and tap the rim gently with your finger to walk it to centre — watch for wobble and adjust. Once centred, press 3–4 small coils of soft clay around the rim as temporary anchors.",
        timeEstimate: "3 min",
      },
      {
        id: "tr-3",
        title: "Define the foot ring",
        detail:
          "With the wheel at medium speed, hold a loop tool lightly against the base. Make the outer wall of the foot ring first, then the inner wall, working in shallow passes. The foot ring should be about 5–8mm wide and stand 5–8mm tall. Check symmetry from above.",
        timeEstimate: "4 min",
      },
      {
        id: "tr-4",
        title: "Refine the profile",
        detail:
          "Step back and check the silhouette. The wall should taper evenly from a slightly thicker base to a thinner upper wall. Use a trimming tool to shave any excess. Rotate slowly and look for any flat spots or irregularities.",
        timeEstimate: "2 min",
      },
      {
        id: "tr-5",
        title: "Smooth and sign",
        detail:
          "Burnish the trimmed base with a rubber rib or damp finger — this compresses the clay surface and reduces texture from the trimming tool. While the clay is still workable, press your stamp or carve your signature into the foot. Remove the anchor coils carefully.",
        timeEstimate: "1 min",
      },
    ],
  },
];

// ─── Filter config ────────────────────────────────────────────────────────────

type FilterKey =
  | "All"
  | "Throwing"
  | "Hand-building"
  | "Glazing"
  | "Finishing"
  | "Beginner only";

const FILTER_KEYS: FilterKey[] = [
  "All",
  "Throwing",
  "Hand-building",
  "Glazing",
  "Finishing",
  "Beginner only",
];

// ─── Badge configs ────────────────────────────────────────────────────────────

const CAT_META: Record<Technique["category"], { bg: string; text: string }> = {
  Throwing:        { bg: Colors.infoLight,    text: Colors.info },
  "Hand-building": { bg: Colors.clay[50],     text: Colors.clay[500] },
  Glazing:         { bg: Colors.successLight, text: Colors.success },
  Finishing:       { bg: Colors.warningLight, text: Colors.warning },
};

const LEVEL_META: Record<Technique["level"], { bg: string; text: string }> = {
  Beginner:     { bg: Colors.successLight, text: Colors.success },
  Intermediate: { bg: Colors.warningLight, text: Colors.warning },
  Advanced:     { bg: Colors.clay[100],    text: Colors.clay[600] },
};

// ─── Technique card ───────────────────────────────────────────────────────────

function TechniqueCard({
  technique,
  completedCount,
  onPress,
}: {
  technique: Technique;
  completedCount: number;
  onPress: () => void;
}) {
  const totalSteps = technique.steps.length;
  const progress = completedCount / totalSteps;
  const allDone = completedCount === totalSteps;
  const catMeta = CAT_META[technique.category];
  const levelMeta = LEVEL_META[technique.level];

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 14,
        overflow: "hidden",
      }}
    >
      {/* ── Video thumbnail ── */}
      <View
        style={{
          height: 116,
          backgroundColor: technique.thumbnailColor,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <View
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: "rgba(255,255,255,0.07)",
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: -14,
            left: -14,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "rgba(255,255,255,0.07)",
          }}
        />

        {/* Play button */}
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: "rgba(255,255,255,0.22)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "rgba(255,255,255,0.88)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="play"
              size={16}
              color={technique.thumbnailColor}
              style={{ marginLeft: 2 }}
            />
          </View>
        </View>

        {/* Duration badge — bottom right */}
        <View
          style={{
            position: "absolute",
            bottom: 10,
            right: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: "rgba(0,0,0,0.32)",
            paddingHorizontal: 9,
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

        {/* Completion check overlay */}
        {allDone && (
          <View
            style={{
              position: "absolute",
              top: 10,
              left: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: Colors.success,
              paddingHorizontal: 9,
              paddingVertical: 4,
              borderRadius: 20,
            }}
          >
            <Ionicons name="checkmark-circle" size={11} color="#fff" />
            <Text style={{ fontSize: 11, fontWeight: "600", color: "#fff" }}>
              Complete
            </Text>
          </View>
        )}
      </View>

      {/* ── Card body ── */}
      <View style={{ padding: 14 }}>
        {/* Name */}
        <Text
          style={{
            fontFamily: "Georgia",
            fontSize: 17,
            color: Colors.textPrimary,
            marginBottom: 5,
          }}
          numberOfLines={1}
        >
          {technique.name}
        </Text>

        {/* Description */}
        <Text
          style={{
            fontSize: 13,
            color: Colors.textSecondary,
            lineHeight: 19,
            marginBottom: 10,
          }}
          numberOfLines={2}
        >
          {technique.description}
        </Text>

        {/* Badge row */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <View
            style={{
              backgroundColor: catMeta.bg,
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "600", color: catMeta.text }}>
              {technique.category}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: levelMeta.bg,
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "600", color: levelMeta.text }}>
              {technique.level}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View>
          <View
            style={{
              height: 5,
              backgroundColor: Colors.border,
              borderRadius: 3,
              overflow: "hidden",
              marginBottom: 5,
            }}
          >
            <View
              style={{
                width: `${progress * 100}%`,
                height: 5,
                backgroundColor: allDone ? Colors.success : Colors.primary,
                borderRadius: 3,
              }}
            />
          </View>
          <Text style={{ fontSize: 11, color: Colors.textTertiary }}>
            {completedCount === 0
              ? `${totalSteps} steps`
              : allDone
              ? "All steps complete"
              : `${completedCount} of ${totalSteps} steps`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

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
        No techniques found
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: Colors.textSecondary,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        No results for "{query}". Try a different name or description.
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TechniquesScreen() {
  const { session } = useSession();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [detailTechnique, setDetailTechnique] = useState<Technique | null>(null);

  // stepId sets, keyed by techniqueId — shared with the detail sheet
  const [completedSteps, setCompletedSteps] = useState<
    Record<string, Set<string>>
  >({});

  // ── Load completed steps from Supabase ────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("completed_technique_steps") as any)
      .select("technique_id, step_id")
      .eq("user_id", session.user.id)
      .then(({ data }: { data: { technique_id: string; step_id: string }[] | null }) => {
        if (!data) return;
        const rebuilt: Record<string, Set<string>> = {};
        for (const row of data) {
          if (!rebuilt[row.technique_id]) rebuilt[row.technique_id] = new Set();
          rebuilt[row.technique_id].add(row.step_id);
        }
        setCompletedSteps(rebuilt);
      });
  }, [session?.user.id]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = TECHNIQUES;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    switch (activeFilter) {
      case "Throwing":
      case "Hand-building":
      case "Glazing":
      case "Finishing":
        result = result.filter((t) => t.category === activeFilter);
        break;
      case "Beginner only":
        result = result.filter((t) => t.level === "Beginner");
        break;
    }

    return result;
  }, [search, activeFilter]);

  // ── Step toggle ────────────────────────────────────────────────────────────
  async function handleToggleStep(techniqueId: string, stepId: string) {
    const isCompleted = completedSteps[techniqueId]?.has(stepId) ?? false;

    setCompletedSteps((prev) => {
      const current = new Set(prev[techniqueId] ?? []);
      if (isCompleted) {
        current.delete(stepId);
      } else {
        current.add(stepId);
      }
      return { ...prev, [techniqueId]: current };
    });

    if (session) {
      if (isCompleted) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("completed_technique_steps") as any)
          .delete()
          .eq("user_id", session.user.id)
          .eq("technique_id", techniqueId)
          .eq("step_id", stepId);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("completed_technique_steps") as any)
          .insert({ user_id: session.user.id, technique_id: techniqueId, step_id: stepId });
      }
    }
  }

  const detailCompletedSteps: Set<string> = detailTechnique
    ? (completedSteps[detailTechnique.id] ?? new Set())
    : new Set();

  // ── Overall progress ───────────────────────────────────────────────────────
  const totalStepsAcrossAll = TECHNIQUES.reduce((s, t) => s + t.steps.length, 0);
  const completedAcrossAll = Object.values(completedSteps).reduce(
    (s, set) => s + set.size,
    0
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.background }}
      edges={["top"]}
    >
      {/* ── Fixed header ── */}
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
              Techniques
            </Text>
            <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
              {completedAcrossAll} of {totalStepsAcrossAll} steps complete
            </Text>
          </View>

          {/* Mini overall progress ring/chip */}
          {completedAcrossAll > 0 && (
            <View
              style={{
                backgroundColor: Colors.clay[50],
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: Colors.clay[100],
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={13} color={Colors.primary} />
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: Colors.primary }}
              >
                {Math.round((completedAcrossAll / totalStepsAcrossAll) * 100)}%
              </Text>
            </View>
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
            placeholder="Search techniques…"
            placeholderTextColor={Colors.textTertiary}
            returnKeyType="search"
            style={{
              flex: 1,
              fontSize: 15,
              color: Colors.textPrimary,
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
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveFilter(key)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: active ? Colors.primary : Colors.surface,
                  borderWidth: 1,
                  borderColor: active ? Colors.primary : Colors.border,
                }}
              >
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

      {/* ── Scrollable cards ── */}
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
        {/* Results count */}
        {(search.trim() || activeFilter !== "All") && filtered.length > 0 && (
          <Text
            style={{
              fontSize: 12,
              color: Colors.textTertiary,
              marginBottom: 12,
              fontWeight: "500",
            }}
          >
            {filtered.length} technique{filtered.length !== 1 ? "s" : ""}
            {activeFilter !== "All" ? ` · ${activeFilter}` : ""}
            {search.trim() ? ` matching "${search.trim()}"` : ""}
          </Text>
        )}

        {/* Empty search */}
        {filtered.length === 0 && search.trim().length > 0 && (
          <EmptySearch query={search.trim()} />
        )}

        {/* Cards */}
        {filtered.map((technique) => (
          <TechniqueCard
            key={technique.id}
            technique={technique}
            completedCount={completedSteps[technique.id]?.size ?? 0}
            onPress={() => setDetailTechnique(technique)}
          />
        ))}
      </ScrollView>

      {/* ── Detail sheet ── */}
      <TechniqueDetailSheet
        technique={detailTechnique}
        completedStepIds={detailCompletedSteps}
        onClose={() => setDetailTechnique(null)}
        onToggleStep={handleToggleStep}
      />
    </SafeAreaView>
  );
}
