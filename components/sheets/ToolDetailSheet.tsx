import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { Tool } from "@/lib/types";

interface Props {
  tool: Tool | null;
  onClose: () => void;
  onToggleOwned: (id: string) => void;
  onToggleWishList: (id: string) => void;
}

export function ToolDetailSheet({ tool, onClose, onToggleOwned, onToggleWishList }: Props) {
  if (!tool) return null;

  return (
    <Modal
      visible={!!tool}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(40,20,10,0.45)" }}
        onPress={onClose}
      />

      <View
        style={{
          backgroundColor: Colors.background,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          maxHeight: "82%",
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

        {/* Close */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute", top: 20, right: 20, zIndex: 10,
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: Colors.surface,
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Ionicons name="close" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* ── Large icon area ── */}
          <View
            style={{
              height: 160,
              backgroundColor: tool.iconColor + "22",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Decorative rings */}
            <View
              style={{
                position: "absolute", top: -24, right: -24,
                width: 100, height: 100, borderRadius: 50,
                backgroundColor: tool.iconColor + "14",
              }}
            />
            <View
              style={{
                position: "absolute", bottom: -16, left: -16,
                width: 72, height: 72, borderRadius: 36,
                backgroundColor: tool.iconColor + "14",
              }}
            />

            {/* Icon */}
            <View
              style={{
                width: 80, height: 80, borderRadius: 24,
                backgroundColor: tool.iconColor + "28",
                borderWidth: 1.5,
                borderColor: tool.iconColor + "40",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Ionicons
                name={tool.iconName as any}
                size={38}
                color={tool.iconColor}
              />
            </View>

            {/* Owned badge overlay */}
            {tool.owned && (
              <View
                style={{
                  position: "absolute", top: 16, left: 16,
                  flexDirection: "row", alignItems: "center", gap: 5,
                  backgroundColor: Colors.successLight,
                  borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
                  borderWidth: 1, borderColor: Colors.success + "40",
                }}
              >
                <Ionicons name="checkmark-circle" size={13} color={Colors.success} />
                <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.success }}>
                  In your kit
                </Text>
              </View>
            )}
            {!tool.owned && tool.wishList && (
              <View
                style={{
                  position: "absolute", top: 16, left: 16,
                  flexDirection: "row", alignItems: "center", gap: 5,
                  backgroundColor: Colors.warningLight,
                  borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
                  borderWidth: 1, borderColor: Colors.warning + "40",
                }}
              >
                <Ionicons name="bookmark" size={13} color={Colors.warning} />
                <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.warning }}>
                  Wish list
                </Text>
              </View>
            )}
          </View>

          {/* ── Content ── */}
          <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
            {/* Name */}
            <Text
              style={{
                fontFamily: "Georgia",
                fontSize: 24,
                color: Colors.textPrimary,
                marginBottom: 8,
              }}
            >
              {tool.name}
            </Text>

            {/* Primary use tag */}
            <View
              style={{
                flexDirection: "row", alignItems: "center", gap: 6,
                backgroundColor: Colors.clay[50],
                borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
                alignSelf: "flex-start", marginBottom: 18,
                borderWidth: 1, borderColor: Colors.clay[100],
              }}
            >
              <Ionicons name="construct-outline" size={12} color={Colors.clay[500]} />
              <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.clay[500] }}>
                {tool.primaryUse}
              </Text>
            </View>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: Colors.border, marginBottom: 16 }} />

            {/* Description */}
            <Text
              style={{
                fontFamily: "Georgia",
                fontSize: 16,
                color: Colors.textPrimary,
                marginBottom: 8,
              }}
            >
              About this tool
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.textSecondary,
                lineHeight: 22,
                marginBottom: 28,
              }}
            >
              {tool.description}
            </Text>

            {/* ── Action buttons ── */}
            <TouchableOpacity
              onPress={() => { onToggleOwned(tool.id); onClose(); }}
              style={{
                backgroundColor: tool.owned ? Colors.errorLight : Colors.primary,
                borderRadius: 16, paddingVertical: 14,
                alignItems: "center", flexDirection: "row",
                justifyContent: "center", gap: 8, marginBottom: 12,
                borderWidth: tool.owned ? 1 : 0,
                borderColor: tool.owned ? Colors.error + "60" : "transparent",
              }}
            >
              <Ionicons
                name={tool.owned ? "trash-outline" : "checkmark-circle-outline"}
                size={18}
                color={tool.owned ? Colors.error : Colors.textInverse}
              />
              <Text
                style={{
                  fontSize: 15, fontWeight: "600",
                  color: tool.owned ? Colors.error : Colors.textInverse,
                }}
              >
                {tool.owned ? "Remove from Kit" : "Mark as Owned"}
              </Text>
            </TouchableOpacity>

            {!tool.owned && (
              <TouchableOpacity
                onPress={() => { onToggleWishList(tool.id); onClose(); }}
                style={{
                  backgroundColor: tool.wishList ? Colors.warningLight : Colors.surface,
                  borderRadius: 16, paddingVertical: 14,
                  alignItems: "center", flexDirection: "row",
                  justifyContent: "center", gap: 8,
                  borderWidth: 1.5,
                  borderColor: tool.wishList ? Colors.warning + "60" : Colors.border,
                }}
              >
                <Ionicons
                  name={tool.wishList ? "bookmark" : "bookmark-outline"}
                  size={18}
                  color={tool.wishList ? Colors.warning : Colors.textSecondary}
                />
                <Text
                  style={{
                    fontSize: 15, fontWeight: "600",
                    color: tool.wishList ? Colors.warning : Colors.textSecondary,
                  }}
                >
                  {tool.wishList ? "Remove from Wish List" : "Add to Wish List"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
