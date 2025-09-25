import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider, useAuth } from '../auth/AuthContext';
import SplashScreen from '../screens/SplashScreen';

function RootLayoutNav() {
  const { bootstrapDone } = useAuth();
  
  if (!bootstrapDone) {
    return <SplashScreen />;
  }

        return (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="sign-up" />
            <Stack.Screen name="otp-verification" />
            <Stack.Screen name="create-password" />
            <Stack.Screen name="biometricSetup" />
            <Stack.Screen name="signupComplete" />
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="faceIDLogin" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" />
          </Stack>
        );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}