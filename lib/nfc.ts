import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { Platform } from 'react-native';
import { ProfileData, ContactInfo } from '@/types/profile';
import { upsertNFCDevice, getNFCDeviceByDeviceId, logNFCInteraction, logScanToHistory, getCurrentUserId, getNfcTags as dbGetNfcTags } from './nfc-supabase';

// NFC data interface
export interface NFCData {
  type: string;
  content: any;
  timestamp?: number;
}

// Initialize NFC manager
export const initNFC = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      await NfcManager.start();
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize NFC:', error);
    return false;
  }
};

// Check if NFC is supported
export const isNFCSupported = (): boolean => {
  return Platform.OS === 'android' || Platform.OS === 'ios';
};

// Check if NFC is enabled
export const isNFCEnabled = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      return await NfcManager.isEnabled();
    }
    return true; // Android doesn't have a direct way to check NFC status
  } catch (error) {
    console.error('Failed to check NFC status:', error);
    return false;
  }
};

// Read NFC tag
export const readNFCTag = async (): Promise<NFCData | null> => {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    
    const tag = await NfcManager.getTag();
    if (!tag) {
      throw new Error('No tag found');
    }

    // Get the NDEF message from the tag
    if (tag.ndefMessage && tag.ndefMessage.length > 0) {
      const record = tag.ndefMessage[0];
      let payload: string;
      
      if (record.type === 'text/plain') {
        // Remove the language code prefix (first byte)
        payload = String.fromCharCode(...record.payload.slice(3));
      } else {
        payload = String.fromCharCode(...record.payload);
      }
      
      // Parse the NFC data
      const nfcData = parseNFCData(payload);
      
      // Log the NFC read interaction to Supabase
      const userId = await getCurrentUserId();
      if (userId) {
        await logNFCInteraction(userId, tag.id, 'read', {
          tag_id: tag.id,
          payload: payload
        });
      }

      return nfcData;
    }
    
    throw new Error('No NDEF records found');
  } catch (error) {
    console.error('Error reading NFC tag:', error);
    return null;
  } finally {
    NfcManager.cancelTechnologyRequest();
  }
};

// Write profile to NFC tag
export const writeProfileToNFC = async (profileData: ProfileData): Promise<boolean> => {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    
    const tag = await NfcManager.getTag();
    if (!tag) {
      throw new Error('No tag found');
    }

    // Create NDEF message with profile data
    const message = Ndef.encodeMessage([
      Ndef.textRecord(JSON.stringify(profileData), 'en')
    ]);

    // Write the message to the tag
    await NfcManager.writeNdefMessage(message);
    
    // Store tag data in Supabase
    const userId = await getCurrentUserId();
    if (userId) {
      await upsertNFCDevice(tag.id, profileData.id, profileData.name);
    }

    return true;
  } catch (error) {
    console.error('Error writing profile to NFC:', error);
    return false;
  } finally {
    NfcManager.cancelTechnologyRequest();
  }
};

// Write contact to NFC tag
export const writeContactToNFC = async (contactData: ContactInfo): Promise<boolean> => {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    
    const tag = await NfcManager.getTag();
    if (!tag) {
      throw new Error('No tag found');
    }

    // Create NDEF message with contact data
    const message = Ndef.encodeMessage([
      Ndef.textRecord(JSON.stringify(contactData), 'en')
    ]);

    // Write the message to the tag
    await NfcManager.writeNdefMessage(message);
    
    // Store tag data in Supabase
    const userId = await getCurrentUserId();
    if (userId) {
      await upsertNFCDevice(tag.id, undefined, 'Contact Info');
    }

    return true;
  } catch (error) {
    console.error('Error writing contact to NFC:', error);
    return false;
  } finally {
    NfcManager.cancelTechnologyRequest();
  }
};

// Write URL to NFC tag
export const writeURLToNFC = async (url: string, title?: string): Promise<boolean> => {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    
    const tag = await NfcManager.getTag();
    if (!tag) {
      throw new Error('No tag found');
    }

    // Create NDEF message with URL
    const message = Ndef.encodeMessage([
      Ndef.uriRecord(url, title || 'URL')
    ]);

    // Write the message to the tag
    await NfcManager.writeNdefMessage(message);
    
    // Store tag data in Supabase
    const userId = await getCurrentUserId();
    if (userId) {
      await upsertNFCDevice(tag.id, undefined, title || 'URL');
    }

    return true;
  } catch (error) {
    console.error('Error writing URL to NFC:', error);
    return false;
  } finally {
    NfcManager.cancelTechnologyRequest();
  }
};

// Parse NFC data
export const parseNFCData = (data: string): { type: string; content: any } | null => {
  try {
    const parsed = JSON.parse(data);
    if (parsed.type && parsed.data) {
      return {
        type: parsed.type,
        content: parsed.data
      };
    }
    return null;
  } catch (error) {
    // If not JSON, treat as plain text
    return {
      type: 'text',
      content: data
    };
  }
};

// Enhanced NFC scan with Supabase integration
export const scanNFCTagWithSupabase = async (scannedProfileId: string, scanType: string = 'nfc'): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return false;

    // Log scan to scan_history
    return await logScanToHistory(scannedProfileId, scanType, {
      scan_method: 'nfc',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error scanning NFC tag with Supabase:', error);
    return false;
  }
};

// Cleanup NFC
export const cleanupNFC = () => {
  NfcManager.cancelTechnologyRequest();
};

export const getNfcTags = async () => {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }
  return await dbGetNfcTags(userId);
};
