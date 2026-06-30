import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { ALL_STAGES, stageIndex } from "@/lib/types";
import type { Project, ProjectStage } from "@/lib/types";
import { AddProjectSheet } from "@/components/sheets/AddProjectSheet";
import { ProjectDetailSheet } from "@/components/sheets/ProjectDetailSheet";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    stage: row.stage as ProjectStage,
    clayBody: row.clay_body,
    glaze: row.glaze,
    notes: row.notes,
    photoUris: [],
    updatedAt: formatRelativeTime(row.updated_at),
  };
}

// ─── Stage config ─────────────────────────────────────────────────────────────

const STAGE_META: Record<ProjectStage, { bg: string; text: string }> = {
  Wedged:  { bg: Colors.infoLight,    text: Colors.info },
  Thrown:  { bg: Colors.clay[50],     text: Colors.clay[500] },
  Trimmed: { bg: Colors.warningLight, text: Colors.warning },
  Bisque:  { bg: Colors.sand[100],    text: Colors.earth[400] },
  Glazed:  { bg: Colors.clay[100],    text: Colors.clay[600] },
  Fired:   { bg: Colors.successLight, text: Colors.success },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatItem({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <View className="flex-1 items-center py-4">
      <Text
        className="text-2xl mb-0.5"
        style={{
          fontFamily: "Georgia",
          color: accent ? Colors.primary : Colors.textPrimary,
        }}
      >
        {value}
      </Text>
      <Text className="text-xs" style={{ color: Colors.textTertiary }}>
        {label}
      </Text>
    </View>
  );
}

function StatsDivider() {
  return (
    <View className="w-px self-stretch" style={{ backgroundColor: Colors.border }} />
  );
}

function StatsStrip({ projects }: { projects: Project[] }) {
  const total = projects.length;
  const inProgress = projects.filter((p) => p.stage !== "Fired").length;
  const complete = projects.filter((p) => p.stage === "Fired").length;

  return (
    <View
      className="flex-row rounded-2xl mb-5 overflow-hidden"
      style={{
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
      }}
    >
      <StatItem value={total} label="Total" />
      <StatsDivider />
      <StatItem value={inProgress} label="In Progress" accent />
      <StatsDivider />
      <StatItem value={complete} label="Complete" />
    </View>
  );
}

function StageBadge({ stage }: { stage: ProjectStage }) {
  const { bg, text } = STAGE_META[stage];
  return (
    <View
      className="self-start rounded-full px-2.5 py-1"
      style={{ backgroundColor: bg }}
    >
      <Text className="text-[11px] font-semibold" style={{ color: text }}>
        {stage}
      </Text>
    </View>
  );
}

function StageBar({ stage }: { stage: ProjectStage }) {
  const current = stageIndex(stage);
  return (
    <View className="flex-row gap-0.5">
      {ALL_STAGES.map((_, i) => (
        <View
          key={i}
          className="flex-1 rounded-full"
          style={{
            height: 5,
            backgroundColor: i <= current ? Colors.primary : Colors.border,
          }}
        />
      ))}
    </View>
  );
}

function ProjectCard({
  project,
  onPress,
}: {
  project: Project;
  onPress: () => void;
}) {
  const hasPhoto = project.photoUris.length > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      className="rounded-2xl mb-3 overflow-hidden"
      style={{
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
      }}
    >
      <View className="flex-row p-4 gap-3">
        {/* Thumbnail */}
        <View
          className="w-[68px] h-[68px] rounded-xl items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: hasPhoto ? "transparent" : Colors.clay[50],
            borderWidth: hasPhoto ? 0 : 1,
            borderColor: Colors.clay[100],
          }}
        >
          {hasPhoto ? (
            <Image
              source={{ uri: project.photoUris[0] }}
              style={{ width: 68, height: 68, borderRadius: 12 }}
              resizeMode="cover"
            />
          ) : (
            <Text className="text-4xl">{project.emoji}</Text>
          )}
        </View>

        {/* Content */}
        <View className="flex-1 min-w-0">
          {/* Name row */}
          <View className="flex-row items-start justify-between gap-2 mb-1.5">
            <Text
              className="text-base font-semibold flex-shrink flex-1"
              style={{ fontFamily: "Georgia", color: Colors.textPrimary }}
              numberOfLines={1}
            >
              {project.name}
            </Text>
            <Text
              className="text-[11px] flex-shrink-0"
              style={{ color: Colors.textTertiary }}
            >
              {project.updatedAt}
            </Text>
          </View>

          {/* Tags */}
          <View className="flex-row flex-wrap gap-1.5 mb-2.5">
            {project.clayBody ? (
              <View
                className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: Colors.earth[50],
                  borderWidth: 1,
                  borderColor: Colors.earth[100],
                }}
              >
                <Text className="text-[10px]" style={{ color: Colors.earth[400] }}>
                  {project.clayBody}
                </Text>
              </View>
            ) : null}
            {project.glaze ? (
              <View
                className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: Colors.clay[50],
                  borderWidth: 1,
                  borderColor: Colors.clay[100],
                }}
              >
                <Text className="text-[10px]" style={{ color: Colors.clay[500] }}>
                  {project.glaze}
                </Text>
              </View>
            ) : null}
            <StageBadge stage={project.stage} />
          </View>

          {/* Stage bar */}
          <StageBar stage={project.stage} />

          {/* Notes preview */}
          {project.notes ? (
            <Text
              className="text-xs mt-2 leading-relaxed"
              style={{ color: Colors.textTertiary }}
              numberOfLines={1}
            >
              {project.notes}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View className="items-center py-16 px-6">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-5"
        style={{ backgroundColor: Colors.clay[50] }}
      >
        <Text className="text-4xl">🏺</Text>
      </View>
      <Text
        className="text-xl mb-2 text-center"
        style={{ fontFamily: "Georgia", color: Colors.textPrimary }}
      >
        No projects yet
      </Text>
      <Text
        className="text-sm text-center mb-6 leading-relaxed"
        style={{ color: Colors.textSecondary }}
      >
        No projects yet — tap + to add your first piece
      </Text>
      <TouchableOpacity
        onPress={onAdd}
        className="flex-row items-center gap-2 px-6 py-3 rounded-full"
        style={{ backgroundColor: Colors.primary }}
      >
        <Ionicons name="add" size={18} color={Colors.textInverse} />
        <Text className="text-sm font-semibold" style={{ color: Colors.textInverse }}>
          Add your first project
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProjectsScreen() {
  const session = useAuthStore((s) => s.session);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("projects") as any)
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false })
      .then(({ data, error }: { data: any[] | null; error: any }) => {
        if (error) { console.log("fetch projects error", error); }
        setProjects((data ?? []).map(rowToProject));
        setLoading(false);
      });
  }, [session?.user.id]);

  function handleAdd(project: Project) {
    setProjects((prev) => [project, ...prev]);
  }

  async function handleAdvanceStage(id: string, stage: ProjectStage) {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stage, updatedAt: "just now" } : p))
    );
    setDetailProject((prev) =>
      prev?.id === id ? { ...prev, stage, updatedAt: "just now" } : prev
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("projects") as any)
      .update({ stage })
      .eq("id", id);
    if (error) console.log("update stage error", error);
  }

  async function handleUpdateNotes(id: string, notes: string) {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, notes, updatedAt: "just now" } : p))
    );
    setDetailProject((prev) =>
      prev?.id === id ? { ...prev, notes, updatedAt: "just now" } : prev
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("projects") as any)
      .update({ notes })
      .eq("id", id);
    if (error) console.log("update notes error", error);
  }

  async function handleUpdateGlaze(id: string, glaze: string) {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, glaze, updatedAt: "just now" } : p))
    );
    setDetailProject((prev) =>
      prev?.id === id ? { ...prev, glaze, updatedAt: "just now" } : prev
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("projects") as any)
      .update({ glaze })
      .eq("id", id);
    if (error) console.log("update glaze error", error);
  }

  function handleAddPhoto(id: string, uri: string) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, photoUris: [...p.photoUris, uri], updatedAt: "just now" }
          : p
      )
    );
    setDetailProject((prev) =>
      prev?.id === id
        ? { ...prev, photoUris: [...prev.photoUris, uri], updatedAt: "just now" }
        : prev
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
      edges={["top"]}
    >
      {/* ── Header ── */}
      <View
        className="flex-row items-center justify-between px-5 pt-7 pb-4"
        style={{ borderBottomWidth: 1, borderColor: Colors.border }}
      >
        <View>
          <Text
            className="text-3xl mb-0.5"
            style={{ fontFamily: "Georgia", color: Colors.textPrimary }}
          >
            Projects
          </Text>
          <Text className="text-sm" style={{ color: Colors.textSecondary }}>
            {loading ? "Loading…" : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowAdd(true)}
          className="w-11 h-11 rounded-full items-center justify-center"
          style={{ backgroundColor: Colors.primary }}
        >
          <Ionicons name="add" size={24} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: Platform.OS === "ios" ? 32 : 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          {projects.length > 0 && <StatsStrip projects={projects} />}

          {projects.length === 0 ? (
            <EmptyState onAdd={() => setShowAdd(true)} />
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onPress={() => setDetailProject(project)}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* ── Sheets ── */}
      <AddProjectSheet
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={handleAdd}
        userId={session?.user.id ?? ""}
      />

      <ProjectDetailSheet
        project={detailProject}
        onClose={() => setDetailProject(null)}
        onAdvanceStage={handleAdvanceStage}
        onAddPhoto={handleAddPhoto}
        onUpdateNotes={handleUpdateNotes}
        onUpdateGlaze={handleUpdateGlaze}
      />
    </SafeAreaView>
  );
}
