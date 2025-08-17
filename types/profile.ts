export interface SocialLink {
    id: string;
    platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'github' | 'youtube' | 'tiktok' | 'website' | 'other';
    url: string;
    username?: string;
  }
  
  export interface ContactInfo {
    email?: string;
    phone?: string;
    address?: string;
    company?: string;
    position?: string;
  }
  
  export interface ProfileData {
    id: string;
    name: string;
    headline?: string;
    bio?: string;
    avatar?: string;
    coverImage?: string;
    cardColor?: string;
    contactInfo: ContactInfo;
    socialLinks: SocialLink[];
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
  }
  
  export interface ProfileStats {
    views: number;
    saves: number;
    lastViewed?: number | undefined;
  }
  
  export interface Contact extends ProfileData {
    notes?: string;
    tags?: string[];
    meetingContext?: string;
    lastInteraction?: number;
  }