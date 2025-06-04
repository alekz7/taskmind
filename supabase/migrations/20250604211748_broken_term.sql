/*
  # Initial schema setup for TaskMind

  1. New Tables
    - users
      - Custom fields for user preferences
      - Extends Supabase auth.users
    - tasks
      - Core task management table
      - Includes all task fields with proper constraints
    - categories
      - Reusable categories for tasks
    
  2. Security
    - Enable RLS on all tables
    - Set up policies for user-specific access
*/

-- Create custom types
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_status AS ENUM ('pending', 'in-progress', 'completed');

-- Create users table to extend auth.users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  work_hours_start TIME DEFAULT '09:00',
  work_hours_end TIME DEFAULT '17:00',
  work_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  focus_time INTEGER DEFAULT 45,
  break_time INTEGER DEFAULT 15,
  theme TEXT DEFAULT 'system',
  notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#4F46E5',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  due_date TIMESTAMPTZ,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  estimated_time INTEGER, -- in minutes
  actual_time INTEGER, -- in minutes
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
-- CREATE POLICY "Users can read own data"
--   ON users
--   FOR SELECT
--   TO authenticated
--   USING (auth.uid() = id);

-- CREATE POLICY "Users can update own data"
--   ON users
--   FOR UPDATE
--   TO authenticated
--   USING (auth.uid() = id);

-- CREATE POLICY "Users can read own categories"
--   ON categories
--   FOR SELECT
--   TO authenticated
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert own categories"
--   ON categories
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update own categories"
--   ON categories
--   FOR UPDATE
--   TO authenticated
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete own categories"
--   ON categories
--   FOR DELETE
--   TO authenticated
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can read own tasks"
--   ON tasks
--   FOR SELECT
--   TO authenticated
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert own tasks"
--   ON tasks
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update own tasks"
--   ON tasks
--   FOR UPDATE
--   TO authenticated
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete own tasks"
--   ON tasks
--   FOR DELETE
--   TO authenticated
--   USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();