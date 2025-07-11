-- Enable RLS on users table (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Allow user to insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user to read their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user to update own profile" ON public.users;

-- Create comprehensive RLS policies for users table
CREATE POLICY "Allow user to insert own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow user to read their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Allow user to update own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);