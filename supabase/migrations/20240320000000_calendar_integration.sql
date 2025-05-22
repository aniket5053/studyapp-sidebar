-- Drop and recreate calendar_connections table
DROP TABLE IF EXISTS public.calendar_connections CASCADE;

CREATE TABLE public.calendar_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type = 'google'),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  calendar_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar_connections
CREATE POLICY "Users can view their own calendar connections"
  ON public.calendar_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar connections"
  ON public.calendar_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar connections"
  ON public.calendar_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar connections"
  ON public.calendar_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Add new columns to tasks table if not exist
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS source TEXT CHECK (source = 'google'),
  ADD COLUMN IF NOT EXISTS source_id TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT;

-- Create a unique index for source_id where not null
CREATE UNIQUE INDEX IF NOT EXISTS tasks_source_id_idx
  ON public.tasks (source_id)
  WHERE source_id IS NOT NULL;
