-- Fix RLS Policies for Conference Registrations
-- Run this SQL in your Supabase SQL Editor to fix the authentication issues

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can register" ON conference_registrations;
DROP POLICY IF EXISTS "Users can view own registration" ON conference_registrations;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON conference_registrations;
DROP POLICY IF EXISTS "Enable read for anonymous users" ON conference_registrations;

-- Create new policies that allow anonymous access
CREATE POLICY "Enable insert for anonymous users" ON conference_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for anonymous users" ON conference_registrations
  FOR SELECT USING (true);

-- Drop and recreate trigger to avoid conflicts
DROP TRIGGER IF EXISTS update_conference_registrations_updated_at ON conference_registrations;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_conference_registrations_updated_at
    BEFORE UPDATE ON conference_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
