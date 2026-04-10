-- SECURE LOCKDOWN: Enable Row Level Security (RLS) on all core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- CLEANUP: Remove any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;

DROP POLICY IF EXISTS "Public can view cars" ON public.cars;
DROP POLICY IF EXISTS "Admins have full access to cars" ON public.cars;

DROP POLICY IF EXISTS "Users can view own rentals" ON public.rentals;
DROP POLICY IF EXISTS "Users can insert own rentals" ON public.rentals;
DROP POLICY IF EXISTS "Users can cancel own rentals within 24h" ON public.rentals;
DROP POLICY IF EXISTS "Admins have full access to rentals" ON public.rentals;

DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins have full access to site settings" ON public.site_settings;

-- 1. PROFILES POLICIES
-- Anyone authenticated can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can do everything
CREATE POLICY "Admins have full access to profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2. CARS POLICIES
-- Anyone (even unauthenticated) can view the fleet
CREATE POLICY "Public can view cars" ON public.cars
  FOR SELECT USING (true);

-- Only Admins can manage the fleet
CREATE POLICY "Admins have full access to cars" ON public.cars
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. RENTALS POLICIES
-- Users can view only their own rentals
CREATE POLICY "Users can view own rentals" ON public.rentals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can book for themselves
CREATE POLICY "Users can insert own rentals" ON public.rentals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can cancel their own rentals within 24 hours of booking
CREATE POLICY "Users can update own rentals within 24h" ON public.rentals
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id 
    AND created_at > (now() - interval '24 hours')
  )
  WITH CHECK (
    auth.uid() = user_id
    AND (status = 'cancelled' OR status = 'pending')
  );

-- Admins can manage all rentals
CREATE POLICY "Admins have full access to rentals" ON public.rentals
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. SITE SETTINGS POLICIES
-- Public can view settings
CREATE POLICY "Public can view site settings" ON public.site_settings
  FOR SELECT USING (true);

-- Admins can update settings
CREATE POLICY "Admins have full access to site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
