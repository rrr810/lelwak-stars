/**
 * Supabase database types for Lelwak Stars CBO.
 *
 * Kept in sync with supabase/migrations/0001_init.sql.
 * Regenerate automatically once the project is connected:
 *   npx supabase gen types typescript --project-id <ref> --schema public \
 *     > src/lib/database.types.ts
 */

export type GalleryCategory =
  | "tree-nurseries"
  | "tree-planting"
  | "school-mentorship"
  | "youth-training"
  | "community-engagement"
  | "partnerships";

export type ProgramId =
  | "tree-nurseries"
  | "agripreneurship"
  | "school-mentorship"
  | "capacity-building";

export type InquiryType =
  | "sponsorship"
  | "partnership"
  | "grant"
  | "volunteer"
  | "school"
  | "media"
  | "other";

export type InquiryStatus =
  | "new"
  | "contacted"
  | "in-discussion"
  | "won"
  | "lost"
  | "archived";

export type PartnerTier = "seed" | "grower" | "canopy" | "in-kind";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type Database = {
  public: {
    Tables: {
      programs: {
        Row: {
          id: ProgramId;
          name: string;
          slug: string;
          short_name: string;
          blurb: string;
          body: string;
          bullets: Json;
          accent_color: string;
          accent_soft: string;
          icon: string;
          hero_image: string | null;
          partner_ask: string;
          sort_order: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: ProgramId;
          name: string;
          slug?: string;
          short_name: string;
          blurb?: string;
          body?: string;
          bullets?: Json;
          accent_color?: string;
          accent_soft?: string;
          icon?: string;
          hero_image?: string | null;
          partner_ask?: string;
          sort_order?: number;
          is_published?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["programs"]["Insert"]>;
        Relationships: [];
      };
      impact_stats: {
        Row: {
          id: string;
          key: string;
          label: string;
          value: number | null;
          percent: number | null;
          suffix: string;
          note: string;
          target_value: number | null;
          sort_order: number;
          is_published: boolean;
          as_of: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          label: string;
          value?: number | null;
          percent?: number | null;
          suffix?: string;
          note?: string;
          target_value?: number | null;
          sort_order?: number;
          is_published?: boolean;
          as_of?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["impact_stats"]["Insert"]>;
        Relationships: [];
      };
      stories: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          body: string;
          program: ProgramId | null;
          location: string | null;
          activity_date: string | null;
          cover_image: string | null;
          people_reached: number | null;
          challenge: string;
          action: string;
          outcome: string;
          next_need: string;
          is_featured: boolean;
          is_published: boolean;
          published_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          slug?: string;
          excerpt?: string;
          body?: string;
          program?: ProgramId | null;
          location?: string | null;
          activity_date?: string | null;
          cover_image?: string | null;
          people_reached?: number | null;
          challenge?: string;
          action?: string;
          outcome?: string;
          next_need?: string;
          is_featured?: boolean;
          is_published?: boolean;
          published_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["stories"]["Insert"]>;
        Relationships: [];
      };
      gallery: {
        Row: {
          id: string;
          story_id: string | null;
          category: GalleryCategory;
          title: string;
          caption: string;
          location: string | null;
          shot_on: string | null;
          path_full: string;
          path_thumb: string;
          path_original: string | null;
          width: number | null;
          height: number | null;
          alt: string;
          credit: string | null;
          dominant_color: string | null;
          is_featured: boolean;
          is_published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          story_id?: string | null;
          category: GalleryCategory;
          title?: string;
          caption?: string;
          location?: string | null;
          shot_on?: string | null;
          path_full: string;
          path_thumb: string;
          path_original?: string | null;
          width?: number | null;
          height?: number | null;
          alt?: string;
          credit?: string | null;
          dominant_color?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["gallery"]["Insert"]>;
        Relationships: [];
      };
      partners: {
        Row: {
          id: string;
          name: string;
          slug: string;
          tier: PartnerTier;
          logo_path: string | null;
          website: string | null;
          description: string;
          contribution: string | null;
          period_start: string | null;
          period_end: string | null;
          is_published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          slug?: string;
          tier?: PartnerTier;
          logo_path?: string | null;
          website?: string | null;
          description?: string;
          contribution?: string | null;
          period_start?: string | null;
          period_end?: string | null;
          is_published?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["partners"]["Insert"]>;
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          inquiry_type: InquiryType;
          name: string;
          email: string;
          phone: string | null;
          organisation: string | null;
          role: string | null;
          country: string | null;
          message: string;
          budget_range: string | null;
          hp: string | null;
          submitted_at: string;
          user_agent: string | null;
          ip_hash: string | null;
          status: InquiryStatus;
          is_priority: boolean;
          notes: string | null;
          handled_by: string | null;
          handled_at: string | null;
          created_at: string;
        };
        Insert: {
          inquiry_type?: InquiryType;
          name: string;
          email: string;
          phone?: string | null;
          organisation?: string | null;
          role?: string | null;
          country?: string | null;
          message: string;
          budget_range?: string | null;
          hp?: string | null;
          user_agent?: string | null;
          ip_hash?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Insert"]> & {
          status?: InquiryStatus;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          role: string;
          bio: string;
          photo_path: string | null;
          sort_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          role: string;
          bio?: string;
          photo_path?: string | null;
          sort_order?: number;
          is_published?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["team_members"]["Insert"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          program: ProgramId | null;
          location: string | null;
          starts_at: string;
          ends_at: string | null;
          cover_image: string | null;
          spots: number | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          title: string;
          slug?: string;
          description?: string;
          program?: ProgramId | null;
          location?: string | null;
          starts_at: string;
          ends_at?: string | null;
          cover_image?: string | null;
          spots?: number | null;
          is_published?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: number;
          contact_email: string | null;
          contact_phone: string | null;
          whatsapp: string | null;
          facebook: string | null;
          instagram: string | null;
          x_twitter: string | null;
          linkedin: string | null;
          youtube: string | null;
          tiktok: string | null;
          address_line: string | null;
          region: string | null;
          registration_no: string | null;
          issued_by: string | null;
          year_founded: number | null;
          hero_image: string | null;
          hero_heading: string | null;
          hero_sub: string | null;
          donation_link: string | null;
          mpesa_till: string | null;
          updated_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["site_settings"]["Row"], "updated_at">>;
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Insert"]>;
        Relationships: [];
      };
      volunteers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          location: string | null;
          interests: Json;
          availability: string | null;
          message: string | null;
          status: InquiryStatus;
          created_at: string;
        };
        Insert: {
          name: string;
          email: string;
          phone?: string | null;
          location?: string | null;
          interests?: Json;
          availability?: string | null;
          message?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["volunteers"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      slugify: { Args: { input: string }; Returns: string };
      is_staff: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      gallery_category: GalleryCategory;
      program_id: ProgramId;
      inquiry_type: InquiryType;
      inquiry_status: InquiryStatus;
      partner_tier: PartnerTier;
    };
    CompositeTypes: Record<string, never>;
  };
};
