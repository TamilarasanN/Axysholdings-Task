import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';

export default function SignupCompleteScreen() {
  const { setJustCompletedSignup } = useAuth();

  const handleProceedToLogin = () => {
    setJustCompletedSignup(false); // Clear the signup completion flag
    
    // Redirect to Face ID login screen after signup completion
    console.log('Proceeding to Face ID login flow');
    router.replace('/faceIDLogin');
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
        {/* Main Content */}
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
              <Image source={require('../assets/images/signUpComplete.svg')} style={styles.bezelIcon} />
          </View>

          {/* Title */}
          <Text style={styles.title}>You&apos;re all set</Text>
          
          {/* Description */}
          <Text style={styles.description}>
            Your registration is complete, and Face ID is now enabled. Please log in to continue.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable style={styles.proceedButton} onPress={handleProceedToLogin}>
            <Text style={styles.proceedButtonText}>Proceed to Log In</Text>
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
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  checkmarkSquare: {
    width: 80,
    height: 80,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    // 3D effect styling
    borderWidth: 1,
    borderColor: '#333333',
  },
  bezelIcon: {
    width: 100,
    height: 100,
  },
  checkmarkIcon: {
    fontSize: 40,
    color: '#666666',
    fontWeight: 'bold',
    // 3D effect for the checkmark
    textShadowColor: '#000000',
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  proceedButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});
