-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, name)
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, project_name, key),
  FOREIGN KEY (user_id, project_name) REFERENCES projects(user_id, name) ON DELETE CASCADE
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- Create index on project_name for faster queries
CREATE INDEX IF NOT EXISTS idx_settings_project_name ON settings(project_name);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop old public policies if they exist
DROP POLICY IF EXISTS "Allow public read access to projects" ON projects;
DROP POLICY IF EXISTS "Allow public insert access to projects" ON projects;
DROP POLICY IF EXISTS "Allow public delete access to projects" ON projects;
DROP POLICY IF EXISTS "Allow public read access to settings" ON settings;
DROP POLICY IF EXISTS "Allow public insert access to settings" ON settings;
DROP POLICY IF EXISTS "Allow public update access to settings" ON settings;
DROP POLICY IF EXISTS "Allow public delete access to settings" ON settings;

-- Projects policies - users can only access their own projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Settings policies - users can only access their own settings
CREATE POLICY "Users can view their own settings" ON settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON settings
  FOR DELETE USING (auth.uid() = user_id);

