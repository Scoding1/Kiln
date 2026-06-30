import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, router, Link } from "expo-router";
import { Colors } from "@/constants/colors";
import { useSession } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectStage =
  | "Wedged"
  | "Thrown"
  | "Trimmed"
  | "Bisque"
  | "Glazed"
  | "Fired";

interface Project {
  id: string;
  name: string;
  stage: ProjectStage;
  piecesCount: number;
  updatedAt: string;
}

// ─── Mock data (replace with Supabase queries) ────────────────────────────────

const RECENT_PROJECT: Project = {
  id: "1",
  name: "Terracotta Bowl Set",
  stage: "Bisque",
  piecesCount: 3,
  updatedAt: "2 days ago",
};

const RECENT_PROJECTS: Project[] = [
  { id: "1", name: "Terracotta Bowl Set", stage: "Bisque",  piecesCount: 3, updatedAt: "2d ago" },
  { id: "2", name: "Celadon Mug",         stage: "Glazed",  piecesCount: 1, updatedAt: "5d ago" },
  { id: "3", name: "Stoneware Vase",      stage: "Trimmed", piecesCount: 1, updatedAt: "1w ago" },
];

const STATS = { projects: 4, pieces: 12, glazes: 3 };

const TIPS = [
  "Wedge your clay thoroughly to remove air pockets — it makes centering on the wheel much easier.",
  "Keep your hands and clay consistently moist while throwing, but avoid soaking — too much water weakens the walls.",
  "Score and slip both surfaces firmly when joining clay pieces for a bond that survives firing.",
  "Let your piece dry slowly under plastic wrap to prevent cracking, especially at joins and rims.",
  "A bisque-fired piece absorbs glaze better when it's slightly warm — try placing it near a heat source for a few minutes first.",
  "Consistent wall thickness matters more than thinness — even walls survive thermal shock in the kiln far better.",
  "Test your glazes on small tiles before committing to a piece — colours shift dramatically between wet and fired.",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): { heading: string; sub: string } {
  const h = new Date().getHours();
  if (h >= 5 && h < 12)
    return { heading: "Good morning", sub: "What are you shaping today?" };
  if (h >= 12 && h < 17)
    return { heading: "Good afternoon", sub: "Back at the wheel?" };
  if (h >= 17 && h < 21)
    return { heading: "Good evening", sub: "A great time for glazing." };
  return { heading: "Burning the midnight kiln", sub: "The dedicated potter's hour." };
}

function getDailyTip(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return TIPS[dayOfYear % TIPS.length];
}

const STAGE_COLORS: Record<ProjectStage, { bg: string; text: string }> = {
  Wedged:  { bg: Colors.infoLight,    text: Colors.info },
  Thrown:  { bg: Colors.clay[50],     text: Colors.clay[500] },
  Trimmed: { bg: Colors.warningLight, text: Colors.warning },
  Bisque:  { bg: Colors.sand[100],    text: Colors.earth[400] },
  Glazed:  { bg: Colors.clay[100],    text: Colors.clay[600] },
  Fired:   { bg: Colors.successLight, text: Colors.success },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: ProjectStage }) {
  const { bg, text } = STAGE_COLORS[stage];
  return (
    <View style={{ backgroundColor: bg }} className="self-start rounded-full px-3 py-1">
      <Text style={{ color: text }} className="text-xs font-semibold">
        {stage}
      </Text>
    </View>
  );
}

function HeroProjectCard({ project }: { project: Project }) {
  return (
    <Link href="/projects" asChild>
    <Pressable
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      className="rounded-3xl overflow-hidden mb-5"
    >
      <View style={{ backgroundColor: Colors.clay[600] }}>
      {/* Decorative texture circles */}
      <View
        className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10"
        style={{ backgroundColor: Colors.clay[200] }}
      />
      <View
        className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10"
        style={{ backgroundColor: Colors.sand[300] }}
      />

      <View className="p-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: Colors.clay[200] }}
          >
            Most Recent
          </Text>
          <StageBadge stage={project.stage} />
        </View>

        <Text
          className="text-2xl mb-1"
          style={{ fontFamily: "Georgia", color: Colors.textInverse }}
        >
          {project.name}
        </Text>
        <Text style={{ color: Colors.clay[200] }} className="text-sm mb-6">
          {project.piecesCount} {project.piecesCount === 1 ? "piece" : "pieces"} · Updated {project.updatedAt}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row gap-3">
            {(["flame", "color-palette", "camera"] as const).map((icon, i) => (
              <View
                key={i}
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                <Ionicons name={icon} size={15} color={Colors.clay[100]} />
              </View>
            ))}
          </View>
          <View
            className="flex-row items-center gap-1 px-4 py-2 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
          >
            <Text className="text-sm font-semibold" style={{ color: Colors.textInverse }}>
              Continue
            </Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.textInverse} />
          </View>
        </View>
      </View>
      </View>
    </Pressable>
    </Link>
  );
}

function StatsDivider() {
  return <View className="w-px self-stretch" style={{ backgroundColor: Colors.border }} />;
}

function StatItem({
  value,
  label,
  href,
}: {
  value: number;
  label: string;
  href: string;
}) {
  return (
    <Link href={href as any} asChild style={{ flex: 1 }}>
      <Pressable
        style={({ pressed }) => ({
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 16,
          paddingHorizontal: 8,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text
          style={{
            fontFamily: "Georgia",
            fontSize: 24,
            color: Colors.textPrimary,
            marginBottom: 2,
            textAlign: "center",
          }}
        >
          {value}
        </Text>
        <Text style={{ fontSize: 12, color: Colors.textTertiary, textAlign: "center" }}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

function StatsStrip({ stats }: { stats: typeof STATS }) {
  return (
    <View
      className="flex-row rounded-2xl mb-5"
      style={{ backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }}
    >
      <StatItem value={stats.projects} label="Projects"         href="/projects" />
      <StatsDivider />
      <StatItem value={stats.pieces}   label="Pieces Made"      href="/projects" />
      <StatsDivider />
      <StatItem value={stats.glazes}   label="In My Collection" href="/glazes"   />
    </View>
  );
}

interface QuickAction {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  accentBg: string;
  accentIcon: string;
  route: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "New Project",
    icon: "add-circle-outline",
    accentBg: Colors.clay[50],
    accentIcon: Colors.clay[500],
    route: "/projects",
  },
  {
    label: "Add Glaze",
    icon: "color-palette-outline",
    accentBg: Colors.infoLight,
    accentIcon: Colors.info,
    route: "/glazes",
  },
  {
    label: "Log a Firing",
    icon: "flame-outline",
    accentBg: Colors.warningLight,
    accentIcon: Colors.warning,
    route: "/projects",
  },
  {
    label: "Techniques",
    icon: "book-outline",
    accentBg: Colors.successLight,
    accentIcon: Colors.success,
    route: "/techniques",
  },
];

function QuickActionCard({ action }: { action: QuickAction }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="flex-1 rounded-2xl p-4 min-h-[100px] justify-between"
      style={{
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
      }}
      onPress={() => router.push(action.route as any)}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: action.accentBg }}
      >
        <Ionicons name={action.icon} size={20} color={action.accentIcon} />
      </View>
      <View className="flex-row items-end justify-between">
        <Text
          className="text-sm font-semibold flex-1 pr-1"
          style={{ color: Colors.textPrimary }}
        >
          {action.label}
        </Text>
        <Ionicons name="arrow-forward" size={14} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

function QuickActionsGrid() {
  const pairs = [QUICK_ACTIONS.slice(0, 2), QUICK_ACTIONS.slice(2, 4)];
  return (
    <View className="mb-5 gap-3">
      {pairs.map((row, i) => (
        <View key={i} className="flex-row gap-3">
          {row.map((action) => (
            <QuickActionCard key={action.label} action={action} />
          ))}
        </View>
      ))}
    </View>
  );
}

function RecentProjectRow({ project }: { project: Project }) {
  return (
    <Link href="/projects" asChild>
    <Pressable
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      className="flex-row items-center py-3.5"
    >
      <View style={{ borderBottomWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", flex: 1 }}>
      {/* Stage dot */}
      <View
        className="w-2 h-2 rounded-full mr-3 mt-0.5"
        style={{ backgroundColor: STAGE_COLORS[project.stage].text }}
      />
      <View className="flex-1">
        <Text
          className="text-sm font-semibold mb-0.5"
          style={{ color: Colors.textPrimary }}
        >
          {project.name}
        </Text>
        <Text className="text-xs" style={{ color: Colors.textTertiary }}>
          {project.stage} · {project.piecesCount} {project.piecesCount === 1 ? "piece" : "pieces"}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-xs mb-1.5" style={{ color: Colors.textTertiary }}>
          {project.updatedAt}
        </Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
      </View>
      </View>
    </Pressable>
    </Link>
  );
}

function RecentProjectsList({ projects }: { projects: Project[] }) {
  return (
    <View className="mb-5">
      <View className="flex-row items-center justify-between mb-3">
        <Text
          className="text-lg"
          style={{ fontFamily: "Georgia", color: Colors.textPrimary }}
        >
          Recent Projects
        </Text>
        <TouchableOpacity onPress={() => router.push("/projects")}>
          <Text className="text-sm font-medium" style={{ color: Colors.primary }}>
            See all
          </Text>
        </TouchableOpacity>
      </View>

      <View
        className="rounded-2xl px-4 overflow-hidden"
        style={{
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: Colors.border,
        }}
      >
        {projects.map((project, i) => (
          <View
            key={project.id}
            style={i === projects.length - 1 ? { borderBottomWidth: 0 } : {}}
          >
            <RecentProjectRow project={project} />
          </View>
        ))}
      </View>
    </View>
  );
}

function TipOfTheDay({ tip }: { tip: string }) {
  return (
    <View
      className="rounded-2xl p-5 mb-2"
      style={{
        backgroundColor: Colors.clay[50],
        borderWidth: 1,
        borderColor: Colors.clay[100],
      }}
    >
      <View className="flex-row items-center gap-2 mb-3">
        <View
          className="w-7 h-7 rounded-full items-center justify-center"
          style={{ backgroundColor: Colors.clay[100] }}
        >
          <Ionicons name="bulb-outline" size={15} color={Colors.clay[500]} />
        </View>
        <Text
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: Colors.clay[500] }}
        >
          Tip of the Day
        </Text>
      </View>
      <Text
        className="text-sm leading-relaxed"
        style={{ color: Colors.textSecondary }}
      >
        {tip}
      </Text>
    </View>
  );
}

// ─── Email nudge banner ───────────────────────────────────────────────────────

function EmailNudgeBanner({
  email,
  onDismiss,
  onResend,
}: {
  email: string;
  onDismiss: () => void;
  onResend: () => void;
}) {
  return (
    <View
      className="flex-row items-start rounded-2xl p-4 mb-5 gap-3"
      style={{
        backgroundColor: Colors.warningLight,
        borderWidth: 1,
        borderColor: Colors.warning + "50",
      }}
    >
      <View
        className="w-8 h-8 rounded-full items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: Colors.warning + "25" }}
      >
        <Ionicons name="mail-outline" size={16} color={Colors.warning} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold mb-0.5" style={{ color: Colors.textPrimary }}>
          Please confirm your email
        </Text>
        <Text className="text-xs leading-relaxed" style={{ color: Colors.textSecondary }}>
          We sent a link to {email}.{" "}
          <Text style={{ color: Colors.primary, fontWeight: "600" }} onPress={onResend}>
            Resend
          </Text>
        </Text>
      </View>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={16} color={Colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useSession();
  const { heading, sub } = useMemo(getGreeting, []);
  const tip = useMemo(getDailyTip, []);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const emailConfirmed = !session || !!session.user.email_confirmed_at;
  const showNudge = !emailConfirmed && !nudgeDismissed;

  async function handleResendEmail() {
    const email = session?.user.email;
    if (!email) return;
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      Alert.alert("Couldn't resend", error.message);
    } else {
      Alert.alert("Email sent", "Check your inbox for the confirmation link.");
    }
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
      edges={["top"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 28,
          paddingBottom: Platform.OS === "ios" ? 32 : 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Email nudge ── */}
        {showNudge && (
          <EmailNudgeBanner
            email={session?.user.email ?? ""}
            onDismiss={() => setNudgeDismissed(true)}
            onResend={handleResendEmail}
          />
        )}

        {/* ── Greeting ── */}
        <View className="mb-6">
          <Text
            className="text-3xl mb-1"
            style={{ fontFamily: "Georgia", color: Colors.textPrimary }}
          >
            {heading}
          </Text>
          <Text className="text-base" style={{ color: Colors.textSecondary }}>
            {sub}
          </Text>
        </View>

        {/* ── Hero project card ── */}
        <HeroProjectCard project={RECENT_PROJECT} />

        {/* ── Stats strip ── */}
        <StatsStrip stats={STATS} />

        {/* ── Quick actions ── */}
        <Text
          className="text-lg mb-3"
          style={{ fontFamily: "Georgia", color: Colors.textPrimary }}
        >
          Quick Actions
        </Text>
        <QuickActionsGrid />

        {/* ── Recent projects ── */}
        <RecentProjectsList projects={RECENT_PROJECTS} />

        {/* ── Tip of the day ── */}
        <TipOfTheDay tip={tip} />
      </ScrollView>
    </SafeAreaView>
  );
}
