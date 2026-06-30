import { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/colors";
import type { Project, ProjectStage } from "@/lib/types";
import { supabase } from "@/lib/supabase";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CLAY_BODIES = [
  "Terracotta",
  "Stoneware",
  "Porcelain",
  "Earthenware",
  "Raku",
  "Bone China",
];

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

const EMOJI_OPTIONS = [
  "🏺", "🫙", "🍵", "🥣", "🫖", "🍶",
  "🪴", "🌸", "🌿", "🧁", "🫗", "🥛",
  "🍜", "🍲", "🧊", "🎋",
];

// ─── Clay Selector ────────────────────────────────────────────────────────────

function ClaySelector({
  clayBodies,
  selected,
  onSelect,
  onAdd,
}: {
  clayBodies: string[];
  selected: string;
  onSelect: (v: string) => void;
  onAdd: (v: string) => void;
}) {
  const [query, setQuery] = useState(selected);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) setQuery(selected);
  }, [selected, open]);

  const filtered = clayBodies.filter((c) =>
    query.trim()
      ? c.toLowerCase().includes(query.trim().toLowerCase())
      : true
  );
  const exactMatch = clayBodies.some(
    (c) => c.toLowerCase() === query.trim().toLowerCase()
  );
  const canAddNew = query.trim().length > 0 && !exactMatch;
  const isSelected = !!selected && !open;

  function handleFocus() {
    setOpen(true);
    setQuery("");
  }

  function handleSelect(clay: string) {
    onSelect(clay);
    setQuery(clay);
    setOpen(false);
  }

  function handleAddNew() {
    const t = query.trim();
    if (!t) return;
    onAdd(t);
    setQuery(t);
    setOpen(false);
  }

  function handleBlur() {
    setTimeout(() => {
      setOpen(false);
      setQuery(selected);
    }, 150);
  }

  return (
    <View>
      {/* Search / selected input */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: open
            ? Colors.clay[300]
            : selected
            ? Colors.primary
            : Colors.border,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: Platform.OS === "ios" ? 10 : 6,
          gap: 8,
        }}
      >
        <Ionicons
          name={isSelected ? "checkmark-circle" : "search-outline"}
          size={16}
          color={isSelected ? Colors.primary : Colors.textTertiary}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search or add clay body…"
          placeholderTextColor={Colors.textTertiary}
          returnKeyType="done"
          onSubmitEditing={() => {
            if (canAddNew) handleAddNew();
            else if (filtered.length === 1) handleSelect(filtered[0]);
          }}
          style={{
            flex: 1,
            fontSize: 14,
            color: isSelected ? Colors.primaryDark : Colors.textPrimary,
            fontWeight: isSelected ? "600" : "400",
            ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
          }}
        />
        {selected && !open && (
          <TouchableOpacity
            onPress={() => { onSelect(""); setQuery(""); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={Colors.clay[300]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown */}
      {open && (
        <View
          style={{
            marginTop: 4,
            backgroundColor: Colors.background,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 12,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {filtered.length === 0 && !canAddNew && (
            <View style={{ padding: 14 }}>
              <Text style={{ fontSize: 14, color: Colors.textTertiary }}>
                No matches
              </Text>
            </View>
          )}

          {filtered.map((clay, i) => {
            const isActive = clay === selected;
            const isLast = i === filtered.length - 1 && !canAddNew;
            return (
              <TouchableOpacity
                key={clay}
                onPress={() => handleSelect(clay)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderBottomWidth: isLast ? 0 : 1,
                  borderBottomColor: Colors.border,
                  gap: 10,
                  backgroundColor: isActive ? Colors.clay[50] : "transparent",
                }}
              >
                {isActive ? (
                  <Ionicons name="checkmark" size={14} color={Colors.primary} />
                ) : (
                  <View style={{ width: 14 }} />
                )}
                <Text
                  style={{
                    fontSize: 14,
                    color: isActive ? Colors.primaryDark : Colors.textPrimary,
                    fontWeight: isActive ? "600" : "400",
                  }}
                >
                  {clay}
                </Text>
              </TouchableOpacity>
            );
          })}

          {canAddNew && (
            <TouchableOpacity
              onPress={handleAddNew}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderTopWidth: filtered.length > 0 ? 1 : 0,
                borderTopColor: Colors.border,
                gap: 8,
              }}
            >
              <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
              <Text style={{ fontSize: 14, color: Colors.primary, fontWeight: "500" }}>
                Add "{query.trim()}"
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (project: Project) => void;
  userId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AddProjectSheet({ visible, onClose, onAdd, userId }: Props) {
  const [name, setName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🏺");
  const [customEmojiInput, setCustomEmojiInput] = useState("");
  const [clayBodies, setClayBodies] = useState(DEFAULT_CLAY_BODIES);
  const [selectedClay, setSelectedClay] = useState("");
  const [glazeOptions, setGlazeOptions] = useState(DEFAULT_GLAZE_OPTIONS);
  const [selectedGlaze, setSelectedGlaze] = useState("");
  const [showNewGlaze, setShowNewGlaze] = useState(false);
  const [newGlazeText, setNewGlazeText] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  function reset() {
    setName("");
    setSelectedEmoji("🏺");
    setCustomEmojiInput("");
    setSelectedClay("");
    setSelectedGlaze("");
    setShowNewGlaze(false);
    setNewGlazeText("");
    setNotes("");
    setPhotoUri(null);
    setClayBodies(DEFAULT_CLAY_BODIES);
    setGlazeOptions(DEFAULT_GLAZE_OPTIONS);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handlePickPhoto() {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  function handleAddClay(clay: string) {
    if (!clayBodies.includes(clay)) {
      setClayBodies((prev) => [...prev, clay]);
    }
    setSelectedClay(clay);
  }

  function handleAddGlaze() {
    const trimmed = newGlazeText.trim();
    if (!trimmed) return;
    setGlazeOptions((prev) => [...prev, trimmed]);
    setSelectedGlaze(trimmed);
    setNewGlazeText("");
    setShowNewGlaze(false);
  }

  async function handleSave() {
    if (!name.trim()) return;
    const session = await supabase.auth.getSession();
    const uid = session.data.session?.user.id;
    if (!uid) {
      Alert.alert("Not signed in", "Please sign in before saving a project.");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("projects") as any)
      .insert({
        user_id: uid,
        name: name.trim(),
        emoji: selectedEmoji,
        stage: "Wedged" as ProjectStage,
        clay_body: selectedClay,
        glaze: selectedGlaze,
        notes: notes.trim(),
      })
      .select()
      .single();
    if (error) {
      Alert.alert("Save failed", error.message ?? "Unknown error");
      console.log("insert project error", error);
      return;
    }
    const project: Project = {
      id: data.id,
      name: data.name,
      emoji: data.emoji,
      stage: data.stage as ProjectStage,
      clayBody: data.clay_body,
      glaze: data.glaze,
      notes: data.notes,
      photoUris: photoUri ? [photoUri] : [],
      updatedAt: "just now",
    };
    onAdd(project);
    reset();
    onClose();
  }

  const canSave = name.trim().length > 0;

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
        {/* Scrim */}
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(40,20,10,0.45)" }}
          onPress={handleClose}
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
          <View className="flex-row items-center justify-between px-5 py-3">
            <Text
              className="text-xl"
              style={{ fontFamily: "Georgia", color: Colors.textPrimary }}
            >
              New Project
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: Colors.surface }}
            >
              <Ionicons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          >
            {/* ── Emoji picker ── */}
            <View className="mb-5">
              <Text
                className="text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: Colors.textTertiary }}
              >
                Icon
              </Text>
              <View className="flex-row items-center gap-3">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flex: 1 }}
                >
                  <View className="flex-row gap-2">
                    {EMOJI_OPTIONS.map((e) => (
                      <TouchableOpacity
                        key={e}
                        onPress={() => { setSelectedEmoji(e); setCustomEmojiInput(""); }}
                        className="w-11 h-11 rounded-xl items-center justify-center"
                        style={{
                          backgroundColor:
                            e === selectedEmoji && !customEmojiInput
                              ? Colors.clay[100]
                              : Colors.surface,
                          borderWidth:
                            e === selectedEmoji && !customEmojiInput ? 2 : 1,
                          borderColor:
                            e === selectedEmoji && !customEmojiInput
                              ? Colors.primary
                              : Colors.border,
                        }}
                      >
                        <Text className="text-2xl">{e}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* Custom emoji input */}
                <TextInput
                  value={customEmojiInput}
                  onChangeText={(v) => {
                    setCustomEmojiInput(v);
                    if (v.trim()) setSelectedEmoji(v.trim());
                  }}
                  placeholder="✏️"
                  placeholderTextColor={Colors.textTertiary}
                  maxLength={4}
                  style={{
                    backgroundColor: Colors.surface,
                    borderWidth: customEmojiInput ? 2 : 1,
                    borderColor: customEmojiInput ? Colors.primary : Colors.border,
                    borderRadius: 12,
                    width: 48,
                    height: 48,
                    fontSize: 20,
                    color: Colors.textPrimary,
                    textAlign: "center",
                    ...(Platform.OS === "web"
                      ? ({ outlineStyle: "none" } as any)
                      : {}),
                  }}
                />
              </View>
            </View>

            {/* ── Project name ── */}
            <View className="mb-5">
              <Text
                className="text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: Colors.textTertiary }}
              >
                Project Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Terracotta Bowl Set"
                placeholderTextColor={Colors.textTertiary}
                returnKeyType="next"
                style={{
                  backgroundColor: Colors.surface,
                  borderWidth: 1,
                  borderColor: name ? Colors.clay[300] : Colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 15,
                  color: Colors.textPrimary,
                  ...(Platform.OS === "web"
                    ? ({ outlineStyle: "none" } as any)
                    : {}),
                }}
              />
            </View>

            {/* ── Photo upload ── */}
            <View className="mb-5">
              <Text
                className="text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: Colors.textTertiary }}
              >
                Photo
              </Text>
              <TouchableOpacity
                onPress={handlePickPhoto}
                className="flex-row items-center gap-3"
              >
                {photoUri ? (
                  <Image
                    source={{ uri: photoUri }}
                    style={{ width: 72, height: 72, borderRadius: 12 }}
                  />
                ) : (
                  <View
                    className="w-[72px] h-[72px] rounded-xl items-center justify-center"
                    style={{
                      backgroundColor: Colors.surface,
                      borderWidth: 1.5,
                      borderColor: Colors.border,
                      borderStyle: "dashed",
                    }}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={24}
                      color={Colors.textTertiary}
                    />
                  </View>
                )}
                <Text
                  className="text-sm font-medium"
                  style={{ color: Colors.primary }}
                >
                  {photoUri ? "Change photo" : "Add a photo"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Clay body ── */}
            <View className="mb-5">
              <Text
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: Colors.textTertiary }}
              >
                Clay Body
              </Text>
              <ClaySelector
                clayBodies={clayBodies}
                selected={selectedClay}
                onSelect={setSelectedClay}
                onAdd={handleAddClay}
              />
            </View>

            {/* ── Glaze ── */}
            <View className="mb-5">
              <Text
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: Colors.textTertiary }}
              >
                Glaze{" "}
                <Text
                  style={{
                    color: Colors.smoke[400],
                    fontWeight: "400",
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  (optional)
                </Text>
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {glazeOptions.map((g) => {
                  const active = g === selectedGlaze;
                  return (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setSelectedGlaze(active ? "" : g)}
                      className="px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: active ? Colors.clay[100] : Colors.surface,
                        borderWidth: active ? 1.5 : 1,
                        borderColor: active ? Colors.primary : Colors.border,
                      }}
                    >
                      <Text
                        className="text-sm"
                        style={{
                          color: active ? Colors.primaryDark : Colors.textSecondary,
                        }}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {showNewGlaze ? (
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      value={newGlazeText}
                      onChangeText={setNewGlazeText}
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
                      <Ionicons
                        name="checkmark-circle"
                        size={26}
                        color={Colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setShowNewGlaze(false);
                        setNewGlazeText("");
                      }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={26}
                        color={Colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setShowNewGlaze(true)}
                    className="flex-row items-center gap-1 px-3 py-1.5 rounded-full"
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.border,
                      borderStyle: "dashed",
                    }}
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
            <View className="mb-6">
              <Text
                className="text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: Colors.textTertiary }}
              >
                Notes{" "}
                <Text
                  style={{
                    color: Colors.smoke[400],
                    fontWeight: "400",
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  (optional)
                </Text>
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Anything to remember about this piece…"
                placeholderTextColor={Colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{
                  backgroundColor: Colors.surface,
                  borderWidth: 1,
                  borderColor: notes ? Colors.clay[300] : Colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 15,
                  color: Colors.textPrimary,
                  minHeight: 96,
                }}
              />
            </View>

            {/* ── Save button ── */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={!canSave}
              className="rounded-2xl py-4 items-center"
              style={{
                backgroundColor: canSave ? Colors.primary : Colors.clay[200],
              }}
            >
              <Text
                className="text-base font-semibold"
                style={{
                  color: canSave ? Colors.textInverse : Colors.clay[400],
                }}
              >
                Save Project
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
