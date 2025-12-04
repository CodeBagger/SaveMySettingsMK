-- Migration script to add user authentication support
-- Run this script if you have an existing database with data

-- Step 1: Add user_id columns (nullable initially to allow migration)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: For existing data, you'll need to assign it to a user
-- Option A: If you want to assign all existing data to a specific user, uncomment and set the user_id:
-- UPDATE projects SET user_id = 'YOUR_USER_ID_HERE' WHERE user_id IS NULL;
-- UPDATE settings SET user_id = 'YOUR_USER_ID_HERE' WHERE user_id IS NULL;

-- Option B: If you want to delete all existing data (fresh start):
-- DELETE FROM settings;
-- DELETE FROM projects;

-- Step 3: Make user_id NOT NULL after assigning data
-- ALTER TABLE projects ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE settings ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Drop foreign key constraint first (it depends on the unique constraint)
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_project_name_fkey;

-- Step 5: Update unique constraints
-- Drop old unique constraint on projects.name (now safe since FK is dropped)
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_name_key;

-- Add new unique constraint on (user_id, name)
ALTER TABLE projects ADD CONSTRAINT projects_user_id_name_key UNIQUE (user_id, name);

-- Drop old unique constraint on settings
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_project_name_key_key;

-- Add new unique constraint on (user_id, project_name, key)
ALTER TABLE settings ADD CONSTRAINT settings_user_id_project_name_key_key UNIQUE (user_id, project_name, key);

-- Step 6: Add new foreign key constraint (now references the new unique constraint)
ALTER TABLE settings ADD CONSTRAINT settings_user_id_project_name_fkey 
  FOREIGN KEY (user_id, project_name) REFERENCES projects(user_id, name) ON DELETE CASCADE;

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);

-- Step 8: Drop old public policies
DROP POLICY IF EXISTS "Allow public read access to projects" ON projects;
DROP POLICY IF EXISTS "Allow public insert access to projects" ON projects;
DROP POLICY IF EXISTS "Allow public delete access to projects" ON projects;
DROP POLICY IF EXISTS "Allow public read access to settings" ON settings;
DROP POLICY IF EXISTS "Allow public insert access to settings" ON settings;
DROP POLICY IF EXISTS "Allow public update access to settings" ON settings;
DROP POLICY IF EXISTS "Allow public delete access to settings" ON settings;

-- Step 9: Create user-specific RLS policies
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own settings" ON settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON settings
  FOR DELETE USING (auth.uid() = user_id);

