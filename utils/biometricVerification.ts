import * as LocalAuthentication from 'expo-local-authentication';
import { isBiometricEnabled } from './secureStore';

export interface BiometricVerificationResult {
  success: boolean;
  error?: string;
}

export const verifyBiometric = async (): Promise<BiometricVerificationResult> => {
  try {
    // Check if biometric is enabled
    const biometricEnabled = await isBiometricEnabled();
    if (!biometricEnabled) {
      console.log('Biometric verification skipped - not enabled');
      return { success: true }; // Skip verification if biometric is not enabled
    }

    // Check if biometric is available
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (!hasHardware || !isEnrolled) {
      console.log('Biometric verification skipped - not available or enrolled');
      return { success: true }; // Skip verification if biometric is not available
    }

    console.log('Requesting biometric verification for authenticated user');
    
    // Request biometric authentication
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify your identity to continue',
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use Passcode',
      disableDeviceFallback: false,
    });

    console.log('Biometric verification result:', result.success);
    return { success: result.success };
  } catch (error) {
    console.error('Biometric verification error:', error);
    return { success: false, error: 'Biometric verification failed' };
  }
};

export const shouldShowBiometricLogin = async (user?: any): Promise<boolean> => {
  try {
    // Only show biometric login if user is authenticated
    if (!user) {
      console.log('Biometric login not shown - user not authenticated');
      return false;
    }

    // Only show biometric login if:
    // 1. Biometric is enabled in app settings
    // 2. Device has biometric hardware
    // 3. User has enrolled biometrics
    
    const biometricEnabled = await isBiometricEnabled();
    if (!biometricEnabled) {
      console.log('Biometric login not shown - not enabled in app');
      return false;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (!hasHardware || !isEnrolled) {
      console.log('Biometric login not shown - not available or enrolled');
      return false;
    }

    console.log('Biometric login should be shown for authenticated user');
    return true;
  } catch (error) {
    console.error('Error checking biometric login availability:', error);
    return false;
  }
};

export const getBiometricType = async (): Promise<string> => {
  try {
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    } else {
      return 'Biometric';
    }
  } catch (error) {
    console.error('Error getting biometric type:', error);
    return 'Biometric';
  }
};
