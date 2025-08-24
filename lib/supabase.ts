import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types based on your existing schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          email: string;
          email_verified_at: string | null;
          username: string;
          name: string;
          avatar: string;
          password: string;
          bio: string;
          bio_show: string;
          bio_on: string;
          bio_off: string;
          background_color: string;
          button_border_radius: string;
          button_text_color: string;
          button_color: string;
          text_color: string;
          editable_link: string | null;
          vcard_prefix: string | null;
          vcard_first_name: string | null;
          vcard_middle_name: string | null;
          vcard_last_name: string | null;
          vcard_suffix: string | null;
          vcard_email: string | null;
          vcard_second_email: string | null;
          vcard_personal_number: string | null;
          vcard_work_number: string | null;
          vcard_company: string | null;
          vcard_job: string | null;
          vcard_address: string | null;
          vcard_website: string | null;
          vcard_second_website: string | null;
          vcard_show: string;
          vcard_on: string;
          vcard_off: string;
          remember_token: string | null;
          created_at: string | null;
          updated_at: string | null;
          auth_user_id: string | null;
        };
        Insert: {
          id?: number;
          email: string;
          email_verified_at?: string | null;
          username: string;
          name?: string;
          avatar?: string;
          password: string;
          bio?: string;
          bio_show?: string;
          bio_on?: string;
          bio_off?: string;
          background_color?: string;
          button_border_radius?: string;
          button_text_color?: string;
          button_color?: string;
          text_color?: string;
          editable_link?: string | null;
          vcard_prefix?: string | null;
          vcard_first_name?: string | null;
          vcard_middle_name?: string | null;
          vcard_last_name?: string | null;
          vcard_suffix?: string | null;
          vcard_email?: string | null;
          vcard_second_email?: string | null;
          vcard_personal_number?: string | null;
          vcard_work_number?: string | null;
          vcard_company?: string | null;
          vcard_job?: string | null;
          vcard_address?: string | null;
          vcard_website?: string | null;
          vcard_second_website?: string | null;
          vcard_show?: string;
          vcard_on?: string;
          vcard_off?: string;
          remember_token?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          auth_user_id?: string | null;
        };
        Update: {
          id?: number;
          email?: string;
          email_verified_at?: string | null;
          username?: string;
          name?: string;
          avatar?: string;
          password?: string;
          bio?: string;
          bio_show?: string;
          bio_on?: string;
          bio_off?: string;
          background_color?: string;
          button_border_radius?: string;
          button_text_color?: string;
          button_color?: string;
          text_color?: string;
          editable_link?: string | null;
          vcard_prefix?: string | null;
          vcard_first_name?: string | null;
          vcard_middle_name?: string | null;
          vcard_last_name?: string | null;
          vcard_suffix?: string | null;
          vcard_email?: string | null;
          vcard_second_email?: string | null;
          vcard_personal_number?: string | null;
          vcard_work_number?: string | null;
          vcard_company?: string | null;
          vcard_job?: string | null;
          vcard_address?: string | null;
          vcard_website?: string | null;
          vcard_second_website?: string | null;
          vcard_show?: string;
          vcard_on?: string;
          vcard_off?: string;
          remember_token?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          auth_user_id?: string | null;
        };
      };
      links: {
        Row: {
          id: number;
          user_id: number;
          name: string;
          icon: string;
          link: string;
          indicator: string;
          link_display: string;
          button_show: string;
          button_hide: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: number;
          name: string;
          icon: string;
          link: string;
          indicator?: string;
          link_display?: string;
          button_show?: string;
          button_hide?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: number;
          name?: string;
          icon?: string;
          link?: string;
          indicator?: string;
          link_display?: string;
          button_show?: string;
          button_hide?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          headline: string | null;
          bio: string | null;
          avatar: string | null;
          cover_image: string | null;
          card_color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          headline?: string | null;
          bio?: string | null;
          avatar?: string | null;
          cover_image?: string | null;
          card_color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          headline?: string | null;
          bio?: string | null;
          avatar?: string | null;
          cover_image?: string | null;
          card_color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      contact_info: {
        Row: {
          id: string;
          profile_id: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          company: string | null;
          position: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          company?: string | null;
          position?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          company?: string | null;
          position?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      social_links: {
        Row: {
          id: string;
          profile_id: string;
          platform: string;
          url: string;
          username: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          platform: string;
          url: string;
          username?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          platform?: string;
          url?: string;
          username?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          profile_id: string;
          notes: string | null;
          tags: string[] | null;
          meeting_context: string | null;
          last_interaction: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_id: string;
          notes?: string | null;
          tags?: string[] | null;
          meeting_context?: string | null;
          last_interaction?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          profile_id?: string;
          notes?: string | null;
          tags?: string[] | null;
          meeting_context?: string | null;
          last_interaction?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profile_stats: {
        Row: {
          id: string;
          profile_id: string;
          views: number;
          saves: number;
          last_viewed: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          views?: number;
          saves?: number;
          last_viewed?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          views?: number;
          saves?: number;
          last_viewed?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_type: string;
          status: string;
          started_at: string;
          expires_at: string;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_type: string;
          status: string;
          started_at: string;
          expires_at: string;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_type?: string;
          status?: string;
          started_at?: string;
          expires_at?: string;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      nfc_devices: {
        Row: {
          id: string;
          user_id: string;
          profile_id: string | null;
          device_id: string;
          device_name: string | null;
          is_active: boolean;
          last_used: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_id?: string | null;
          device_id: string;
          device_name?: string | null;
          is_active?: boolean;
          last_used?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          profile_id?: string | null;
          device_id?: string;
          device_name?: string | null;
          is_active?: boolean;
          last_used?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      app_settings: {
        Row: {
          id: string;
          user_id: string;
          follow_up_email: boolean;
          lockscreen_widget: boolean;
          direct_link: boolean;
          share_offline: boolean;
          remove_branding: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          follow_up_email?: boolean;
          lockscreen_widget?: boolean;
          direct_link?: boolean;
          share_offline?: boolean;
          remove_branding?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          follow_up_email?: boolean;
          lockscreen_widget?: boolean;
          direct_link?: boolean;
          share_offline?: boolean;
          remove_branding?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      scan_history: {
        Row: {
          id: string;
          user_id: string;
          scanned_profile_id: string | null;
          scan_type: string;
          scan_data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scanned_profile_id?: string | null;
          scan_type: string;
          scan_data?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          scanned_profile_id?: string | null;
          scan_type?: string;
          scan_data?: any;
          created_at?: string;
        };
      };
    };
  };
}