import { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/colors";
import { ALL_STAGES, nextStage, stageIndex } from "@/lib/types";
import type { Project, ProjectStage } from "@/lib/types";

// ─── Glaze options ────────────────────────────────────────────────────────────

const DEFAULT_GLAZE_OPTIONS = [
  "Celadon",
  "Floating Blue",
  "Shino",
  "Temmoku",
  "Majolica White",
  "Robin Egg",
  "Ash Satin",
  "Buttermilk",
];

// ─── Stage track ──────────────────────────────────────────────────────────────

const STAGE_COLORS: Record<ProjectStage, { dot: string }> = {
  Wedged:  { dot: Colors.info },
  Thrown:  { dot: Colors.clay[400] },
  Trimmed: { dot: Colors.warning },
  Bisque:  { dot: Colors.earth[300] },
  Glazed:  { dot: Colors.clay[500] },
  Fired:   { dot: Colors.success },
};

function StageTrack({
  stage,
  onSelect,
}: {
  stage: ProjectStage;
  onSelect: (s: ProjectStage) => void;
}) {
  const current = stageIndex(stage);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8 }}
    >
      <View className="flex-row items-start">
        {ALL_STAGES.map((s, i) => {
          const isPast = i < current;
          const isCurrent = i === current;

          return (
            <View key={s} className="items-center" style={{ width: 62 }}>
              {/* Connector line (left half + right half) */}
              {i > 0 && (
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    width: 31,
                    top: 13,
                    height: 2,
                    backgroundColor:
                      isPast || isCurrent ? Colors.clay[300] : Colors.border,
                  }}
                />
              )}
              {i < ALL_STAGES.length - 1 && (
                <View
                  style={{
                    position: "absolute",
                    left: 31,
                    width: 31,
                    top: 13,
                    height: 2,
                    backgroundColor: isPast ? Colors.clay[300] : Colors.border,
                  }}
                />
              )}

              {/* Circle */}
              <TouchableOpacity
                onPress={() => onSelect(s)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor:
                    isCurrent
                      ? Colors.primary
                      : isPast
                      ? Colors.clay[200]
                      : Colors.surface,
                  borderWidth: isCurrent ? 0 : 1.5,
                  borderColor: isPast ? Colors.clay[300] : Colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                }}
              >
                {isPast ? (
                  <Ionicons name="checkmark" size={13} color={Colors.clay[600]} />
                ) : isCurrent ? (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: Colors.textInverse,
                    }}
                  />
                ) : null}
              </TouchableOpacity>

              {/* Label */}
              <Text
                style={{
                  fontSize: 9,
                  marginTop: 5,
                  textAlign: "center",
                  width: 58,
                  fontWeight: isCurrent ? "700" : "400",
                  color: isCurrent ? Colors.textPrimary : Colors.textTertiary,
                }}
              >
                {s}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ─── Photo strip ──────────────────────────────────────────────────────────────

function PhotoStrip({
  uris,
  onAdd,
}: {
  uris: string[];
  onAdd: (uri: string) => void;
}) {
  async function handleAdd() {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) onAdd(result.assets[0].uri);
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 4, gap: 10 }}
    >
      {uris.map((uri, i) => (
        <Image
          key={i}
          source={{ uri }}
          style={{ width: 120, height: 90, borderRadius: 12 }}
        />
      ))}
      <TouchableOpacity
        onPress={handleAdd}
        style={{
          width: 90,
          height: 90,
          borderRadius: 12,
          backgroundColor: Colors.surface,
          borderWidth: 1.5,
          borderColor: Colors.border,
          borderStyle: "dashed",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="add" size={22} color={Colors.textTertiary} />
        <Text style={{ fontSize: 11, color: Colors.textTertiary, marginTop: 3 }}>
          Add photo
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  project: Project | null;
  onClose: () => void;
  onAdvanceStage: (id: string, stage: ProjectStage) => void;
  onAddPhoto: (id: string, uri: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateGlaze?: (id: string, glaze: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectDetailSheet({
  project,
  onClose,
  onAdvanceStage,
  onAddPhoto,
  onUpdateNotes,
  onUpdateGlaze,
}: Props) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [glazeOptions, setGlazeOptions] = useState(DEFAULT_GLAZE_OPTIONS);
  const [selectedGlaze, setSelectedGlaze] = useState("");
  const [showNewGlazeInput, setShowNewGlazeInput] = useState(false);
  const [newGlazeInputText, setNewGlazeInputText] = useState("");

  useEffect(() => {
    if (project) {
      setNotesText(project.notes);
      setSelectedGlaze(project.glaze ?? "");
      // If current glaze isn't in options, add it
      if (project.glaze && !DEFAULT_GLAZE_OPTIONS.includes(project.glaze)) {
        setGlazeOptions([...DEFAULT_GLAZE_OPTIONS, project.glaze]);
      } else {
        setGlazeOptions(DEFAULT_GLAZE_OPTIONS);
      }
    }
  }, [project?.id]);

  if (!project) return null;

  const next = nextStage(project.stage);
  const stageColor = STAGE_COLORS[project.stage].dot;

  function handleNotesBlur() {
    setEditingNotes(false);
    if (notesText !== project!.notes) {
      onUpdateNotes(project!.id, notesText);
    }
  }

  function handleSelectGlaze(glaze: string) {
    const next = glaze === selectedGlaze ? "" : glaze;
    setSelectedGlaze(next);
    onUpdateGlaze?.(project!.id, next);
  }

  function handleAddGlaze() {
    const trimmed = newGlazeInputText.trim();
    if (!trimmed) return;
    if (!glazeOptions.includes(trimmed)) {
      setGlazeOptions((prev) => [...prev, trimmed]);
    }
    setSelectedGlaze(trimmed);
    onUpdateGlaze?.(project!.id, trimmed);
    setNewGlazeInputText("");
    setShowNewGlazeInput(false);
  }

  return (
    <Modal
      visible={!!project}
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
        <View className="items-center pt-3 pb-1">
          <View
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: Colors.border }}
          />
        </View>

        {/* Header */}
        <View className="flex-row items-start justify-between px-5 pt-2 pb-3">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center gap-2 mb-1">
              {/* Stage dot */}
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: stageColor,
                }}
              />
              <Text
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: Colors.textTertiary }}
              >
                {project.stage}
              </Text>
            </View>
            <Text
              className="text-2xl leading-tight"
              style={{ fontFamily: "Georgia", color: Colors.textPrimary }}
            >
              {project.emoji}{"  "}{project.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 rounded-full items-center justify-center mt-1"
            style={{ backgroundColor: Colors.surface }}
          >
            <Ionicons name="close" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* ── Photo strip ── */}
          <View className="mb-5">
            <Text
              className="text-xs font-semibold uppercase tracking-widest px-5 mb-2"
              style={{ color: Colors.textTertiary }}
            >
              Photos
            </Text>
            <PhotoStrip
              uris={project.photoUris}
              onAdd={(uri) => onAddPhoto(project.id, uri)}
            />
          </View>

          {/* ── Stage track ── */}
          <View className="mb-5">
            <Text
              className="text-xs font-semibold uppercase tracking-widest px-5 mb-1"
              style={{ color: Colors.textTertiary }}
            >
              Progress · tap to update
            </Text>
            <StageTrack
              stage={project.stage}
              onSelect={(s) => onAdvanceStage(project.id, s)}
            />
          </View>

          {/* ── Tags ── */}
          <View className="flex-row flex-wrap gap-2 px-5 mb-5">
            {project.clayBody ? (
              <View
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: Colors.earth[50], borderWidth: 1, borderColor: Colors.earth[100] }}
              >
                <Ionicons name="earth-outline" size={12} color={Colors.earth[400]} />
                <Text className="text-xs font-medium" style={{ color: Colors.earth[400] }}>
                  {project.clayBody}
                </Text>
              </View>
            ) : null}
            {project.glaze ? (
              <View
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: Colors.clay[50], borderWidth: 1, borderColor: Colors.clay[100] }}
              >
                <Ionicons name="color-palette-outline" size={12} color={Colors.clay[500]} />
                <Text className="text-xs font-medium" style={{ color: Colors.clay[500] }}>
                  {project.glaze}
                </Text>
              </View>
            ) : null}
          </View>

          {/* ── Glaze selector ── */}
          <View className="px-5 mb-5">
            {/* Glazing-stage prompt */}
            {project.stage === "Bisque" && !selectedGlaze && (
              <View
                style={{
                  backgroundColor: Colors.clay[50],
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: Colors.primary,
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <Ionicons name="color-palette-outline" size={18} color={Colors.primary} />
                <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.primaryDark, flex: 1 }}>
                  Ready to choose your glaze?
                </Text>
              </View>
            )}

            <View className="flex-row items-center justify-between mb-2">
              <Text
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: Colors.textTertiary }}
              >
                Glaze
              </Text>
              {selectedGlaze ? (
                <TouchableOpacity onPress={() => handleSelectGlaze("")}>
                  <Text className="text-xs font-medium" style={{ color: Colors.textTertiary }}>
                    Clear
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View className="flex-row flex-wrap gap-2">
              {glazeOptions.map((g) => {
                const active = g === selectedGlaze;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => handleSelectGlaze(g)}
                    className="px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: active ? Colors.clay[100] : Colors.surface,
                      borderWidth: active ? 1.5 : 1,
                      borderColor: active ? Colors.primary : Colors.border,
                    }}
                  >
                    <Text
                      className="text-sm"
                      style={{ color: active ? Colors.primaryDark : Colors.textSecondary }}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {showNewGlazeInput ? (
                <View className="flex-row items-center gap-2">
                  <TextInput
                    value={newGlazeInputText}
                    onChangeText={setNewGlazeInputText}
                    placeholder="Glaze name"
                    placeholderTextColor={Colors.textTertiary}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleAddGlaze}
                    style={{
                      backgroundColor: Colors.surface,
                      borderWidth: 1,
                      borderColor: Colors.clay[300],
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      fontSize: 14,
                      color: Colors.textPrimary,
                      minWidth: 110,
                    }}
                  />
                  <TouchableOpacity onPress={handleAddGlaze}>
                    <Ionicons name="checkmark-circle" size={26} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setShowNewGlazeInput(false); setNewGlazeInputText(""); }}>
                    <Ionicons name="close-circle" size={26} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowNewGlazeInput(true)}
                  className="flex-row items-center gap-1 px-3 py-1.5 rounded-full"
                  style={{ borderWidth: 1, borderColor: Colors.border, borderStyle: "dashed" }}
                >
                  <Ionicons name="add" size={14} color={Colors.textTertiary} />
                  <Text className="text-sm" style={{ color: Colors.textTertiary }}>
                    Add different glaze
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ── Notes ── */}
          <View className="px-5 mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: Colors.textTertiary }}
              >
                Notes
              </Text>
              {!editingNotes && (
                <TouchableOpacity onPress={() => setEditingNotes(true)}>
                  <Text className="text-xs font-medium" style={{ color: Colors.primary }}>
                    Edit
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {editingNotes ? (
              <TextInput
                value={notesText}
                onChangeText={setNotesText}
                multiline
                textAlignVertical="top"
                autoFocus
                onBlur={handleNotesBlur}
                placeholder="Add notes about this piece…"
                placeholderTextColor={Colors.textTertiary}
                style={{
                  backgroundColor: Colors.surface,
                  borderWidth: 1,
                  borderColor: Colors.clay[300],
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: Colors.textPrimary,
                  minHeight: 100,
                }}
              />
            ) : notesText ? (
              <TouchableOpacity onPress={() => setEditingNotes(true)}>
                <Text
                  className="text-sm leading-relaxed"
                  style={{ color: Colors.textSecondary }}
                >
                  {notesText}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setEditingNotes(true)}
                className="py-4 items-center rounded-xl"
                style={{ backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderStyle: "dashed" }}
              >
                <Text className="text-sm" style={{ color: Colors.textTertiary }}>
                  Tap to add notes…
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Mark next stage button ── */}
          {next && (
            <View className="px-5">
              <TouchableOpacity
                onPress={() => onAdvanceStage(project.id, next)}
                className="rounded-2xl py-4 flex-row items-center justify-center gap-2"
                style={{ backgroundColor: Colors.primary }}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: Colors.textInverse }}
                >
                  Mark as {next}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.textInverse} />
              </TouchableOpacity>
            </View>
          )}

          {project.stage === "Fired" && (
            <View className="px-5">
              <View
                className="rounded-2xl py-4 flex-row items-center justify-center gap-2"
                style={{ backgroundColor: Colors.successLight, borderWidth: 1, borderColor: Colors.success + "40" }}
              >
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text className="text-base font-semibold" style={{ color: Colors.success }}>
                  Complete
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
