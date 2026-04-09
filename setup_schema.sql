-- Migration: Add description columns if they don't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='hero_description') THEN
    ALTER TABLE public.site_settings ADD COLUMN hero_description TEXT DEFAULT 'Premium car rentals designed for your ultimate driving pleasure. Book your dream ride in minutes.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='features_title') THEN
    ALTER TABLE public.site_settings ADD COLUMN features_title TEXT DEFAULT 'Why AutoRent?';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='features') THEN
    ALTER TABLE public.site_settings ADD COLUMN features JSONB DEFAULT '[
      {"id": "insured", "title": "Fully Insured", "desc": "Every rental comes with comprehensive premium insurance. Focus on the thrill while we handle the rest.", "points": ["Multi-million liability", "Zero deductible", "Roadside assistance"], "color": "from-primary/20", "mock_id": "insured"},
      {"id": "concierge", "title": "24/7 Concierge", "desc": "From restaurant reservations to vehicle swaps, our team is your silent partner on the road.", "points": ["Live Chat Interface", "Itinerary Planning", "Emergency Response"], "color": "from-blue-400/20", "reverse": true, "mock_id": "concierge"},
      {"id": "pricing", "title": "Transparent Pricing", "desc": "No hidden fees. Taxes, delivery, and full-tank options are revealed from the first click.", "points": ["All-in pricing", "Real-time tax calculation", "Secure crypto-payments"], "color": "from-emerald-400/20", "mock_id": "pricing"},
      {"id": "delivery", "title": "Doorstep Delivery", "desc": "We bring the experience to you. Track your vehicle in real-time as it arrives. Detailed, fueled, and ready.", "points": ["Real-time Tracking", "Valet Delivery", "Airport Collection"], "color": "from-orange-400/20", "reverse": true, "mock_id": "delivery"},
      {"id": "perks", "title": "Exclusive Perks", "desc": "Joining AutoRent unlocks a world of racing events, private releases, and tiered rewards for loyal drivers.", "points": ["VIP Track Days", "Racing Events", "Tiered Rewards"], "color": "from-purple-500/20", "mock_id": "perks"},
      {"id": "fleet", "title": "The Boutique Fleet", "desc": "We don''t do mass market. Every vehicle is a masterwork, specifically chosen for its character and feedback.", "points": ["Hand-picked Selection", "Concours Condition", "Exotic Performance"], "color": "from-yellow-400/20", "reverse": true, "mock_id": "fleet"}
    ]'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cars' AND column_name='description') THEN
    ALTER TABLE public.cars ADD COLUMN description TEXT;
  END IF;
END $$;

-- Create cars table
create table if not exists public.cars (
  id uuid default gen_random_uuid() primary key,
  make text not null,
  model text not null,
  year int not null,
  price_per_day decimal not null,
  description text,
  availability_status text default 'Available',
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create rentals table
create table if not exists public.rentals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  car_id uuid references public.cars(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  total_price decimal not null,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  email TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY,
  hero_title TEXT DEFAULT 'Experience the Extraordinary',
  hero_description TEXT DEFAULT 'Premium car rentals designed for your ultimate driving pleasure. Book your dream ride in minutes.',
  typewriter_words TEXT[] DEFAULT ARRAY['Extraordinary', 'Ultimate Luxury', 'Pure Power', 'True Elegance'],
  heritage_title TEXT DEFAULT 'Redefining the standard of luxury transport.',
  heritage_description TEXT DEFAULT 'Founded on the belief that the journey is just as important as the destination, AutoRent brings unparalleled access to the world''s most prestigious automotive brands.',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Initial Site Settings
INSERT INTO public.site_settings (id, hero_description) 
VALUES ('landing_page', 'Premium car rentals designed for your ultimate driving pleasure. Book your dream ride in minutes.')
ON CONFLICT (id) DO UPDATE SET hero_description = EXCLUDED.hero_description;

-- Insert dummy data for cars if table is empty
INSERT INTO public.cars (make, model, year, price_per_day, image_url)
SELECT 'Tesla', 'Model S', 2024, 150, 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM public.cars WHERE make = 'Tesla');

INSERT INTO public.cars (make, model, year, price_per_day, image_url)
SELECT 'Porsche', '911 Carrera', 2023, 300, 'https://images.unsplash.com/photo-1503371471348-1058eb156d47?q=80&w=2070&auto=format&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM public.cars WHERE make = 'Porsche');

INSERT INTO public.cars (make, model, year, price_per_day, image_url)
SELECT 'Mercedes', 'G-Class', 2024, 250, 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=2069&auto=format&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM public.cars WHERE make = 'Mercedes');

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'employee');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
