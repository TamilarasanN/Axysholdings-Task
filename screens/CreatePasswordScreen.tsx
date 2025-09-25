import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';

export default function CreatePasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { signUp } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password validation
  const passwordRequirements = [
    { text: 'Minimum 8 characters', met: password.length >= 8 },
    { text: 'At least one uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'At least one lowercase letter', met: /[a-z]/.test(password) },
    { text: 'At least one number', met: /\d/.test(password) },
    { text: 'At least one special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const allRequirementsMet = passwordRequirements.every(req => req.met);
  const canProceed = allRequirementsMet && passwordsMatch;

  const handleNext = async () => {
    if (!canProceed || !email) return;

    setLoading(true);
    try {
      // Extract name from email (part before @)
      const name = email.split('@')[0];
      
      console.log('Creating account with:', { name, email });
      
      // Sign up the user with the password
      const result = await signUp(name, email, password);
      
      console.log('SignUp result:', result);
      
      // Check if we have a valid session
      if (result.user && result.accessToken) {
        // Navigate to biometric setup screen
        router.push('/biometricSetup');
      } else {
        // Handle case where email confirmation is required
        console.log('Email confirmation may be required');
        // Still navigate to biometric setup as user is created
        router.replace('/biometricSetup');
      }
    } catch (error) {
      console.error('Password creation error:', error);
      // TODO: Show error toast
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
        <Text style={styles.title}>Create password</Text>
        <Text style={styles.description}>
          Create a strong and secure password to protect your account and ensure your information stays safe.
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Password Field */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#666666"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Password Requirements */}
        <View style={styles.requirementsContainer}>
          {passwordRequirements.map((requirement, index) => (
            <View key={index} style={styles.requirementItem}>
              <Text style={[
                styles.requirementText,
                requirement.met && styles.requirementMet
              ]}>
                {requirement.met ? '✓' : '•'} {requirement.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Confirm Password Field */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor="#666666"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Password Match Indicator */}
        {confirmPassword.length > 0 && (
          <View style={styles.matchContainer}>
            <Text style={[
              styles.matchText,
              passwordsMatch ? styles.matchSuccess : styles.matchError
            ]}>
              {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
            </Text>
          </View>
        )}
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, canProceed && styles.nextButtonEnabled]}
        onPress={handleNext}
        disabled={!canProceed || loading}
      >
        <Text style={[
          styles.nextButtonText,
          canProceed && styles.nextButtonTextEnabled
        ]}>
          {loading ? 'Creating account...' : 'Next'}
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
  form: {
    paddingHorizontal: 20,
    flex: 1,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  eyeIcon: {
    fontSize: 20,
  },
  requirementsContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  requirementItem: {
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#999999',
  },
  requirementMet: {
    color: '#00FF00',
  },
  matchContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  matchText: {
    fontSize: 14,
    fontWeight: '500',
  },
  matchSuccess: {
    color: '#00FF00',
  },
  matchError: {
    color: '#FF4444',
  },
  nextButton: {
    backgroundColor: '#333333',
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonEnabled: {
    backgroundColor: '#FFFFFF',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  nextButtonTextEnabled: {
    color: '#000000',
  },
});
