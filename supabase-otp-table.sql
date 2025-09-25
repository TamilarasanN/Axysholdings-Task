-- Create OTP verifications table in Supabase
-- Run this SQL in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON otp_verifications(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to insert OTP records
CREATE POLICY "Allow anonymous OTP creation" ON otp_verifications
  FOR INSERT WITH CHECK (true);

-- Create policy to allow anonymous users to read OTP records for verification
CREATE POLICY "Allow anonymous OTP verification" ON otp_verifications
  FOR SELECT USING (true);

-- Create policy to allow anonymous users to delete OTP records after verification
CREATE POLICY "Allow anonymous OTP deletion" ON otp_verifications
  FOR DELETE USING (true);

-- Create function to automatically clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_verifications WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean up expired OTPs
-- This would need to be set up in Supabase dashboard under Database > Functions
