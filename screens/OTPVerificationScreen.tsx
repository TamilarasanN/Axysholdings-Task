import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { sendOTP, verifyOTP } from '../api/auth';
import { useAuth } from '../auth/AuthContext';
import { isBiometricEnabled } from '../utils/secureStore';

type VerificationState = 'entering' | 'verifying' | 'success';

export default function OTPVerificationScreen() {
  const { email, password, flow } = useLocalSearchParams<{ email: string; password: string; flow?: string }>();
  const { signIn: authSignIn } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verificationState, setVerificationState] = useState<VerificationState>('entering');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Send OTP when screen loads
  useEffect(() => {
    const sendInitialOTP = async () => {
      if (email) {
        try {
          console.log('Sending initial OTP to:', email);
          await sendOTP({ email });
        } catch (error) {
          console.error('Initial OTP send error:', error);
        }
      }
    };

    sendInitialOTP();
  }, [email]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all fields are filled
    if (newOtp.every(digit => digit !== '') && verificationState === 'entering') {
      handleVerifyCode(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (!email) {
      console.error('No email provided for verification');
      return;
    }
    
    setVerificationState('verifying');
    
    try {
      const result = await verifyOTP({ email, otp: code });
      
      if (result.success) {
        setVerificationState('success');
        
        // Handle different flows after successful OTP verification
        if (flow === 'login' && password) {
          // Login flow: Sign in the user and check biometric setup
          try {
            console.log('OTP verified successfully, signing in user for login flow');
            await authSignIn(email, password);
            console.log('User signed in successfully, checking biometric setup');
            
            // Check if biometric is enabled to determine next step
            const biometricEnabled = await isBiometricEnabled();
            console.log('Biometric enabled status:', biometricEnabled);
            
            // Navigate based on biometric setup status
            setTimeout(() => {
              if (biometricEnabled) {
                // Biometric is enabled, go to dashboard
                console.log('Biometric enabled, navigating to dashboard');
                router.replace('/(tabs)');
              } else {
                // Biometric not enabled, go to biometric setup
                console.log('Biometric not enabled, navigating to biometric setup');
                router.replace('/biometricSetup');
              }
            }, 1500);
          } catch (signInError) {
            console.error('Sign in error after OTP verification:', signInError);
            setVerificationState('entering');
            // TODO: Show error message
          }
        } else if (flow === 'signup') {
          // Signup flow: Navigate to create password screen
          console.log('OTP verified successfully for signup flow, navigating to create password');
          setTimeout(() => {
            router.push({
              pathname: '/create-password',
              params: { email: email }
            });
          }, 1500);
        } else {
          // Fallback: If no flow specified or missing password for login
          console.error('Invalid flow or missing password for login flow');
          setVerificationState('entering');
        }
      } else {
        throw new Error('Invalid verification response');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setVerificationState('entering');
      // Clear the OTP fields on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      // TODO: Show error toast
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      console.error('No email provided for resend');
      return;
    }
    
    try {
      await sendOTP({ email });
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setVerificationState('entering');
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error('Resend OTP error:', error);
      // TODO: Show error toast
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image 
            source={require('../assets/images/back.svg')}
            style={styles.backIcon}
            contentFit="contain"
          />
        </TouchableOpacity>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            {flow === 'signup' ? 'Verify your email' : 'Verify your identity'}
          </Text>
          <Text style={styles.description}>
            We&apos;ve sent a 6-digit verification code to {email || ''}. The code expires in 60 seconds.
          </Text>
        </View>
        
        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
              editable={verificationState === 'entering'}
            />
          ))}
        </View>
        
        {/* Verification Status */}
        <View style={styles.statusContainer}>
          {verificationState === 'verifying' && (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.statusText}>Verifying code...</Text>
            </>
          )}
          {verificationState === 'success' && (
            <>
              <View style={styles.checkmarkContainer}>
                <Text style={styles.checkmarkIcon}>✓</Text>
              </View>
              <Text style={styles.successText}>Code verified successfully!</Text>
            </>
          )}
        </View>
        
        {/* Resend Code */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResendCode}>
              <Text style={styles.resendButton}>Resend code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>
              Resend code in {formatTime(resendTimer)}
            </Text>
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
    paddingTop: 50, // Account for status bar
    paddingBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  otpInput: {
    width: 50,
    height: 50,
    backgroundColor: '#333333',
    borderWidth: 2,
    borderColor: '#666666',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  otpInputFilled: {
    borderColor: '#FFFFFF',
    backgroundColor: '#444444',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  statusText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  checkmarkIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  successText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 20,
    fontWeight: '500',
  },
  resendContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  resendButton: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendTimer: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '500',
  },
});
