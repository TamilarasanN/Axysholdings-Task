# Supabase Configuration Debug Guide

## 🚨 **Current Issue:**
The Supabase test is failing with: `Email address "test-1758805845114@example.com" is invalid`

## 🔍 **Debugging Steps:**

### **1. Check Supabase Dashboard Settings:**

#### **Authentication Settings:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Settings**
4. Check the following settings:

#### **Email Settings:**
- **Enable email confirmations**: Should be **DISABLED** for testing
- **Enable email change confirmations**: Can be enabled
- **Enable phone confirmations**: Can be disabled

#### **Email Templates:**
- Check if there are custom email templates that might be causing issues
- Verify the "Confirm signup" template is properly configured

### **2. Check Project Configuration:**

#### **API Settings:**
1. Go to **Settings** → **API**
2. Verify:
   - **Project URL**: Should match your `EXPO_PUBLIC_SUPABASE_URL`
   - **Project API Key**: Should match your `EXPO_PUBLIC_SUPABASE_ANON_KEY`

#### **Database Settings:**
1. Go to **Settings** → **Database**
2. Check if there are any custom policies or RLS settings

### **3. Test with Different Email Formats:**

The error suggests email validation is very strict. Try these formats:
- `test@gmail.com`
- `user@yahoo.com`
- `test@outlook.com`

### **4. Check Supabase Logs:**

1. Go to **Logs** in Supabase Dashboard
2. Look for authentication-related errors
3. Check for any custom validation rules

### **5. Common Fixes:**

#### **Fix 1: Disable Email Confirmation**
```sql
-- In Supabase SQL Editor
UPDATE auth.config 
SET enable_signup = true, 
    enable_email_confirmations = false;
```

#### **Fix 2: Check Email Domain Restrictions**
- Some Supabase projects have domain restrictions
- Check if `@example.com` or `@gmail.com` domains are blocked

#### **Fix 3: Verify Project Status**
- Ensure the Supabase project is active
- Check if there are any billing issues

### **6. Alternative Test Approach:**

Instead of creating test users, try:
1. **Test Connection Only**: Use the "Test Connection" button
2. **Manual Signup**: Try the actual signup flow with a real email
3. **Check Existing Users**: Look in Authentication → Users tab

## 🔧 **Quick Fixes to Try:**

### **Option 1: Use Real Email for Testing**
- Use your actual email address for testing
- Check your email for confirmation links

### **Option 2: Check Supabase Project Settings**
- Go to Authentication → Settings
- Disable "Enable email confirmations"
- Save settings

### **Option 3: Verify API Keys**
- Double-check the Supabase URL and API key in `app.json`
- Ensure they match the dashboard exactly

## 📋 **Next Steps:**

1. **Try the "Test Connection" button** first (safer)
2. **Check Supabase Dashboard** for any configuration issues
3. **Try with a real email** in the actual signup flow
4. **Check Supabase logs** for detailed error information

The issue is likely in the Supabase project configuration rather than the code itself.
