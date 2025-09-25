# Email Service Setup Guide

This guide will help you configure real email sending for the OTP verification system using React Native compatible services.

## 🚀 Quick Setup Options

### Option 1: SendGrid (Recommended) ✅ React Native Compatible

1. **Sign up for SendGrid**
   - Go to [sendgrid.com](https://sendgrid.com)
   - Create a free account (100 emails/day free)

2. **Get API Key**
   - Go to Settings → API Keys
   - Create a new API key with "Full Access"
   - Copy the API key

3. **Configure in App**
   - Replace `YOUR_SENDGRID_API_KEY_HERE` in `app.json` with your actual API key
   - Update the sender email in `api/emailService.ts` (line 25)

4. **Verify Sender Email**
   - In SendGrid dashboard, go to Settings → Sender Authentication
   - Click "Single Sender Verification"
   - Add your email address (e.g., `tamilarasann.1992@gmail.com`)
   - Check your email and click the verification link
   - Status should show "Verified"

### Option 2: Resend ✅ React Native Compatible

1. **Sign up for Resend**
   - Go to [resend.com](https://resend.com)
   - Create account and get API key

2. **Configure in App**
   - Replace `YOUR_RESEND_API_KEY_HERE` in `app.json` with your API key
   - Uncomment Resend code in `api/emailService.ts`

### Option 3: EmailJS ✅ React Native Compatible

1. **Sign up for EmailJS**
   - Go to [emailjs.com](https://emailjs.com)
   - Create account and get service credentials

2. **Configure in App**
   - Replace EmailJS placeholders in `app.json` with your credentials
   - Uncomment EmailJS code in `api/emailService.ts`


## 📧 Email Template Customization

The email template is in `api/emailService.ts` in the `createOTPEmailTemplate` function. You can customize:

- **Branding**: Logo, colors, fonts
- **Content**: Message text, instructions
- **Layout**: HTML structure and styling
- **Sender**: Email address and name

## 🔧 Testing

### Without Email Service (Development)
- The app will log OTP to console
- Perfect for development and testing

### With Email Service (Production)
- Real emails will be sent to users
- Check email delivery in service dashboard
- Monitor for delivery issues

## 🛡️ Security Considerations

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables in production
   - Rotate keys regularly

2. **Rate Limiting**
   - Implement rate limiting for OTP requests
   - Prevent spam and abuse

3. **Email Validation**
   - Validate email format before sending
   - Check for disposable email addresses

## 📊 Monitoring

- **SendGrid**: Check delivery stats in dashboard
- **AWS SES**: Monitor sending statistics
- **Resend**: View email logs and analytics

## 🚨 Troubleshooting

### Common Issues:

1. **"Email service not configured"**
   - Check API key is set correctly
   - Verify API key permissions

2. **"Sender not verified"**
   - Verify sender email in service dashboard
   - Check domain authentication

3. **Emails not delivered**
   - Check spam folder
   - Verify email address is correct
   - Check service delivery limits

### Debug Mode:
- Check console logs for detailed error messages
- Enable debug logging in email service
- Test with a known working email address
