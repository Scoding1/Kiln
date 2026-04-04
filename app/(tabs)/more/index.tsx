import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";

// ─── Time-aware greeting ──────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Menu config ─────────────────────────────────────────────────────────────

interface MenuItem {
  route: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    route: "/more/inventory",
    icon: "cube-outline",
    iconColor: Colors.clay[600],
    iconBg: Colors.clay[50],
    title: "Inventory",
    subtitle: "Track clay, glazes and studio supplies",
  },
  {
    route: "/more/toolkit",
    icon: "construct-outline",
    iconColor: Colors.earth[500],
    iconBg: Colors.earth[50],
    title: "Tool Kit",
    subtitle: "Your owned tools and wish list",
  },
  {
    route: "/more/wishlist",
    icon: "bookmark-outline",
    iconColor: Colors.warning,
    iconBg: Colors.warningLight,
    title: "Wish List",
    subtitle: "Saved glazes, tools and techniques",
  },
  {
    route: "/more/profile",
    icon: "person-outline",
    iconColor: Colors.info,
    iconBg: Colors.infoLight,
    title: "Profile & Settings",
    subtitle: "Account, preferences and app settings",
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MoreScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 32,
          paddingBottom: Platform.OS === "ios" ? 40 : 28,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting ── */}
        <Text
          style={{
            fontSize: 13,
            color: Colors.textSecondary,
            marginBottom: 4,
            fontWeight: "500",
          }}
        >
          {getGreeting()}
        </Text>
        <Text
          style={{
            fontFamily: "Georgia",
            fontSize: 30,
            color: Colors.textPrimary,
            marginBottom: 32,
          }}
        >
          Your Studio
        </Text>

        {/* ── Menu card ── */}
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: Colors.border,
            overflow: "hidden",
          }}
        >
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.route}
              activeOpacity={0.78}
              onPress={() => router.push(item.route as any)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
                paddingHorizontal: 16,
                gap: 14,
                borderBottomWidth: index < MENU_ITEMS.length - 1 ? 1 : 0,
                borderBottomColor: Colors.border,
              }}
            >
              {/* Icon */}
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  backgroundColor: item.iconBg,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  borderWidth: 1,
                  borderColor: item.iconColor + "30",
                }}
              >
                <Ionicons name={item.icon} size={22} color={item.iconColor} />
              </View>

              {/* Text */}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: Colors.textPrimary,
                    marginBottom: 2,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{ fontSize: 13, color: Colors.textSecondary }}
                  numberOfLines={1}
                >
                  {item.subtitle}
                </Text>
              </View>

              {/* Chevron */}
              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
