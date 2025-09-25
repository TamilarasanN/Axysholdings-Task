import { Image } from 'expo-image';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { setBiometricEnabled } from '../utils/secureStore';

type BiometricState = 'initial' | 'scanning' | 'success' | 'error';

export default function BiometricSetupScreen() {
  const [biometricState, setBiometricState] = useState<BiometricState>('initial');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Face ID');
  const { justCompletedSignup, signOut, setBiometricSetupCompleted } = useAuth();

  console.log('BiometricSetupScreen rendered, justCompletedSignup:', justCompletedSignup);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  // Manual override for testing - uncomment this to force Face ID
  useEffect(() => {
    console.log('Forcing Face ID for testing');
    setBiometricType('Face ID');
    setIsSupported(true);
  }, []);

  useEffect(() => {
    console.log('BiometricSetupScreen - justCompletedSignup changed:', justCompletedSignup);
    
    // Only redirect to dashboard if user is in signup flow and just completed signup
    // For login flow, we don't want to redirect automatically
    if (justCompletedSignup) {
      console.log('User in signup flow, biometric setup will handle navigation');
    } else {
      console.log('User in login flow, staying on biometric setup screen');
    }
  }, [justCompletedSignup]);

  const checkBiometricSupport = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      console.log('=== BIOMETRIC DETECTION DEBUG ===');
      console.log('hasHardware:', hasHardware);
      console.log('isEnrolled:', isEnrolled);
      console.log('supportedTypes:', supportedTypes);
      console.log('FACIAL_RECOGNITION constant:', LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
      console.log('FINGERPRINT constant:', LocalAuthentication.AuthenticationType.FINGERPRINT);
      console.log('IRIS constant:', LocalAuthentication.AuthenticationType.IRIS);
      console.log('facialRecognition supported:', supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION));
      console.log('fingerprint supported:', supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT));
      console.log('iris supported:', supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS));
      console.log('================================');
      
      if (hasHardware && isEnrolled) {
        setIsSupported(true);
        
        // Force Face ID for testing - comment out in production
        console.log('Forcing Face ID for testing purposes');
        setBiometricType('Face ID');
        
        // Original detection logic (commented out for testing)
        /*
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
          console.log('Face ID detected and set');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
          console.log('Touch ID detected and set');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType('Iris');
          console.log('Iris detected and set');
        } else {
          setBiometricType('Biometric');
          console.log('Generic biometric detected');
        }
        */
      } else {
        setIsSupported(false);
        console.log('Biometric not supported or not enrolled');
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
      setIsSupported(false);
    }
  };

  const handleSetupBiometric = async () => {
    if (!isSupported) {
      Alert.alert(
        'Biometric Not Available',
        'Biometric authentication is not available on this device. You can skip this step.',
        [
          { 
            text: 'Skip', 
            onPress: async () => {
              if (justCompletedSignup) {
                // Signup flow: sign out user when skipping biometric setup
                await signOut();
                router.replace('/signupComplete');
              } else {
                // Login flow: user is already logged in, navigate to dashboard
                console.log('User skipped biometric setup in login flow (unsupported), navigating to dashboard');
                router.replace('/(tabs)');
              }
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    setBiometricState('scanning');
    
    try {
      console.log('Starting biometric authentication with type:', biometricType);
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: biometricType === 'Face ID' 
          ? 'Setup Face ID - Look at your device to authenticate' 
          : `Setup ${biometricType}`,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      console.log('Biometric authentication result:', result);

      if (result.success) {
        setBiometricState('success');
        // Enable biometric authentication in secure store
        await setBiometricEnabled(true);
        
        // Mark biometric setup as completed
        setBiometricSetupCompleted(true);
        
        console.log('Biometric setup successful, navigating based on flow');
        
        // Navigate based on whether user is in signup or login flow
        setTimeout(() => {
          if (justCompletedSignup) {
            // Signup flow: navigate to signup completion screen
            router.replace('/signupComplete');
          } else {
            // Login flow: navigate to dashboard
            router.replace('/(tabs)');
          }
        }, 2000);
      } else {
        setBiometricState('error');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      setBiometricState('error');
      setShowErrorModal(true);
    }
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    setBiometricState('initial');
  };

  const handleCancel = async () => {
    setShowErrorModal(false);
    
    if (justCompletedSignup) {
      // Signup flow: sign out user when canceling biometric setup
      await signOut();
      router.replace('/signupComplete');
    } else {
      // Login flow: user is already logged in, navigate to dashboard
      console.log('User canceled biometric setup in login flow, navigating to dashboard');
      router.replace('/(tabs)');
    }
  };

  const handleSkip = async () => {
    if (justCompletedSignup) {
      // Signup flow: sign out user when skipping biometric setup
      await signOut();
      router.replace('/signupComplete');
    } else {
      // Login flow: user is already logged in, navigate to dashboard
      console.log('User skipped biometric setup in login flow, navigating to dashboard');
      router.replace('/(tabs)');
    }
  };


  const renderBiometricIcon = () => {
    switch (biometricState) {
      case 'initial':
        return (
          <View style={styles.iconContainer}>
            <View style={styles.faceIcon}>
                <Image source={require('../assets/images/Face.svg')} style={styles.faceIcon} />
            </View>
          </View>
        );
      case 'scanning':
        return (
          <View style={[styles.iconContainer, styles.scanningContainer]}>
            <View style={styles.faceIcon}>
                <Image source={require('../assets/images/Bezel.svg')} style={styles.bezelIcon} />
            </View>
          </View>
        );
      case 'success':
        return (
          <View style={[styles.iconContainer, styles.scanningContainer]}>
            <View style={styles.successIcon}>
                <Image source={require('../assets/images/success.svg')} style={styles.bezelIcon} />
            </View>
          </View>
        );
      case 'error':
        return (
          <View style={[styles.iconContainer, styles.scanningContainer]}>
            <View style={styles.faceIcon}>
              <View style={styles.eye} />
              <View style={styles.eye} />
              <View style={styles.mouth} />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const renderButton = () => {
    const isDisabled = biometricState === 'scanning' || biometricState === 'success';
    
    return (
      <Pressable
        style={[styles.setupButton, isDisabled && styles.setupButtonDisabled]}
        onPress={handleSetupBiometric}
        disabled={isDisabled}
      >
        <Text style={[styles.setupButtonText, isDisabled && styles.setupButtonTextDisabled]}>
          Setup {biometricType}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Close Button */}
        <Pressable style={styles.closeButton} onPress={handleSkip}>
          <Image source={require('../assets/images/close.svg')} style={styles.closeIcon} />
        </Pressable>

        {/* Main Content */}
        <View style={styles.content}>
          {renderBiometricIcon()}
          
          <Text style={biometricState === 'initial' ? styles.mainText : styles.mainTextSmall}>
            {biometricState === 'initial' ? `Setup ${biometricType}` : biometricType}
          </Text>
        
        <Text style={styles.descriptionText}>
          Use {biometricType} to quickly and securely log in
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {renderButton()} 
      </View>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Face Not Recognized</Text>
            <Text style={styles.modalSubtitle}>Try Again</Text>
            
            <View style={styles.modalButtons}>
              <Pressable style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Try {biometricType} Again</Text>
              </Pressable>
              
              <Pressable style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  scanningContainer: {
    backgroundColor: '#333333',
    borderRadius: 16,
  },
  faceIcon: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bezelIcon: {
    width: 100,
    height: 100,
  },
  eye: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    position: 'absolute',
    top: 25,
  },
  mouth: {
    width: 20,
    height: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
    borderRadius: 10,
    position: 'absolute',
    bottom: 20,
  },
  successIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#000000',
    fontSize: 30,
    fontWeight: 'bold',
  },
  mainText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  mainTextSmall: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  descriptionText: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  debugSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  debugTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  debugText: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 5,
  },
  debugButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  debugButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 0.48,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  setupButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  setupButtonDisabled: {
    backgroundColor: '#666666',
  },
  setupButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  setupButtonTextDisabled: {
    color: '#CCCCCC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    minWidth: 280,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    width: '100%',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#CCCCCC',
    fontSize: 16,
  },
});
