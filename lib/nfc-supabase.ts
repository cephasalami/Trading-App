import { supabase } from './supabase';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

// Interface for NFC device (using existing nfc_devices table)
export interface NFCDevice {
  id: string;
  user_id: number;
  profile_id?: string;
  device_id: string;
  device_name?: string;
  is_active: boolean;
  last_used?: string;
  created_at: string;
  updated_at: string;
}

// Interface for NFC interaction
export interface NFCInteraction {
  id: string;
  user_id: number;
  tag_id?: string;
  interaction_type: 'read' | 'write' | 'scan';
  interaction_data?: any;
  device_info?: DeviceInfo;
  location_info?: LocationInfo;
  created_at: string;
}

// Device information interface
export interface DeviceInfo {
  device_name?: string;
  device_model?: string;
  os_name?: string;
  os_version?: string;
  app_version?: string;
}

// Location information interface
export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  timestamp?: string;
}

// Get device information
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  try {
    const deviceName = Device.deviceName;
    const deviceModel = Device.modelName;
    const osName = Device.osName;
    const osVersion = Device.osVersion;
    
    return {
      device_name: deviceName,
      device_model: deviceModel,
      os_name: osName,
      os_version: osVersion,
      app_version: '1.0.0' // You can get this from your app config
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    return {};
  }
};

// Get location information
export const getLocationInfo = async (): Promise<LocationInfo> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {};
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting location info:', error);
    return {};
  }
};

// Get current user ID from Supabase auth
export const getCurrentUserId = async (): Promise<number | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get the user ID from the users table
    const { data: userData, error } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (error || !userData) return null;
    return userData.id;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

// Insert or update NFC device
export const upsertNFCDevice = async (
  deviceId: string,
  profileId?: string,
  deviceName?: string
): Promise<NFCDevice | null> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const deviceInfo = await getDeviceInfo();
    const locationInfo = await getLocationInfo();

    const { data, error } = await supabase
      .from('nfc_devices')
      .upsert({
        user_id: userId,
        profile_id: profileId,
        device_id: deviceId,
        device_name: deviceName || deviceInfo.device_name,
        is_active: true,
        last_used: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Log the interaction
    await logNFCInteraction(userId, data.id, 'write', {
      device_id: deviceId,
      profile_id: profileId,
      device_name: deviceName
    }, deviceInfo, locationInfo);

    return data;
  } catch (error) {
    console.error('Error upserting NFC device:', error);
    return null;
  }
};

// Get NFC device by device ID
export const getNFCDeviceByDeviceId = async (deviceId: string): Promise<NFCDevice | null> => {
  try {
    const { data, error } = await supabase
      .from('nfc_devices')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting NFC device by device ID:', error);
    return null;
  }
};

// Get user's NFC devices
export const getUserNFCDevices = async (): Promise<NFCDevice[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('nfc_devices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user NFC devices:', error);
    return [];
  }
};

// Log NFC interaction
export const logNFCInteraction = async (
    userId: number,
    tagId: string | undefined,
    interactionType: 'read' | 'write' | 'scan',
    interactionData?: any,
    deviceInfo?: DeviceInfo,
    locationInfo?: LocationInfo
): Promise<string | null> => {
    try {
        const { data, error } = await supabase
            .rpc('log_nfc_interaction', {
                p_user_id: userId,
                p_interaction_type: interactionType,
                p_tag_id: tagId,
                p_interaction_data: interactionData,
                p_device_info: deviceInfo,
                p_location_info: locationInfo
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error logging NFC interaction:', error);
        return null;
    }
};

// Log scan to history
export const logScanToHistory = async (
  scannedProfileId: string,
  scanType: string,
  scanData?: any,
  nfcTagId?: string
): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return false;

    const deviceInfo = await getDeviceInfo();
    const locationInfo = await getLocationInfo();

    const { error } = await supabase
      .from('scan_history')
      .insert({
        user_id: userId,
        scanned_profile_id: scannedProfileId,
        scan_type: scanType,
        scan_data: scanData,
        nfc_tag_id: nfcTagId,
        device_info: deviceInfo,
        location_info: locationInfo
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error logging scan to history:', error);
    return false;
  }
};

// Get NFC interaction history
export const getNFCInteractionHistory = async (limit: number = 50): Promise<NFCInteraction[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('nfc_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting NFC interaction history:', error);
    return [];
  }
};

// Get NFC analytics
export const getNFCAnalytics = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    // Get total devices
    const { count: totalDevices } = await supabase
      .from('nfc_devices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get active devices
    const { count: activeDevices } = await supabase
      .from('nfc_devices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    // Get recent interactions
    const { data: recentInteractions } = await supabase
      .from('nfc_interactions')
      .select('interaction_type, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    // Count interaction types
    const interactionCounts = recentInteractions?.reduce((acc, interaction) => {
      acc[interaction.interaction_type] = (acc[interaction.interaction_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      total_devices: totalDevices || 0,
      active_devices: activeDevices || 0,
      recent_interactions: recentInteractions?.length || 0,
      interaction_counts: interactionCounts
    };
  } catch (error) {
    console.error('Error getting NFC analytics:', error);
    return null;
  }
};

// Delete NFC device
export const deleteNFCDevice = async (deviceId: string): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return false;

    const { error } = await supabase
      .from('nfc_devices')
      .delete()
      .eq('device_id', deviceId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting NFC device:', error);
    return false;
  }
};

// Deactivate NFC device
export const deactivateNFCDevice = async (deviceId: string): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return false;

    const { error } = await supabase
      .from('nfc_devices')
      .update({ is_active: false })
      .eq('device_id', deviceId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deactivating NFC device:', error);
    return false;
  }
};

export const getNfcTags = async (userId: number) => {
  const { data, error } = await supabase
    .from('nfc_tags')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
