-- Limi Database Schema - SAFE VERSION (csak hiányzó elemek)
-- Ez a verzió ellenőrzi, hogy léteznek-e már a táblák

-- Enable UUID extension (ha még nincs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table (csak ha még nem létezik)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  settings JSONB DEFAULT '{
    "theme": "dark",
    "expiryWarningDays": 14,
    "notifications": true
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#a3e635',
  icon TEXT DEFAULT 'Package',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Locations Table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  barcode TEXT,
  batches JSONB DEFAULT '[]'::jsonb,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Product Knowledge Table
CREATE TABLE IF NOT EXISTS custom_product_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  barcode TEXT NOT NULL,
  learned_name TEXT NOT NULL,
  learned_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  learned_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  use_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, barcode)
);

-- Indexes (csak ha még nem léteznek)
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_location_id ON products(location_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON locations(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_knowledge_user_barcode ON custom_product_knowledge(user_id, barcode);

-- Enable RLS (ha még nincs)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_product_knowledge ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DO $$ 
BEGIN
  -- User Profiles Policies
  DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
  
  CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);
  CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);
  CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

  -- Categories Policies
  DROP POLICY IF EXISTS "Users can view own categories" ON categories;
  DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
  DROP POLICY IF EXISTS "Users can update own categories" ON categories;
  DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
  
  CREATE POLICY "Users can view own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);

  -- Locations Policies
  DROP POLICY IF EXISTS "Users can view own locations" ON locations;
  DROP POLICY IF EXISTS "Users can insert own locations" ON locations;
  DROP POLICY IF EXISTS "Users can update own locations" ON locations;
  DROP POLICY IF EXISTS "Users can delete own locations" ON locations;
  
  CREATE POLICY "Users can view own locations" ON locations
    FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own locations" ON locations
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own locations" ON locations
    FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete own locations" ON locations
    FOR DELETE USING (auth.uid() = user_id);

  -- Products Policies
  DROP POLICY IF EXISTS "Users can view own products" ON products;
  DROP POLICY IF EXISTS "Users can insert own products" ON products;
  DROP POLICY IF EXISTS "Users can update own products" ON products;
  DROP POLICY IF EXISTS "Users can delete own products" ON products;
  
  CREATE POLICY "Users can view own products" ON products
    FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own products" ON products
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own products" ON products
    FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete own products" ON products
    FOR DELETE USING (auth.uid() = user_id);

  -- Custom Product Knowledge Policies
  DROP POLICY IF EXISTS "Users can view own knowledge" ON custom_product_knowledge;
  DROP POLICY IF EXISTS "Users can insert own knowledge" ON custom_product_knowledge;
  DROP POLICY IF EXISTS "Users can update own knowledge" ON custom_product_knowledge;
  DROP POLICY IF EXISTS "Users can delete own knowledge" ON custom_product_knowledge;
  
  CREATE POLICY "Users can view own knowledge" ON custom_product_knowledge
    FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own knowledge" ON custom_product_knowledge
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own knowledge" ON custom_product_knowledge
    FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete own knowledge" ON custom_product_knowledge
    FOR DELETE USING (auth.uid() = user_id);
END $$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist, then recreate
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_custom_knowledge_updated_at ON custom_product_knowledge;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_knowledge_updated_at BEFORE UPDATE ON custom_product_knowledge
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default categories and locations for new users
CREATE OR REPLACE FUNCTION create_default_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default profile
  INSERT INTO user_profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Felhasználó'))
  ON CONFLICT (id) DO NOTHING;

  -- Insert default categories
  INSERT INTO categories (user_id, name, color, icon) VALUES
    (NEW.id, 'Tejtermékek', '#60a5fa', 'Milk'),
    (NEW.id, 'Húsok', '#f87171', 'Beef'),
    (NEW.id, 'Zöldségek', '#4ade80', 'Carrot'),
    (NEW.id, 'Gyümölcsök', '#fb923c', 'Apple'),
    (NEW.id, 'Pékáruk', '#fbbf24', 'Croissant'),
    (NEW.id, 'Konzervek', '#a78bfa', 'Package'),
    (NEW.id, 'Italok', '#22d3ee', 'Coffee'),
    (NEW.id, 'Egyéb', '#94a3b8', 'ShoppingBag')
  ON CONFLICT (user_id, name) DO NOTHING;

  -- Insert default locations
  INSERT INTO locations (user_id, name) VALUES
    (NEW.id, 'Hűtő'),
    (NEW.id, 'Fagyasztó'),
    (NEW.id, 'Kamra'),
    (NEW.id, 'Szekrény')
  ON CONFLICT (user_id, name) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_user_data();

-- Enable Realtime (ha még nincs)
DO $$
BEGIN
  -- Check if publication exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'categories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE categories;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'locations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE locations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'custom_product_knowledge'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE custom_product_knowledge;
  END IF;
END $$;
