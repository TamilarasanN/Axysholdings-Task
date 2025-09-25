import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { signIn as apiSignIn, signUp as apiSignUp, me, signOutServer } from '../api/auth';
import { clearTokens, isBiometricEnabled, saveTokens } from '../utils/secureStore';

export type User = { id: string; name: string; email: string } | null;

type Ctx = {
  user: User;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<{ user: User; accessToken: string; refreshToken: string }>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
  bootstrapDone: boolean;
  justCompletedSignup: boolean;
  setJustCompletedSignup: (value: boolean) => void;
  showBiometricLogin: boolean;
  setShowBiometricLogin: (value: boolean) => void;
  biometricSetupCompleted: boolean;
  setBiometricSetupCompleted: (value: boolean) => void;
};

const AuthContext = createContext<Ctx>({} as any);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(false);
  const [bootstrapDone, setBootstrapDone] = useState(false);
  const [justCompletedSignup, setJustCompletedSignup] = useState(false);
  const [showBiometricLogin, setShowBiometricLogin] = useState(false);
  const [biometricSetupCompleted, setBiometricSetupCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      const startTime = Date.now();
      const minSplashDuration = 2000; // 2 seconds minimum splash screen

      // Try to get user profile without biometric check
      // Biometric verification will be handled in individual screens
      try {
        const profile = await me();
        setUser(profile);
        
        // If user is authenticated, check if biometric login should be shown
        if (profile) {
          const biometricEnabled = await isBiometricEnabled();
          console.log('Bootstrap: User authenticated, biometric enabled:', biometricEnabled);
          
          // Set biometric setup completion status
          setBiometricSetupCompleted(biometricEnabled);
          
          if (biometricEnabled) {
            console.log('User authenticated and biometric enabled, will show Face ID login');
            setShowBiometricLogin(true);
          } else {
            console.log('User authenticated but biometric not enabled, will go to dashboard');
            setShowBiometricLogin(false);
          }
        }
      } catch {}

      // Ensure minimum splash screen duration
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minSplashDuration - elapsed);
      setTimeout(() => setBootstrapDone(true), remaining);
    })();
  }, []);

  // Monitor app state changes to sign out users who close app without biometric setup
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log('App state changed to:', nextAppState);
      
      // When app goes to background or inactive, check if user needs to be signed out
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Only sign out if user is authenticated but hasn't completed biometric setup
        if (user && !biometricSetupCompleted) {
          console.log('App going to background with user not having completed biometric setup, signing out');
          try {
            await signOutServer();
            await clearTokens();
            setUser(null);
            setShowBiometricLogin(false);
            setBiometricSetupCompleted(false);
            console.log('User signed out due to incomplete biometric setup');
          } catch (error) {
            console.error('Error signing out on app background:', error);
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [user, biometricSetupCompleted]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('AuthContext signIn called with:', { email });
      const res = await apiSignIn({ email, password });
      console.log('AuthContext signIn result:', res);
      
      await saveTokens(res.accessToken, res.refreshToken);
      console.log('Tokens saved successfully');
      
      setUser(res.user);
      console.log('User set in context:', res.user);
      
      // Clear biometric login flag when signing in with email/password
      // This ensures users don't get redirected to FaceIDLoginScreen after regular login
      setShowBiometricLogin(false);
      
      // Check if biometric is enabled to set completion status
      const biometricEnabled = await isBiometricEnabled();
      setBiometricSetupCompleted(biometricEnabled);
      
      console.log('Cleared showBiometricLogin flag after email/password login, biometric setup completed:', biometricEnabled);
    } catch (error) {
      console.error('AuthContext signIn error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      console.log('AuthContext signUp called with:', { name, email });
      const res = await apiSignUp({ name, email, password });
      console.log('AuthContext signUp result:', res);
      
      if (res.accessToken && res.refreshToken) {
        await saveTokens(res.accessToken, res.refreshToken);
        console.log('Tokens saved successfully');
      }
      
      if (res.user) {
        setUser(res.user);
        setJustCompletedSignup(true); // Mark that user just completed signup
        console.log('User set in context:', res.user);
        console.log('justCompletedSignup set to true');
      }
      
      return res;
    } catch (error) {
      console.error('AuthContext signUp error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = useCallback(async () => {
    console.log('SignOut called, current user:', user);
    try {
      // Sign out from Supabase server-side
      await signOutServer();
      console.log('Signed out from Supabase server');
      
      // Clear local tokens
      await clearTokens();
      console.log('Tokens cleared');
      
      // Clear user state
      setUser(null);
      setShowBiometricLogin(false);
      setBiometricSetupCompleted(false);
      console.log('User set to null, cleared biometric flags');
    } catch (error) {
      console.error('SignOut error:', error);
      // Even if server sign-out fails, clear local state
      await clearTokens();
      setUser(null);
      setShowBiometricLogin(false);
      setBiometricSetupCompleted(false);
      throw error;
    }
  }, [user]);

  const value = useMemo(() => ({ 
    user, 
    loading, 
    signIn, 
    signUp, 
    signOut, 
    setUser, 
    bootstrapDone, 
    justCompletedSignup, 
    setJustCompletedSignup,
    showBiometricLogin,
    setShowBiometricLogin,
    biometricSetupCompleted,
    setBiometricSetupCompleted
  }), [user, loading, bootstrapDone, justCompletedSignup, showBiometricLogin, biometricSetupCompleted, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};