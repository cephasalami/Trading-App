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
  try {
    // First, create the user record in your custom users table
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        email: user.email!,
        username: userData.username,
        name: userData.name,
        password: '', // This will be empty since we're using Supabase Auth
        bio: userData.bio || 'Your Bio goes here.',
        avatar: userData.avatar || 'default.jpg',
        auth_user_id: user.id, // Link to Supabase Auth user
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user record:', userError);
      throw userError;
    }

    // Then create the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userRecord.id, // Use the numeric ID from the users table
        name: userData.name,
        headline: userData.headline || '',
        bio: userData.bio || 'Your Bio goes here.',
        avatar: userData.avatar || 'default.jpg',
        card_color: '#4A6FFF',
        is_active: true,
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
          user_id: userRecord.id, // Use the numeric ID from the users table
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

    return userRecord;
  } catch (error) {
    console.error('Error creating user records:', error);
    throw error;
  }
};