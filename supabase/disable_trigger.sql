-- CRITICAL FIX: Disable the broken trigger temporarily
-- This will allow user registration to work

-- Drop the trigger that's causing the 500 error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function (optional, but clean)
DROP FUNCTION IF EXISTS create_default_user_data();

-- Now the app will handle profile creation manually via AuthContext
