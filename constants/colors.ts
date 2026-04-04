/**
 * Kiln design token set.
 * Primary: Clay (#C4845A) — warm terracotta
 * Background: Cream (#FDFAF7) — off-white parchment
 */

export const Colors = {
  // ── Brand ────────────────────────────────────────────────────────────────
  clay: {
    DEFAULT: "#C4845A",
    50: "#F9F0E8",
    100: "#F2DEC9",
    200: "#E5BF9B",
    300: "#D9A06D",
    400: "#C4845A",
    500: "#A96B44",
    600: "#8D5535",
    700: "#6E4028",
    800: "#4F2D1B",
    900: "#301A0E",
  },

  // ── Sand / background scale ───────────────────────────────────────────────
  sand: {
    DEFAULT: "#E8D5B7",
    50: "#FDFAF7",   // app background
    100: "#F7F0E4",
    200: "#EFE1CC",
    300: "#E8D5B7",
    400: "#D9C09A",
    500: "#C9A87D",
    600: "#B08B5E",
  },

  // ── Earth / text scale ────────────────────────────────────────────────────
  earth: {
    DEFAULT: "#7C5C3E",
    50: "#F2EBE3",
    100: "#E3D3C1",
    200: "#C9AD90",
    300: "#A8825F",
    400: "#7C5C3E",
    500: "#5E4530",
    600: "#402F20",
  },

  // ── Neutral / smoke ───────────────────────────────────────────────────────
  smoke: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },

  // ── Semantic aliases ──────────────────────────────────────────────────────
  primary: "#C4845A",
  primaryLight: "#E5BF9B",
  primaryDark: "#8D5535",

  background: "#FDFAF7",
  surface: "#F7F0E4",
  border: "#E8D5B7",

  textPrimary: "#402F20",
  textSecondary: "#7C5C3E",
  textTertiary: "#9E9E9E",
  textInverse: "#FDFAF7",

  // ── Status ────────────────────────────────────────────────────────────────
  success: "#5A8C6A",
  successLight: "#E8F3EC",
  warning: "#C4A45A",
  warningLight: "#F9F3E8",
  error: "#C45A5A",
  errorLight: "#F9E8E8",
  info: "#5A7CC4",
  infoLight: "#E8EEF9",

  // ── Tab bar ───────────────────────────────────────────────────────────────
  tabActive: "#C4845A",
  tabInactive: "#9E9E9E",
  tabBackground: "#FDFAF7",
  tabBorder: "#E8D5B7",
} as const;

export type ColorToken = keyof typeof Colors;
