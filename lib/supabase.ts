import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

// ─── Database types ───────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          experience_level: string | null;
          goals: string[];
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          experience_level?: string | null;
          goals?: string[];
          avatar_url?: string | null;
        };
        Update: {
          name?: string;
          experience_level?: string | null;
          goals?: string[];
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          emoji: string;
          stage: string;
          clay_body: string;
          glaze: string;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          emoji?: string;
          stage?: string;
          clay_body?: string;
          glaze?: string;
          notes?: string;
        };
        Update: {
          name?: string;
          emoji?: string;
          stage?: string;
          clay_body?: string;
          glaze?: string;
          notes?: string;
          updated_at?: string;
        };
      };
      project_photos: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          storage_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          storage_path: string;
        };
        Update: never;
      };
      clay_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          cone_range: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
      glazes: {
        Row: {
          id: string;
          name: string;
          type: string;
          cone: string;
          atmosphere: string;
          surface: string | null;
          color_hex: string | null;
          description: string | null;
          ingredients: Array<{ name: string; percentage: number }>;
          food_safe: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
      saved_glazes: {
        Row: {
          id: string;
          user_id: string;
          glaze_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          glaze_id: string;
        };
        Update: never;
      };
      inventory: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          quantity: number;
          unit: string;
          max_quantity: number;
          alert_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: string;
          quantity?: number;
          unit: string;
          max_quantity?: number;
          alert_threshold?: number;
        };
        Update: {
          name?: string;
          category?: string;
          quantity?: number;
          unit?: string;
          max_quantity?: number;
          alert_threshold?: number;
          updated_at?: string;
        };
      };
      tools: {
        Row: {
          id: string;
          name: string;
          primary_use: string | null;
          description: string | null;
          icon_name: string | null;
          icon_color: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
      user_tools: {
        Row: {
          id: string;
          user_id: string;
          tool_id: string;
          owned: boolean;
          wish_list: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tool_id: string;
          owned?: boolean;
          wish_list?: boolean;
        };
        Update: {
          owned?: boolean;
          wish_list?: boolean;
        };
      };
      techniques: {
        Row: {
          id: string;
          name: string;
          category: string;
          level: string;
          duration: string | null;
          description: string | null;
          thumbnail_color: string | null;
          steps: unknown[];
          tools: string[];
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
      user_techniques: {
        Row: {
          id: string;
          user_id: string;
          technique_id: string;
          bookmarked: boolean;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          technique_id: string;
          bookmarked?: boolean;
          completed?: boolean;
        };
        Update: {
          bookmarked?: boolean;
          completed?: boolean;
        };
      };
      tips: {
        Row: {
          id: string;
          title: string;
          body: string;
          category: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
    };
  };
}

// ─── Supabase client ─────────────────────────────────────────────────────────

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});

// ─── Typed table helpers ──────────────────────────────────────────────────────

export const db = {
  profiles:        () => supabase.from("profiles"),
  projects:        () => supabase.from("projects"),
  projectPhotos:   () => supabase.from("project_photos"),
  clayTypes:       () => supabase.from("clay_types"),
  glazes:          () => supabase.from("glazes"),
  savedGlazes:     () => supabase.from("saved_glazes"),
  inventory:       () => supabase.from("inventory"),
  tools:           () => supabase.from("tools"),
  userTools:       () => supabase.from("user_tools"),
  techniques:      () => supabase.from("techniques"),
  userTechniques:  () => supabase.from("user_techniques"),
  tips:            () => supabase.from("tips"),
} as const;
