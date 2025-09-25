import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { getBiometricType, shouldShowBiometricLogin, verifyBiometric } from '../utils/biometricVerification';

type FaceIDState = 'initial' | 'scanning' | 'success';

export default function FaceIDLoginScreen() {
  const { signOut, user, setShowBiometricLogin } = useAuth();
  const [faceIDState, setFaceIDState] = useState<FaceIDState>('initial');
  const [biometricType, setBiometricType] = useState<string>('Face ID');

  console.log('FaceIDLoginScreen rendered - user:', !!user);

  useEffect(() => {
    // Check if user is authenticated first
    if (!user) {
      console.log('User not authenticated, redirecting to welcome screen');
      router.replace('/welcome');
      return;
    }

    // Check if biometric login should be shown
    const checkBiometricAvailability = async () => {
      console.log('FaceIDLoginScreen: Checking biometric availability for user:', !!user);
      const shouldShow = await shouldShowBiometricLogin(user);
      console.log('FaceIDLoginScreen: shouldShowBiometricLogin result:', shouldShow);
      
      if (!shouldShow) {
        console.log('Biometric not available, redirecting to regular sign-in');
        router.replace('/sign-in');
        return;
      }
      
      // Get the biometric type for display
      const type = await getBiometricType();
      setBiometricType(type);
      console.log('FaceIDLoginScreen: Biometric type set to:', type);
    };
    
    checkBiometricAvailability();
  }, [user]);

  const handleFaceIDLogin = async () => {
    setFaceIDState('scanning');
    
    try {
      console.log('Starting Face ID login');
      const result = await verifyBiometric();
      
      if (result.success) {
        setFaceIDState('success');
        console.log('Face ID login successful, navigating to dashboard');
        
        // Clear the biometric login flag
        setShowBiometricLogin(false);
        
        // Navigate to dashboard after success animation
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1500);
      } else {
        console.log('Face ID login failed:', result.error);
        setFaceIDState('initial');
        Alert.alert('Face ID Failed', result.error || 'Please try again.');
      }
    } catch (error) {
      console.error('Face ID login error:', error);
      setFaceIDState('initial');
      Alert.alert('Error', 'Face ID authentication failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setShowBiometricLogin(false); // Clear biometric login flag
      router.replace('/welcome');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const renderFaceIDIcon = () => {
    return (
      <View style={styles.faceIconContainer}>
        <View style={styles.faceIconFrame}>
          <Image source={require('../assets/images/Face.svg')} style={styles.faceIcon} />
        </View>
      </View>
    );
  };

  const renderSuccessIcon = () => {
    if (faceIDState === 'success') {
        return (
          <View style={styles.scanningOverlay}>
              <View style={styles.scanningIcon}>
                  <Image source={require('../assets/images/success.svg')} style={styles.bezelIcon} />
              </View>
          </View>
        );
      }
  }

  const renderScanningAnimation = () => {
    if (faceIDState === 'scanning') {
      return (
        <View style={styles.scanningOverlay}>
            <View style={styles.scanningIcon}>
              <Image source={require('../assets/images/Bezel.svg')} style={styles.bezelIcon} />
            </View>
        </View>
      );
    }
    return null;
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
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('../assets/images/innerLogo.svg')} style={styles.logo} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          
          {renderFaceIDIcon()}
          
          <Text style={styles.instructionText}>Unlock the app to continue</Text>
        </View>

        {/* Scanning Overlay */}
        {renderScanningAnimation()}

        {renderSuccessIcon()}

        {/* Bottom Buttons */}
        <View style={styles.footer}>
          <Pressable 
            style={styles.faceIDButton} 
            onPress={handleFaceIDLogin}
            disabled={faceIDState === 'scanning'}
          >
            <Text style={styles.faceIDButtonText}>
              {faceIDState === 'scanning' ? 'Scanning...' : `Unlock with ${biometricType}`}
            </Text>
          </Pressable>
          
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log out</Text>
          </Pressable>
        </View>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    width: 80,
    height: 40,
    tintColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 60,
  },
  faceIconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  faceIconFrame: {
    width: 120,
    height: 120,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  faceIcon: {
    width: 60,
    height: 60,
    tintColor: '#666666',
  },
  bezelIcon: {
    width: 100,
    height: 100,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  checkmark: {
    fontSize: 50,
    color: '#000000',
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 0,
    alignItems: 'center',
    minWidth: 0,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#333333',
  },
  scanningIcon: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#000000',
  },
  scanningText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 10,
  },
  scanningBrackets: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    height: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bracket: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 4,
  },
  leftBracket: {
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  rightBracket: {
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  footer: {
    paddingBottom: 40,
  },
  faceIDButton: {
    backgroundColor: '#666666',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  faceIDButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#666666',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#333333',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
