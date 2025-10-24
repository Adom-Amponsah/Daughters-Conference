-- Conference Registrations Table
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS conference_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Personal Information
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(50) NOT NULL,
  age VARCHAR(10) NOT NULL,
  
  -- Church Information
  is_grm_member BOOLEAN NOT NULL DEFAULT false,
  grm_branch VARCHAR(255),
  church_name VARCHAR(255),
  
  -- Exhibition Information
  wants_to_exhibit BOOLEAN NOT NULL DEFAULT false,
  exhibition_description TEXT,
  
  -- Constraints
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT grm_or_church CHECK (
    (is_grm_member = true AND grm_branch IS NOT NULL AND grm_branch != '') OR
    (is_grm_member = false AND church_name IS NOT NULL AND church_name != '')
  ),
  CONSTRAINT exhibition_logic CHECK (
    (wants_to_exhibit = false) OR 
    (wants_to_exhibit = true AND exhibition_description IS NOT NULL AND exhibition_description != '')
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conference_registrations_email ON conference_registrations(email);
CREATE INDEX IF NOT EXISTS idx_conference_registrations_created_at ON conference_registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_conference_registrations_grm_member ON conference_registrations(is_grm_member);

-- Enable Row Level Security (RLS)
ALTER TABLE conference_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow anyone to insert (register) - no authentication required
CREATE POLICY "Enable insert for anonymous users" ON conference_registrations
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read (for duplicate email checking) - no authentication required
CREATE POLICY "Enable read for anonymous users" ON conference_registrations
  FOR SELECT USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_conference_registrations_updated_at
    BEFORE UPDATE ON conference_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for registration statistics
CREATE OR REPLACE VIEW registration_stats AS
SELECT 
  COUNT(*) as total_registrations,
  COUNT(*) FILTER (WHERE is_grm_member = true) as grm_members,
  COUNT(*) FILTER (WHERE is_grm_member = false) as non_grm_members,
  COUNT(*) FILTER (WHERE wants_to_exhibit = true) as exhibitors,
  DATE_TRUNC('day', created_at) as registration_date
FROM conference_registrations
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY registration_date DESC;
