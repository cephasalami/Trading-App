import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

interface UserData {
  name: string;
  username: string;
  bio?: string;
  avatar?: string;
  headline?: string;
  company?: string;
  position?: string;
  phone?: string;
  socialLinks?: { platform: string; url: string }[];
}

export const createUserRecord = async (user: User, userData: UserData) => {
  // Create user record in profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id, // Use the user's UUID from Supabase Auth
      name: userData.name,
      headline: userData.headline || '',
      bio: userData.bio || 'Your Bio goes here.',
      avatar: userData.avatar || 'default.jpg',
    });

  if (profileError) {
    console.error('Error creating profile record:', profileError);
    throw profileError;
  }

  // Create social links if provided
  if (userData.socialLinks && userData.socialLinks.length > 0) {
    const linksToInsert = userData.socialLinks
      .filter(link => link.url.trim())
      .map(link => ({
        user_id: user.id,
        name: link.platform,
        icon: link.platform,
        link: link.url,
      }));

    if (linksToInsert.length > 0) {
      const { error: linksError } = await supabase
        .from('links')
        .insert(linksToInsert);

      if (linksError) {
        console.error('Error creating social links:', linksError);
      }
    }
  }
};