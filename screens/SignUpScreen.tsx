import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { sendOTP } from '../api/auth';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const onSubmit = async () => { 
    if (!email.trim()) {
      // TODO: Show error toast
      return;
    }
    
    setLoading(true);
    try { 
      // Send OTP email
      await sendOTP({ email: email.trim() });
      
      // Navigate to OTP verification with email parameter
      router.push({
        pathname: '/otp-verification',
        params: { email: email.trim(), flow: 'signup' }
      });
    } catch (error) { 
      console.error('Sign up error:', error);
      // TODO: show toast with error message
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.description}>
            The future of your financial freedom. It&apos;s no longer about digits and decimals - it&apos;s about discovery.
          </Text>
        </View>
        
        {/* Form */}
        <View style={styles.form}>
          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput 
              style={styles.input} 
              value={email} 
              onChangeText={setEmail} 
              placeholder="Enter your email"
              placeholderTextColor="#666666"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          
          {/* Referral Code Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Referral Code (optional)</Text>
            <TextInput 
              style={styles.input} 
              value={referralCode} 
              onChangeText={setReferralCode} 
              placeholder="Enter referral code"
              placeholderTextColor="#666666"
              autoCapitalize="none"
            />
          </View>
          
          {/* Terms and Privacy */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, termsAccepted && styles.checkboxChecked]} 
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              By creating an account, I agree to Axys&apos;s{' '}
              <Text style={styles.link}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
              .
            </Text>
          </View>
        </View>
        
        {/* Next Button */}
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={onSubmit} 
          disabled={!termsAccepted || loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Sending OTP...' : 'Next'}
          </Text>
        </TouchableOpacity>
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
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 0,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  checkmark: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  link: {
    textDecorationLine: 'underline',
    color: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});