import { Image } from 'expo-image';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { me, validateCredentials } from '../api/auth';
import { useAuth } from '../auth/AuthContext';
import { getBiometricType, verifyBiometric } from '../utils/biometricVerification';
import { getAccessToken, isBiometricEnabled } from '../utils/secureStore';

type LoginMethod = 'email' | 'phone';

export default function SignInScreen() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Face ID');
  const [loading, setLoading] = useState(false);
  const [credentialsValidated, setCredentialsValidated] = useState(false);

  // Check biometric availability on component mount
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        // Check if biometric hardware is available (regardless of whether it's enabled)
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const type = await getBiometricType();
        
        // Show biometric option if hardware is available and enrolled
        // This includes users who previously skipped biometric setup
        const available = hasHardware && isEnrolled;
        
        setBiometricAvailable(available);
        setBiometricType(type);
        console.log('Biometric hardware available:', available, 'Type:', type);
      } catch (error) {
        console.error('Error checking biometric availability:', error);
        setBiometricAvailable(false);
      }
    };
    
    checkBiometricAvailability();
  }, []);

  // No longer needed since we're not signing in the user here
  // React.useEffect(() => {
  //   if (user) {
  //     console.log('User authenticated, navigating to OTP verification');
  //     // If we have email from current session, pass it; otherwise use user's email
  //     const emailToPass = email.trim() || user.email || '';
  //     router.replace({
  //       pathname: '/otp-verification',
  //       params: { email: emailToPass }
  //     });
  //   }
  // }, [user, email]);

  const onSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('Validating credentials for:', { email: email.trim() });
      await validateCredentials({ email: email.trim(), password });
      console.log('Credentials validated, navigating to OTP verification');
      
      // Mark credentials as validated
      setCredentialsValidated(true);
      
      // Navigate to OTP verification screen with email/phone parameter
      router.replace({
        pathname: '/otp-verification',
        params: { email: email.trim(), password: password, flow: 'login' }
      });
    } catch (error) {
      console.error('Credential validation error:', error);
      Alert.alert('Sign In Failed', 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onBiometricLogin = async () => {
    try {
      console.log('Starting biometric login');
      
      // Check if biometric is enabled in app settings
      const biometricEnabled = await isBiometricEnabled();
      
      if (!biometricEnabled) {
        // User hasn't set up biometric yet, redirect to biometric setup
        console.log('Biometric not enabled, redirecting to biometric setup');
        router.push('/biometricSetup');
        return;
      }
      
      // Biometric is enabled, proceed with biometric verification
      const biometricResult = await verifyBiometric();
      
      if (!biometricResult.success) {
        console.log('Biometric verification failed:', biometricResult.error);
        Alert.alert('Biometric Login Failed', biometricResult.error || 'Please try again.');
        return;
      }
      
      console.log('Biometric verification successful, checking stored tokens');
      
      // Check if we have valid stored tokens
      const accessToken = await getAccessToken();
      if (!accessToken) {
        Alert.alert(
          'Authentication Required',
          'Please log in with your email and password first to enable biometric login.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Try to get user profile using stored tokens
      try {
        const userProfile = await me();
        console.log('User profile retrieved:', userProfile);
        
        // Set user in context
        setUser(userProfile);
        console.log('User set in context via biometric login');
        
        // Navigate to dashboard
        console.log('Biometric login successful, navigating to dashboard');
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Failed to get user profile with stored tokens:', error);
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in with your email and password.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      Alert.alert('Error', 'Biometric authentication failed. Please try again.');
    }
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
        {/* Header with back button */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Image source={require('../assets/images/back.svg')} style={styles.backIcon} />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Log in to access your account and stay connected</Text>
          </View>
        </View>

        {/* Login Method Tabs */}
        <View style={styles.tabContainer}>
          <Pressable 
            style={[styles.tab, loginMethod === 'email' && styles.activeTab]} 
            onPress={() => setLoginMethod('email')}
          >
            <Text style={[styles.tabText, loginMethod === 'email' && styles.activeTabText]}>
              Email
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.tab, loginMethod === 'phone' && styles.activeTab]} 
            onPress={() => setLoginMethod('phone')}
          >
            <Text style={[styles.tabText, loginMethod === 'phone' && styles.activeTabText]}>
              Phone number
            </Text>
          </Pressable>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {loginMethod === 'email' ? 'Email' : 'Phone number'}
            </Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
              placeholderTextColor="#666666"
              autoCapitalize="none"
              keyboardType={loginMethod === 'email' ? 'email-address' : 'phone-pad'}
              autoComplete={loginMethod === 'email' ? 'email' : 'tel'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#666666"
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </Pressable>
        </View>

        {/* Login Button */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Log In'}
            </Text>
          </Pressable>

          {/* Biometric Login Button - Only show if biometric is available and credentials are validated */}
          {biometricAvailable && credentialsValidated && (
            <Pressable
              style={styles.biometricButton}
              onPress={onBiometricLogin}
            >
              <Text style={styles.biometricButtonText}>
                Setup {biometricType} Login
              </Text>
            </Pressable>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingBottom: 30,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#333333',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 60,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  eyeText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 40,
  },
  loginButton: {
    backgroundColor: '#333333',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#666666',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    backgroundColor: '#333333',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  biometricButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});