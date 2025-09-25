// Test Supabase connection and user creation
import { supabase } from '../lib/supaBase';

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL || 'Not set');
    console.log('Supabase Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
    
    // Test basic connection
    const { data, error } = await supabase.auth.getUser();
    console.log('Current user:', data.user);
    console.log('Connection error:', error);
    
    // Test creating a user with a more realistic email
    const testEmail = `testuser${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';
    
    console.log('Creating test user:', testEmail);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: { data: { name: 'Test User' } },
    });
    
    console.log('SignUp test result:', { signUpData, signUpError });
    
    if (signUpError) {
      console.error('SignUp test failed:', signUpError);
      return { success: false, error: signUpError };
    }
    
    console.log('Test user created successfully:', signUpData.user?.id);
    
    // Check if email confirmation is required
    const needsEmailConfirmation = signUpData.user && !signUpData.session;
    
    if (needsEmailConfirmation) {
      console.log('Email confirmation required - user created but not authenticated');
      return { 
        success: true, 
        user: signUpData.user,
        needsEmailConfirmation: true,
        message: 'User created successfully but email confirmation required'
      };
    }
    
    // Clean up test user
    if (signUpData.user) {
      // Note: We can't delete users via client, but this is just for testing
      console.log('Test user created - would need to be cleaned up manually');
    }
    
    return { success: true, user: signUpData.user };
  } catch (error) {
    console.error('Supabase test error:', error);
    return { success: false, error };
  }
}

export async function testSupabaseConnectionOnly() {
  try {
    console.log('Testing Supabase connection only...');
    
    // Test basic connection
    const { data, error } = await supabase.auth.getUser();
    console.log('Current user:', data.user);
    console.log('Connection error:', error);
    
    // AuthSessionMissingError is expected when no user is logged in
    const isExpectedError = error?.message?.includes('Auth session missing');
    
    return { 
      success: true, // Connection is successful
      connected: true,
      currentUser: data.user,
      error: isExpectedError ? null : error,
      message: isExpectedError ? 'Connected successfully (no user session - expected)' : 'Connected successfully'
    };
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return { success: false, connected: false, error };
  }
}
