# Environment Setup Guide

## Setting up Environment Variables

To use this app, you need to set up environment variables for external services. Here's how:

### 1. Create Environment File

Create a `.env` file in the root directory of your project:

```bash
# SendGrid API Key for sending emails
EXPO_PUBLIC_SENDGRID_API_KEY=your_sendgrid_api_key_here

# Supabase Configuration (if using Supabase)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Get SendGrid API Key

1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up or log in to your account
3. Navigate to Settings > API Keys
4. Create a new API key with "Mail Send" permissions
5. Copy the API key and replace `your_sendgrid_api_key_here` in your `.env` file

### 3. Update app.json (if needed)

If you need to add environment variables to your app configuration, you can add them to the `extra` section in `app.json`:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_SENDGRID_API_KEY": "your_sendgrid_api_key_here"
    }
  }
}
```

**⚠️ IMPORTANT SECURITY NOTE:**
- Never commit your `.env` file to version control
- Never commit API keys directly in your code
- Use environment variables for all sensitive data
- The `.env` file is already in `.gitignore` to prevent accidental commits

### 4. For Production Builds

When building for production with EAS Build, set your environment variables in the EAS dashboard:

1. Go to [EAS Dashboard](https://expo.dev/)
2. Select your project
3. Go to Settings > Environment Variables
4. Add your environment variables there

This ensures your secrets are not exposed in your codebase.
