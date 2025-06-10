-- Rename profiles table to players
ALTER TABLE IF EXISTS profiles RENAME TO players;

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
ON players FOR SELECT
TO authenticated
USING (true);

-- Grant the same permissions that existed on profiles
GRANT ALL ON players TO authenticated;
GRANT ALL ON players TO service_role; 