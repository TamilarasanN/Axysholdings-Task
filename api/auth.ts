import { supabase } from '../lib/supaBase';
import { createOTPEmailTemplate, sendEmail } from './emailService';

export type SignInReq = { email: string; password: string };
export type SignUpReq = { email: string; password: string; name: string };
export type SendOTPReq = { email: string };
export type VerifyOTPReq = { email: string; otp: string };

// Type declaration for global OTP storage
declare global {
  var otpStorage: Map<string, { otp: string; expires_at: number }> | undefined;
}

export async function validateCredentials(req: SignInReq) {
  console.log('API validateCredentials called with:', { email: req.email });
  
  // Try to sign in but don't store the session
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email: req.email, 
    password: req.password 
  });

  console.log('Supabase validateCredentials response:', { data, error });

  if (error) {
    console.error('Supabase validateCredentials error:', error);
    throw error;
  }

  // Sign out immediately to not create a session
  await supabase.auth.signOut();

  console.log('Credentials validated successfully');
  return { valid: true };
}

export async function signIn(req: SignInReq) {
  console.log('API signIn called with:', { email: req.email });
  
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email: req.email, 
    password: req.password 
  });
  
  console.log('Supabase signIn response:', { data, error });
  
  if (error) {
    console.error('Supabase signIn error:', error);
    throw error;
  }
  
  const user = data.user ? { 
    id: data.user.id, 
    name: data.user.user_metadata?.name ?? '', 
    email: data.user.email! 
  } : null;
  
  console.log('SignIn successful, user:', user);
  console.log('Session exists:', !!data.session);
  
  return { 
    user, 
    accessToken: data.session!.access_token, 
    refreshToken: data.session!.refresh_token 
  };
}

export async function signUp(req: SignUpReq) {
  console.log('Creating user account:', { email: req.email, name: req.name });
  
  const { data, error } = await supabase.auth.signUp({
    email: req.email,
    password: req.password,
    options: { data: { name: req.name } },
  });
  
  console.log('SignUp response:', { data, error });
  
  if (error) {
    console.error('SignUp error:', error);
    throw error;
  }
  
  const user = data.user ? { id: data.user.id, name: data.user.user_metadata?.name ?? '', email: data.user.email! } : null;
  const session = data.session; // may be null if email confirmation is enabled
  
  console.log('User created:', user);
  console.log('Session:', session ? 'Active' : 'Pending email confirmation');
  
  return { user, accessToken: session?.access_token ?? '', refreshToken: session?.refresh_token ?? '' };
}

export async function sendOTP(req: SendOTPReq) {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    // Store OTP in Supabase (you might want to create a table for this)
    const { error } = await supabase
      .from('otp_verifications')
      .upsert({
        email: req.email,
        otp: otp,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        created_at: new Date().toISOString()
      });
    
    if (error) throw error;
  } catch (dbError) {
    // If table doesn't exist, fall back to in-memory storage for testing
    console.warn('Database table not found, using in-memory storage:', dbError);
    
    // Store OTP in memory (for testing only)
    if (!global.otpStorage) {
      global.otpStorage = new Map();
    }
    global.otpStorage.set(req.email, {
      otp: otp,
      expires_at: Date.now() + 5 * 60 * 1000 // 5 minutes
    });
  }
  
  // Send OTP via email
  try {
    const emailTemplate = createOTPEmailTemplate(req.email, otp);
    const emailSent = await sendEmail(emailTemplate);
    
    if (emailSent) {
      console.log(`OTP email sent successfully to ${req.email}`);
    } else {
      console.log(`OTP for ${req.email}: ${otp} (Email service not configured)`);
    }
  } catch (emailError) {
    console.error('Error sending OTP email:', emailError);
    console.log(`OTP for ${req.email}: ${otp} (Fallback - email failed)`);
  }
  
  return { success: true, message: 'OTP sent successfully' };
}

export async function verifyOTP(req: VerifyOTPReq) {
  try {
    const { data, error } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', req.email)
      .eq('otp', req.otp)
      .gte('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) {
      throw new Error('Invalid or expired OTP');
    }
    
    // Delete the used OTP
    await supabase
      .from('otp_verifications')
      .delete()
      .eq('email', req.email)
      .eq('otp', req.otp);
    
    return { 
      success: true, 
      message: 'OTP verified successfully',
      email: req.email
    };
  } catch (dbError) {
    // If table doesn't exist, fall back to in-memory storage for testing
    console.warn('Database table not found, using in-memory storage:', dbError);
    
    if (!global.otpStorage) {
      throw new Error('No OTP found');
    }
    
    const storedData = global.otpStorage.get(req.email);
    if (!storedData) {
      throw new Error('No OTP found for this email');
    }
    
    if (storedData.otp !== req.otp) {
      throw new Error('Invalid OTP');
    }
    
    if (Date.now() > storedData.expires_at) {
      global.otpStorage.delete(req.email);
      throw new Error('OTP expired');
    }
    
    // Remove the used OTP
    global.otpStorage.delete(req.email);
    
    return { 
      success: true, 
      message: 'OTP verified successfully',
      email: req.email
    };
  }
}

export async function me() {
  const { data } = await supabase.auth.getUser();
  const u = data.user; if (!u) throw new Error('No session');
  return { id: u.id, name: u.user_metadata?.name ?? '', email: u.email! };
}

export async function signOutServer() { await supabase.auth.signOut(); }