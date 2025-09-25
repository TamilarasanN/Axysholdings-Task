// React Native compatible email service
// Uses SendGrid Web API directly via fetch (no Node.js dependencies)

import Constants from 'expo-constants';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    const SENDGRID_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_SENDGRID_API_KEY;
    
    console.log('SendGrid API Key check:', {
      hasKey: !!SENDGRID_API_KEY,
      keyLength: SENDGRID_API_KEY?.length,
      keyStart: SENDGRID_API_KEY?.substring(0, 10) + '...',
      isPlaceholder: SENDGRID_API_KEY === 'YOUR_SENDGRID_API_KEY_HERE'
    });
    
    if (!SENDGRID_API_KEY || SENDGRID_API_KEY === 'YOUR_SENDGRID_API_KEY_HERE') {
      console.warn('SendGrid API key not configured. Email not sent.');
      console.log('Email would be sent:', emailData);
      return false;
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: emailData.to }],
            subject: emailData.subject,
          },
        ],
        from: { email: 'tamilarasann.1992@gmail.com', name: 'Axys Banking' },
        content: [
          {
            type: 'text/plain',
            value: emailData.text,
          },
          {
            type: 'text/html',
            value: emailData.html,
          },
        ],
      }),
    });

    if (response.ok) {
      console.log('Email sent successfully to:', emailData.to);
      return true;
    } else {
      const errorData = await response.text();
      console.error('SendGrid API error:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export function createOTPEmailTemplate(email: string, otp: string): EmailData {
  return {
    to: email,
    subject: 'Your Axys Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Axys Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #000000; font-size: 32px; margin: 0; font-weight: bold;">AXYS</h1>
            <p style="color: #666666; font-size: 16px; margin: 10px 0 0 0;">Banking for Neo Thinkers</p>
          </div>
          
          <!-- Main Content -->
          <div style="text-align: center;">
            <h2 style="color: #000000; font-size: 24px; margin-bottom: 20px;">Verify Your Email</h2>
            <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
              Thank you for signing up with Axys! Please use the verification code below to complete your registration:
            </p>
            
            <!-- OTP Code Box -->
            <div style="background-color: #000000; padding: 30px; border-radius: 12px; margin: 30px 0;">
              <h1 style="color: #ffffff; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;">${otp}</h1>
            </div>
            
            <p style="color: #666666; font-size: 14px; margin-bottom: 30px;">
              This code will expire in <strong>5 minutes</strong>.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="color: #666666; font-size: 14px; margin: 0;">
                <strong>Security Tip:</strong> Never share this code with anyone. Axys will never ask for your verification code via phone or email.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee;">
            <p style="color: #999999; font-size: 12px; margin: 0;">
              This email was sent by Axys Banking App<br>
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      AXYS - Banking for Neo Thinkers
      
      Verify Your Email
      
      Thank you for signing up with Axys! Please use the verification code below to complete your registration:
      
      Verification Code: ${otp}
      
      This code will expire in 5 minutes.
      
      Security Tip: Never share this code with anyone. Axys will never ask for your verification code via phone or email.
      
      This email was sent by Axys Banking App
      If you didn't request this code, please ignore this email.
    `
  };
}

// Alternative: Resend API (React Native compatible)
export async function sendEmailWithResend(emailData: EmailData): Promise<boolean> {
  try {
    const RESEND_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      console.warn('Resend API key not configured.');
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Axys Banking <noreply@axys-banking.com>',
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Email sent successfully via Resend:', result);
      return true;
    } else {
      const errorData = await response.text();
      console.error('Resend API error:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    return false;
  }
}

// Alternative: EmailJS (React Native compatible)
export async function sendEmailWithEmailJS(emailData: EmailData): Promise<boolean> {
  try {
    const EMAILJS_SERVICE_ID = Constants.expoConfig?.extra?.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
    const EMAILJS_TEMPLATE_ID = Constants.expoConfig?.extra?.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;
    const EMAILJS_PUBLIC_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;
    
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.warn('EmailJS not configured.');
      return false;
    }

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: emailData.to,
          subject: emailData.subject,
          message: emailData.text,
          html_message: emailData.html,
        },
      }),
    });

    if (response.ok) {
      console.log('Email sent successfully via EmailJS to:', emailData.to);
      return true;
    } else {
      const errorData = await response.text();
      console.error('EmailJS API error:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('Error sending email via EmailJS:', error);
    return false;
  }
}