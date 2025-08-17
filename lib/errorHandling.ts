import { Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  CAMERA_ERROR: 'CAMERA_ERROR',
  SCAN_FAILED: 'SCAN_FAILED',
  CONTACT_SAVE_FAILED: 'CONTACT_SAVE_FAILED',
  PROFILE_LOAD_FAILED: 'PROFILE_LOAD_FAILED',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export function createError(code: string, message: string, details?: any): AppError {
  return { code, message, details };
}

export function handleError(error: AppError | Error | unknown, context?: string) {
  console.error(`Error in ${context || 'unknown context'}:`, error);
  
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  let errorMessage = 'An unexpected error occurred';
  
  if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = (error as AppError).message || (error as Error).message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  // Show user-friendly error messages
  Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
}

export function handleNetworkError(error: any) {
  if (!navigator.onLine) {
    handleError(createError(
      ErrorCodes.NETWORK_ERROR,
      'No internet connection. Please check your network and try again.'
    ));
  } else {
    handleError(createError(
      ErrorCodes.NETWORK_ERROR,
      'Network request failed. Please try again.'
    ));
  }
}

export function handlePermissionError(permission: string) {
  handleError(createError(
    ErrorCodes.PERMISSION_DENIED,
    `${permission} permission is required for this feature. Please grant permission in your device settings.`
  ));
}

export function handleValidationError(field: string, requirement: string) {
  handleError(createError(
    ErrorCodes.VALIDATION_ERROR,
    `${field} ${requirement}`
  ));
}

export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      return null;
    }
  };
}

export function withSyncErrorHandling<T extends any[], R>(
  fn: (...args: T) => R,
  context?: string
) {
  return (...args: T): R | null => {
    try {
      return fn(...args);
    } catch (error) {
      handleError(error, context);
      return null;
    }
  };
}