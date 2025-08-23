import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { 
  initNFC, 
  isNFCSupported, 
  isNFCEnabled, 
  readNFCTag,
  writeProfileToNFC,
  writeContactToNFC,
  writeURLToNFC,
  parseNFCData,
  cleanupNFC 
} from '@/lib/nfc';
import { ProfileData } from '@/types/profile';

export interface NFCStatus {
  supported: boolean;
  enabled: boolean;
  initialized: boolean;
}

export interface NFCData {
  type: string;
  content: any;
}

export const useNFC = () => {
  const [status, setStatus] = useState<NFCStatus>({
    supported: false,
    enabled: false,
    initialized: false,
  });
  const [isReading, setIsReading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);

  // Check NFC status on mount
  useEffect(() => {
    checkNFCStatus();
    return () => {
      cleanupNFC();
    };
  }, []);

  const checkNFCStatus = useCallback(async () => {
    const supported = isNFCSupported();
    setStatus(prev => ({ ...prev, supported }));

    if (supported) {
      try {
        const enabled = await isNFCEnabled();
        setStatus(prev => ({ ...prev, enabled }));

        if (enabled) {
          const initialized = await initNFC();
          setStatus(prev => ({ ...prev, initialized }));
        }
      } catch (error) {
        console.error('Failed to check NFC status:', error);
      }
    }
  }, []);

  const readTag = useCallback(async (): Promise<NFCData | null> => {
    if (!status.supported || !status.enabled) {
      throw new Error('NFC not available');
    }

    setIsReading(true);
    try {
      const data = await readNFCTag();
      if (data) {
        const parsed = parseNFCData(data);
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Failed to read NFC tag:', error);
      throw error;
    } finally {
      setIsReading(false);
    }
  }, [status]);

  const writeProfile = useCallback(async (profile: ProfileData): Promise<boolean> => {
    if (!status.supported || !status.enabled) {
      throw new Error('NFC not available');
    }

    setIsWriting(true);
    try {
      const success = await writeProfileToNFC(profile);
      return success;
    } catch (error) {
      console.error('Failed to write profile to NFC:', error);
      throw error;
    } finally {
      setIsWriting(false);
    }
  }, [status]);

  const writeContact = useCallback(async (contact: ProfileData): Promise<boolean> => {
    if (!status.supported || !status.enabled) {
      throw new Error('NFC not available');
    }

    setIsWriting(true);
    try {
      const success = await writeContactToNFC(contact);
      return success;
    } catch (error) {
      console.error('Failed to write contact to NFC:', error);
      throw error;
    } finally {
      setIsWriting(false);
    }
  }, [status]);

  const writeURL = useCallback(async (url: string): Promise<boolean> => {
    if (!status.supported || !status.enabled) {
      throw new Error('NFC not available');
    }

    setIsWriting(true);
    try {
      const success = await writeURLToNFC(url);
      return success;
    } catch (error) {
      console.error('Failed to write URL to NFC:', error);
      throw error;
    } finally {
      setIsWriting(false);
    }
  }, [status]);

  const refreshStatus = useCallback(() => {
    checkNFCStatus();
  }, [checkNFCStatus]);

  return {
    status,
    isReading,
    isWriting,
    readTag,
    writeProfile,
    writeContact,
    writeURL,
    refreshStatus,
  };
};
