import { Redirect } from 'expo-router';
import { useAuth } from '../auth/AuthContext';

export default function Index() {
  const { user, bootstrapDone, justCompletedSignup, showBiometricLogin } = useAuth();
  
  console.log('Index route - user:', !!user, 'justCompletedSignup:', justCompletedSignup, 'showBiometricLogin:', showBiometricLogin);
  
  if (!bootstrapDone) {
    return null; // Will show splash screen in _layout.tsx
  }
  
  // Redirect based on authentication state
  if (user) {
    // If user just completed signup, let the biometric setup flow handle navigation
    if (justCompletedSignup) {
      console.log('User completed signup, not redirecting to dashboard');
      return null; // Don't redirect, let the current flow continue
    }
    
    // If biometric login should be shown, redirect to Face ID login screen
    if (showBiometricLogin) {
      console.log('User authenticated and biometric enabled, redirecting to Face ID login');
      return <Redirect href="/faceIDLogin" />;
    }
    
    console.log('User authenticated but biometric not enabled, redirecting to dashboard');
    return <Redirect href="/(tabs)" />; // User is authenticated, go to dashboard
  } else {
    console.log('User not authenticated, redirecting to welcome');
    return <Redirect href="/welcome" />; // User is not authenticated, go to welcome
  }
}
