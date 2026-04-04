import { useState, useMemo } from "react";
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
import { useRouter, Link } from "expo-router";
import { Colors } from "@/constants/colors";

// ─── Types ────────────────────────────────────────────────────────────────────

type SkillCategory = "Throwing" | "Handbuilding" | "Glazing" | "Finishing";
type ProfileTab = "Skills" | "Achievements" | "History";

interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  tried: boolean;
}

interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
}

interface Achievement extends AchievementDef {
  unlocked: boolean;
  progress: number; // 0–1
  hint: string;
}

interface HistoryItem {
  id: string;
  text: string;
  date: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
}

// ─── Level system ─────────────────────────────────────────────────────────────

const LEVELS = [
  { name: "Beginner",      color: Colors.smoke[500],  bg: Colors.smoke[100],  minXP: 0,   nextXP: 50  },
  { name: "Intermediate",  color: Colors.clay[500],   bg: Colors.clay[50],    minXP: 50,  nextXP: 150 },
  { name: "Advanced",      color: Colors.earth[400],  bg: Colors.earth[50],   minXP: 150, nextXP: 350 },
  { name: "Master Potter", color: Colors.warning,     bg: Colors.warningLight, minXP: 350, nextXP: null },
];

function getCurrentLevel(xp: number) {
  return [...LEVELS].reverse().find((l) => xp >= l.minXP) ?? LEVELS[0];
}

function getNextLevel(xp: number) {
  const idx = LEVELS.findIndex((l) => xp < (l.nextXP ?? Infinity));
  return idx >= 0 ? LEVELS[idx] : null;
}

function getLevelProgress(xp: number): number {
  const lvl = getCurrentLevel(xp);
  if (!lvl.nextXP) return 1;
  return (xp - lvl.minXP) / (lvl.nextXP - lvl.minXP);
}

// ─── Skill data ───────────────────────────────────────────────────────────────

const SKILL_CATEGORIES: SkillCategory[] = [
  "Throwing",
  "Handbuilding",
  "Glazing",
  "Finishing",
];

const CAT_META: Record<
  SkillCategory,
  { icon: React.ComponentProps<typeof Ionicons>["name"]; color: string }
> = {
  Throwing:     { icon: "ellipse-outline",        color: Colors.clay[500]  },
  Handbuilding: { icon: "hand-right-outline",      color: Colors.earth[400] },
  Glazing:      { icon: "color-palette-outline",   color: Colors.info       },
  Finishing:    { icon: "flame-outline",           color: "#E06B3A"         },
};

// TODO: replace tried state with Supabase user_skills table
const SEED_SKILLS: Skill[] = [
  // Throwing (12)
  { id: "t1",  name: "Centering",       category: "Throwing",     tried: true  },
  { id: "t2",  name: "Opening",         category: "Throwing",     tried: true  },
  { id: "t3",  name: "Pulling Walls",   category: "Throwing",     tried: true  },
  { id: "t4",  name: "Cylinder",        category: "Throwing",     tried: true  },
  { id: "t5",  name: "Bowl Form",       category: "Throwing",     tried: false },
  { id: "t6",  name: "Collaring",       category: "Throwing",     tried: false },
  { id: "t7",  name: "Vase Form",       category: "Throwing",     tried: false },
  { id: "t8",  name: "Foot Trimming",   category: "Throwing",     tried: true  },
  { id: "t9",  name: "Compressing",     category: "Throwing",     tried: true  },
  { id: "t10", name: "Off-centre Work", category: "Throwing",     tried: false },
  { id: "t11", name: "Fluting",         category: "Throwing",     tried: false },
  { id: "t12", name: "Pulled Handles",  category: "Throwing",     tried: false },
  // Handbuilding (8)
  { id: "h1",  name: "Pinch Pot",       category: "Handbuilding", tried: true  },
  { id: "h2",  name: "Coiling",         category: "Handbuilding", tried: true  },
  { id: "h3",  name: "Slab Building",   category: "Handbuilding", tried: false },
  { id: "h4",  name: "Scoring & Slip",  category: "Handbuilding", tried: true  },
  { id: "h5",  name: "Texturing",       category: "Handbuilding", tried: false },
  { id: "h6",  name: "Carving",         category: "Handbuilding", tried: false },
  { id: "h7",  name: "Mold Making",     category: "Handbuilding", tried: false },
  { id: "h8",  name: "Press Mold",      category: "Handbuilding", tried: false },
  // Glazing (8)
  { id: "g1",  name: "Brush Glazing",   category: "Glazing",      tried: true  },
  { id: "g2",  name: "Dipping",         category: "Glazing",      tried: false },
  { id: "g3",  name: "Pouring",         category: "Glazing",      tried: false },
  { id: "g4",  name: "Spraying",        category: "Glazing",      tried: false },
  { id: "g5",  name: "Wax Resist",      category: "Glazing",      tried: false },
  { id: "g6",  name: "Layering",        category: "Glazing",      tried: false },
  { id: "g7",  name: "Underglaze",      category: "Glazing",      tried: true  },
  { id: "g8",  name: "Majolica",        category: "Glazing",      tried: false },
  // Finishing (7)
  { id: "f1",  name: "Burnishing",      category: "Finishing",    tried: false },
  { id: "f2",  name: "Bisque Firing",   category: "Finishing",    tried: true  },
  { id: "f3",  name: "Glaze Firing",    category: "Finishing",    tried: true  },
  { id: "f4",  name: "Kiln Loading",    category: "Finishing",    tried: true  },
  { id: "f5",  name: "Kiln Washing",    category: "Finishing",    tried: false },
  { id: "f6",  name: "Raku Firing",     category: "Finishing",    tried: false },
  { id: "f7",  name: "Reduction",       category: "Finishing",    tried: false },
];

// ─── Achievement definitions ──────────────────────────────────────────────────

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: "first-throw",     name: "First Throw",     desc: "Tried your first throwing technique",  icon: "water-outline",         color: Colors.clay[500]  },
  { id: "shape-shifter",   name: "Shape Shifter",   desc: "Tried 5 throwing techniques",          icon: "repeat-outline",        color: Colors.earth[400] },
  { id: "fire-starter",    name: "Fire Starter",    desc: "Completed a kiln firing",              icon: "flame-outline",         color: "#E06B3A"         },
  { id: "colour-explorer", name: "Colour Explorer", desc: "Tried 2 glazing techniques",           icon: "color-palette-outline", color: Colors.info       },
  { id: "well-rounded",    name: "Well Rounded",    desc: "Skills in all 4 categories",           icon: "grid-outline",          color: Colors.success    },
  { id: "pinch-pro",       name: "Pinch Pro",       desc: "Tried 4 handbuilding techniques",      icon: "hand-right-outline",    color: Colors.clay[600]  },
  { id: "tool-up",         name: "Tool Up",         desc: "Own 5 or more tools",                  icon: "construct-outline",     color: Colors.earth[500] },
  { id: "glaze-guru",      name: "Glaze Guru",      desc: "Tried 5 glazing techniques",           icon: "star-outline",          color: "#9C6FBE"         },
  { id: "collector",       name: "Collector",       desc: "Saved 5 glazes",                       icon: "heart-outline",         color: Colors.error      },
  { id: "studio-regular",  name: "Studio Regular",  desc: "Logged 20 pieces made",                icon: "ribbon-outline",        color: Colors.clay[400]  },
  { id: "kiln-master",     name: "Kiln Master",     desc: "Completed 10 kiln firings",            icon: "thermometer-outline",   color: "#E06B3A"         },
  { id: "master-potter",   name: "Master Potter",   desc: "Reached Master Potter level",          icon: "trophy-outline",        color: Colors.warning    },
];

function computeAchievements(skills: Skill[]): Achievement[] {
  const throwingTried  = skills.filter((s) => s.category === "Throwing"     && s.tried).length;
  const handbuildTried = skills.filter((s) => s.category === "Handbuilding" && s.tried).length;
  const glazingTried   = skills.filter((s) => s.category === "Glazing"      && s.tried).length;
  const finishingTried = skills.filter((s) => s.category === "Finishing"    && s.tried).length;
  const xp             = skills.filter((s) => s.tried).length * 5;

  const data: Record<string, { unlocked: boolean; progress: number; hint: string }> = {
    "first-throw":     { unlocked: throwingTried >= 1,                                     progress: Math.min(throwingTried  / 1,  1), hint: "Try 1 throwing skill"                      },
    "shape-shifter":   { unlocked: throwingTried >= 5,                                     progress: Math.min(throwingTried  / 5,  1), hint: `${throwingTried}/5 throwing skills`        },
    "fire-starter":    { unlocked: finishingTried >= 1,                                    progress: Math.min(finishingTried / 1,  1), hint: "Try bisque or glaze firing"               },
    "colour-explorer": { unlocked: glazingTried >= 2,                                      progress: Math.min(glazingTried   / 2,  1), hint: `${glazingTried}/2 glazing skills`          },
    "well-rounded":    {
      unlocked: throwingTried >= 1 && handbuildTried >= 1 && glazingTried >= 1 && finishingTried >= 1,
      progress: [throwingTried, handbuildTried, glazingTried, finishingTried].filter((n) => n > 0).length / 4,
      hint: "At least 1 skill in each category",
    },
    "pinch-pro":       { unlocked: handbuildTried >= 4,  progress: Math.min(handbuildTried / 4,  1), hint: `${handbuildTried}/4 handbuilding skills`   },
    "tool-up":         { unlocked: false,                progress: 0.8,                             hint: "Own 5 tools (4 owned so far)"              },
    "glaze-guru":      { unlocked: glazingTried >= 5,    progress: Math.min(glazingTried   / 5,  1), hint: `${glazingTried}/5 glazing skills`          },
    "collector":       { unlocked: false,                progress: 0.4,                             hint: "Save 5 glazes (2 saved so far)"            },
    "studio-regular":  { unlocked: false,                progress: 7 / 20,                          hint: "Log 20 pieces (7 logged so far)"           },
    "kiln-master":     { unlocked: false,                progress: 2 / 10,                          hint: "10 kiln firings (2 done)"                  },
    "master-potter":   { unlocked: xp >= 350,            progress: Math.min(xp / 350,        1), hint: `${xp}/350 XP needed`                       },
  };

  return ACHIEVEMENT_DEFS.map((def) => ({ ...def, ...data[def.id] }));
}

// ─── Stats ────────────────────────────────────────────────────────────────────

// TODO: wire to Supabase
const STATS = [
  { label: "Pieces Made",      value: "7", icon: "layers-outline"        as React.ComponentProps<typeof Ionicons>["name"], color: Colors.clay[500], href: "/projects"   },
  { label: "In My Collection", value: "2", icon: "color-palette-outline" as React.ComponentProps<typeof Ionicons>["name"], color: Colors.info,      href: "/glazes"     },
  { label: "Techniques",       value: "3", icon: "book-outline"          as React.ComponentProps<typeof Ionicons>["name"], color: Colors.success,   href: "/techniques" },
  { label: "Kiln Firings",     value: "2", icon: "flame-outline"         as React.ComponentProps<typeof Ionicons>["name"], color: "#E06B3A",        href: "/projects"   },
];

// ─── History ──────────────────────────────────────────────────────────────────

// TODO: derive from Supabase event log
const SEED_HISTORY: HistoryItem[] = [
  { id: "1",  text: "Marked 'Glaze Firing' as tried",         date: "Today",       icon: "checkmark-circle", iconColor: Colors.success  },
  { id: "2",  text: "Unlocked 'Well Rounded' achievement",    date: "Today",       icon: "trophy",           iconColor: Colors.warning  },
  { id: "3",  text: "Marked 'Kiln Loading' as tried",         date: "Yesterday",   icon: "checkmark-circle", iconColor: Colors.success  },
  { id: "4",  text: "Marked 'Underglaze' as tried",           date: "2 days ago",  icon: "checkmark-circle", iconColor: Colors.success  },
  { id: "5",  text: "Marked 'Bisque Firing' as tried",        date: "2 days ago",  icon: "checkmark-circle", iconColor: Colors.success  },
  { id: "6",  text: "Unlocked 'Fire Starter' achievement",    date: "2 days ago",  icon: "trophy",           iconColor: Colors.warning  },
  { id: "7",  text: "Saved 'Floating Blue' glaze",            date: "4 days ago",  icon: "heart",            iconColor: Colors.error    },
  { id: "8",  text: "Marked 'Brush Glazing' as tried",        date: "1 week ago",  icon: "checkmark-circle", iconColor: Colors.success  },
  { id: "9",  text: "Unlocked 'Colour Explorer' achievement", date: "1 week ago",  icon: "trophy",           iconColor: Colors.warning  },
  { id: "10", text: "Marked 'Foot Trimming' as tried",        date: "1 week ago",  icon: "checkmark-circle", iconColor: Colors.success  },
  { id: "11", text: "Unlocked 'Shape Shifter' achievement",   date: "2 weeks ago", icon: "trophy",           iconColor: Colors.warning  },
  { id: "12", text: "Marked 'Centering' as tried",            date: "2 weeks ago", icon: "checkmark-circle", iconColor: Colors.success  },
  { id: "13", text: "Unlocked 'First Throw' achievement",     date: "2 weeks ago", icon: "trophy",           iconColor: Colors.warning  },
  { id: "14", text: "Joined Kiln",                            date: "2 weeks ago", icon: "leaf",             iconColor: Colors.clay[500]},
];

// ─── Tab switcher ─────────────────────────────────────────────────────────────

function TabSwitcher({
  active,
  onChange,
}: {
  active: ProfileTab;
  onChange: (t: ProfileTab) => void;
}) {
  const TABS: ProfileTab[] = ["Skills", "Achievements", "History"];
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: Colors.surface,
        borderRadius: 14,
        padding: 3,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 22,
      }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onChange(tab)}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 11,
              alignItems: "center",
              backgroundColor: isActive ? Colors.background : "transparent",
              shadowColor: isActive ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.07,
              shadowRadius: 3,
              elevation: isActive ? 2 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: isActive ? "600" : "400",
                color: isActive ? Colors.textPrimary : Colors.textTertiary,
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Skills tab ───────────────────────────────────────────────────────────────

function SkillsTab({
  skills,
  onToggle,
}: {
  skills: Skill[];
  onToggle: (id: string) => void;
}) {
  return (
    <View>
      {SKILL_CATEGORIES.map((cat) => {
        const catSkills = skills.filter((s) => s.category === cat);
        const triedCount = catSkills.filter((s) => s.tried).length;
        const meta = CAT_META[cat];

        return (
          <View key={cat} style={{ marginBottom: 24 }}>
            {/* Category header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 7,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  backgroundColor: meta.color + "18",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={meta.icon} size={14} color={meta.color} />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: meta.color,
                  textTransform: "uppercase",
                  letterSpacing: 0.7,
                  flex: 1,
                }}
              >
                {cat}
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textTertiary }}>
                {triedCount}/{catSkills.length}
              </Text>
              {/* Mini progress bar */}
              <View
                style={{
                  width: 48,
                  height: 4,
                  backgroundColor: Colors.border,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${(triedCount / catSkills.length) * 100}%`,
                    height: 4,
                    backgroundColor: meta.color,
                    borderRadius: 2,
                  }}
                />
              </View>
            </View>

            {/* Chip grid */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {catSkills.map((skill) => (
                <TouchableOpacity
                  key={skill.id}
                  onPress={() => onToggle(skill.id)}
                  activeOpacity={0.76}
                  style={{
                    paddingHorizontal: 13,
                    paddingVertical: 7,
                    borderRadius: 20,
                    backgroundColor: skill.tried ? Colors.primary : Colors.surface,
                    borderWidth: 1,
                    borderColor: skill.tried ? Colors.primary : Colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {skill.tried && (
                    <Ionicons name="checkmark" size={11} color={Colors.textInverse} />
                  )}
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: skill.tried ? "600" : "400",
                      color: skill.tried ? Colors.textInverse : Colors.textSecondary,
                    }}
                  >
                    {skill.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })}

      {/* Footer hint */}
      <Text
        style={{
          fontSize: 12,
          color: Colors.textTertiary,
          textAlign: "center",
          paddingVertical: 8,
        }}
      >
        Tap a skill to mark it as tried
      </Text>
    </View>
  );
}

// ─── Achievements tab ─────────────────────────────────────────────────────────

function AchievementBadge({ a }: { a: Achievement }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: a.unlocked ? a.color + "50" : Colors.border,
        padding: 12,
        alignItems: "center",
        minHeight: 120,
      }}
    >
      {/* Icon circle */}
      <View style={{ position: "relative", marginBottom: 8 }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: a.unlocked ? a.color + "1E" : Colors.smoke[100],
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: a.unlocked ? a.color + "40" : Colors.border,
          }}
        >
          <Ionicons
            name={a.icon}
            size={24}
            color={a.unlocked ? a.color : Colors.smoke[300]}
          />
        </View>
        {!a.unlocked && (
          <View
            style={{
              position: "absolute",
              bottom: -3,
              right: -3,
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: Colors.smoke[200],
              borderWidth: 1.5,
              borderColor: Colors.background,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="lock-closed" size={9} color={Colors.smoke[600]} />
          </View>
        )}
      </View>

      {/* Name */}
      <Text
        style={{
          fontSize: 11,
          fontWeight: "600",
          textAlign: "center",
          color: a.unlocked ? Colors.textPrimary : Colors.textTertiary,
          lineHeight: 15,
          marginBottom: 6,
        }}
        numberOfLines={2}
      >
        {a.name}
      </Text>

      {/* Progress bar for locked achievements with some progress */}
      {!a.unlocked && a.progress > 0 && (
        <View
          style={{
            width: "100%",
            height: 3,
            backgroundColor: Colors.border,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${a.progress * 100}%`,
              height: 3,
              backgroundColor: Colors.primary + "80",
              borderRadius: 2,
            }}
          />
        </View>
      )}
    </View>
  );
}

function AchievementsTab({ achievements }: { achievements: Achievement[] }) {
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked   = achievements.filter((a) => !a.unlocked);

  function rows(items: Achievement[]) {
    const chunks: Achievement[][] = [];
    for (let i = 0; i < items.length; i += 3) {
      chunks.push(items.slice(i, i + 3));
    }
    return chunks;
  }

  return (
    <View>
      {/* Unlocked */}
      {unlocked.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: Colors.success,
              textTransform: "uppercase",
              letterSpacing: 0.7,
              marginBottom: 12,
            }}
          >
            Unlocked · {unlocked.length}
          </Text>
          {rows(unlocked).map((row, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
              {row.map((a) => (
                <AchievementBadge key={a.id} a={a} />
              ))}
              {Array.from({ length: 3 - row.length }).map((_, j) => (
                <View key={j} style={{ flex: 1 }} />
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: Colors.textTertiary,
              textTransform: "uppercase",
              letterSpacing: 0.7,
              marginBottom: 12,
            }}
          >
            Locked · {locked.length}
          </Text>

          {/* Selected locked achievements with hints */}
          {locked.filter((a) => a.progress > 0).map((a) => (
            <View
              key={a.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: Colors.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: Colors.border,
                padding: 12,
                marginBottom: 8,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: Colors.smoke[100],
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Ionicons name={a.icon} size={20} color={Colors.smoke[300]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginBottom: 3 }}>
                  {a.name}
                </Text>
                <Text style={{ fontSize: 11, color: Colors.textTertiary, marginBottom: 6 }}>
                  {a.hint}
                </Text>
                <View style={{ height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: "hidden" }}>
                  <View
                    style={{
                      width: `${a.progress * 100}%`,
                      height: 4,
                      backgroundColor: Colors.primary,
                      borderRadius: 2,
                    }}
                  />
                </View>
              </View>
              <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.textTertiary, flexShrink: 0 }}>
                {Math.round(a.progress * 100)}%
              </Text>
            </View>
          ))}

          {/* Remaining locked as grid */}
          {rows(locked.filter((a) => a.progress === 0)).map((row, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
              {row.map((a) => (
                <AchievementBadge key={a.id} a={a} />
              ))}
              {Array.from({ length: 3 - row.length }).map((_, j) => (
                <View key={j} style={{ flex: 1 }} />
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── History tab ──────────────────────────────────────────────────────────────

function HistoryTab({ items }: { items: HistoryItem[] }) {
  // Preserve insertion order of dates
  const dates = [...new Set(items.map((i) => i.date))];
  const byDate = items.reduce<Record<string, HistoryItem[]>>((acc, item) => {
    (acc[item.date] ??= []).push(item);
    return acc;
  }, {});

  return (
    <View>
      {dates.map((date) => (
        <View key={date} style={{ marginBottom: 22 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: Colors.textTertiary,
              textTransform: "uppercase",
              letterSpacing: 0.7,
              marginBottom: 10,
            }}
          >
            {date}
          </Text>
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              overflow: "hidden",
            }}
          >
            {byDate[date].map((item, idx) => (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 11,
                  paddingHorizontal: 14,
                  gap: 12,
                  borderBottomWidth: idx < byDate[date].length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: item.iconColor + "20",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Ionicons name={item.icon} size={15} color={item.iconColor} />
                </View>
                <Text
                  style={{ fontSize: 13, color: Colors.textPrimary, flex: 1, lineHeight: 18 }}
                >
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <Text
        style={{
          fontSize: 12,
          color: Colors.textTertiary,
          textAlign: "center",
          paddingVertical: 8,
        }}
      >
        Activity from the last 2 weeks
      </Text>
    </View>
  );
}

// ─── Account section ─────────────────────────────────────────────────────────

interface AccountRowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  onPress: () => void;
  titleColor?: string;
  showChevron?: boolean;
  isLast?: boolean;
}

function AccountRow({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  rightSlot,
  onPress,
  titleColor,
  showChevron = true,
  isLast = false,
}: AccountRowProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: Colors.border,
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          borderWidth: 1,
          borderColor: iconColor + "30",
        }}
      >
        <Ionicons name={icon} size={19} color={iconColor} />
      </View>

      {/* Text */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "500",
            color: titleColor ?? Colors.textPrimary,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 1 }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Right slot + chevron */}
      {rightSlot}
      {showChevron && (
        <Ionicons name="chevron-forward" size={17} color={Colors.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

function AccountSection({ onLogOut }: { onLogOut: () => void }) {
  return (
    <View style={{ paddingHorizontal: 20, marginTop: 24, marginBottom: 8 }}>
      <Text
        style={{
          fontFamily: "Georgia",
          fontSize: 18,
          color: Colors.textPrimary,
          marginBottom: 12,
        }}
      >
        Account
      </Text>

      <View
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: Colors.border,
          overflow: "hidden",
        }}
      >
        {/* Email */}
        <AccountRow
          icon="mail-outline"
          iconBg={Colors.infoLight}
          iconColor={Colors.info}
          title="Email"
          subtitle="sarah@example.com"
          onPress={() => {}}
        />

        {/* Membership */}
        <AccountRow
          icon="ribbon-outline"
          iconBg={Colors.clay[50]}
          iconColor={Colors.clay[500]}
          title="Membership"
          subtitle="Free plan"
          rightSlot={
            <View
              style={{
                backgroundColor: Colors.clay[100],
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: Colors.clay[200],
                marginRight: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: Colors.clay[600],
                  letterSpacing: 0.3,
                }}
              >
                Upgrade
              </Text>
            </View>
          }
          onPress={() => {}}
        />

        {/* Change password */}
        <AccountRow
          icon="lock-closed-outline"
          iconBg={Colors.smoke[100]}
          iconColor={Colors.smoke[500]}
          title="Change password"
          onPress={() => {}}
        />

        {/* Log out */}
        <AccountRow
          icon="log-out-outline"
          iconBg="#FDECEA"
          iconColor={Colors.error}
          title="Log out"
          titleColor={Colors.error}
          showChevron={false}
          isLast
          onPress={onLogOut}
        />
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();

  const [skills, setSkills]       = useState<Skill[]>(SEED_SKILLS);
  const [activeTab, setActiveTab] = useState<ProfileTab>("Skills");

  const triedCount = skills.filter((s) => s.tried).length;
  const xp         = triedCount * 5;
  const level      = getCurrentLevel(xp);
  const nextLevel  = getNextLevel(xp);
  const progress   = getLevelProgress(xp);

  const achievements = useMemo(() => computeAchievements(skills), [skills]);

  function toggleSkill(id: string) {
    setSkills((p) =>
      p.map((s) => (s.id === id ? { ...s, tried: !s.tried } : s))
    );
  }

  function handleLogOut() {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log out", style: "destructive", onPress: () => {} },
      ]
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["top"]}>
      {/* Header */}
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
        <Text style={{ fontFamily: "Georgia", fontSize: 22, color: Colors.textPrimary, flex: 1 }}>
          Profile
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 48 : 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ══ Avatar + level card ══════════════════════════════════════════════ */}
        <View
          style={{
            alignItems: "center",
            paddingTop: 28,
            paddingBottom: 24,
            paddingHorizontal: 32,
            borderBottomWidth: 1,
            borderColor: Colors.border,
            marginBottom: 20,
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: Colors.clay[500],
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
              borderWidth: 3,
              borderColor: Colors.clay[300],
            }}
          >
            <Text
              style={{
                fontFamily: "Georgia",
                fontSize: 28,
                color: Colors.textInverse,
                lineHeight: 34,
              }}
            >
              SM
            </Text>
          </View>

          {/* Name */}
          <Text
            style={{
              fontFamily: "Georgia",
              fontSize: 24,
              color: Colors.textPrimary,
              marginBottom: 8,
            }}
          >
            Sarah M.
          </Text>

          {/* Level badge */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 5,
              borderRadius: 20,
              backgroundColor: level.bg,
              borderWidth: 1,
              borderColor: level.color + "50",
              marginBottom: 20,
            }}
          >
            <Text
              style={{ fontSize: 13, fontWeight: "600", color: level.color }}
            >
              {level.name}
            </Text>
          </View>

          {/* XP bar */}
          <View style={{ width: "100%" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textPrimary }}>
                {xp} XP
              </Text>
              {nextLevel && (
                <Text style={{ fontSize: 12, color: Colors.textTertiary }}>
                  {(level.nextXP ?? 0) - xp} to {nextLevel.name}
                </Text>
              )}
              {!nextLevel && (
                <Text style={{ fontSize: 12, color: Colors.warning, fontWeight: "600" }}>
                  Max level
                </Text>
              )}
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: Colors.border,
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${progress * 100}%`,
                  height: 8,
                  backgroundColor: level.color,
                  borderRadius: 4,
                }}
              />
            </View>
            {nextLevel && (
              <Text
                style={{
                  fontSize: 11,
                  color: Colors.textTertiary,
                  marginTop: 6,
                  textAlign: "center",
                }}
              >
                {triedCount} skill{triedCount !== 1 ? "s" : ""} tried · 5 XP each
              </Text>
            )}
          </View>
        </View>

        {/* ══ Stats grid ══════════════════════════════════════════════════════ */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          {[STATS.slice(0, 2), STATS.slice(2, 4)].map((row, rowIdx) => (
            <View
              key={rowIdx}
              style={{ flexDirection: "row", gap: 10, marginTop: rowIdx === 0 ? 0 : 10 }}
            >
              {row.map((stat) => (
                <Link key={stat.label} href={stat.href as any} asChild style={{ flex: 1 }}>
                  <Pressable
                    style={({ pressed }) => ({
                      flex: 1,
                      flexDirection: "column",
                      backgroundColor: Colors.surface,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      padding: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: pressed ? 0.65 : 1,
                    })}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: stat.color + "18",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Ionicons name={stat.icon} size={18} color={stat.color} />
                    </View>
                    <Text
                      style={{
                        fontFamily: "Georgia",
                        fontSize: 26,
                        color: Colors.textPrimary,
                        marginBottom: 3,
                        textAlign: "center",
                      }}
                    >
                      {stat.value}
                    </Text>
                    <Text style={{ fontSize: 11, color: Colors.textTertiary, textAlign: "center" }}>
                      {stat.label}
                    </Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          ))}
        </View>

        {/* ══ Tabs ════════════════════════════════════════════════════════════ */}
        <View style={{ paddingHorizontal: 20 }}>
          <TabSwitcher active={activeTab} onChange={setActiveTab} />

          {activeTab === "Skills" && (
            <SkillsTab skills={skills} onToggle={toggleSkill} />
          )}
          {activeTab === "Achievements" && (
            <AchievementsTab achievements={achievements} />
          )}
          {activeTab === "History" && (
            <HistoryTab items={SEED_HISTORY} />
          )}
        </View>

        {/* ══ Account & Settings ══════════════════════════════════════════════ */}
        <AccountSection onLogOut={handleLogOut} />
      </ScrollView>
    </SafeAreaView>
  );
}
