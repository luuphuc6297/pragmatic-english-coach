-- Run this script in your Supabase SQL Editor to create the necessary tables

CREATE TABLE IF NOT EXISTS app_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own state" 
  ON app_state FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own state" 
  ON app_state FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own state" 
  ON app_state FOR UPDATE 
  USING (auth.uid() = user_id);

-- Conversation History Table
CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  title TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  context JSONB,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, conversation_id)
);

ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history" 
  ON conversation_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history" 
  ON conversation_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own history" 
  ON conversation_history FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history" 
  ON conversation_history FOR DELETE 
  USING (auth.uid() = user_id);

-- Saved Items Table
CREATE TABLE IF NOT EXISTS saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  original TEXT NOT NULL,
  correction TEXT NOT NULL,
  type TEXT NOT NULL,
  context TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  mastery_score INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  examples JSONB,
  part_of_speech TEXT,
  next_review_date BIGINT,
  interval INTEGER,
  ease_factor REAL,
  review_count INTEGER,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, item_id)
);

ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved items" 
  ON saved_items FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved items" 
  ON saved_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved items" 
  ON saved_items FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved items" 
  ON saved_items FOR DELETE 
  USING (auth.uid() = user_id);
