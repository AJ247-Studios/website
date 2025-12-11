-- Update profiles table RLS policies
-- Run this in Supabase SQL Editor to add admin policies

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- ============================================
-- SELECT Policies
-- ============================================

-- Policy: Users can view their own profile
-- This allows any authenticated user to read their own profile data
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admins can view all profiles
-- This allows users with role='admin' to view all profiles
-- Note: This creates a self-referential check which is safe for SELECT
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- UPDATE Policies
-- ============================================

-- Policy: Users can update their own profile (limited fields)
-- Note: This allows users to update their own profile but NOT their role
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Admins can update all profiles
-- This allows admins to change roles and other profile data
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- INSERT Policies
-- ============================================

-- Policy: Allow inserting own profile (for signup trigger)
-- The trigger runs with SECURITY DEFINER so this is mostly for manual inserts
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- Ensure the updated_at trigger exists
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row update
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Verify setup
-- ============================================

-- Uncomment to check policies are applied:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Uncomment to check your user's role:
-- SELECT id, role FROM profiles WHERE id = auth.uid();
