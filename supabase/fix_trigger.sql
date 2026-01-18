-- FIX: Update the trigger function to handle the correct metadata key
-- The app sends 'name' in metadata, not 'full_name'

CREATE OR REPLACE FUNCTION create_default_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default profile with correct metadata key
  INSERT INTO user_profiles (id, name)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data->>'name',  -- Try 'name' first (what our app sends)
      NEW.raw_user_meta_data->>'full_name',  -- Fallback to 'full_name'
      'Felhasználó'  -- Default if neither exists
    )
  )
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
