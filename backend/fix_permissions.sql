-- ENSURE GRANTS: Make sure the authenticated role can actually read the tables
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.cars TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.rentals TO authenticated;
GRANT SELECT ON public.site_settings TO authenticated;

-- Ensure the public (anon) can still see cars and settings
GRANT SELECT ON public.cars TO anon;
GRANT SELECT ON public.site_settings TO anon;

-- Refresh the policies to be crystal clear
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
