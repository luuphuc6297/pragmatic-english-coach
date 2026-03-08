-- SQL Script to create necessary tables for Pragmatic English Coach
-- Run this script in your Supabase SQL Editor

-- 1. Create app_state table
CREATE TABLE IF NOT EXISTS public.app_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for app_state
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

-- Create policies for app_state
CREATE POLICY "Users can view their own app_state"
  ON public.app_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own app_state"
  ON public.app_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own app_state"
  ON public.app_state FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Create conversation_history table
CREATE TABLE IF NOT EXISTS public.conversation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  title TEXT NOT NULL,
  messages JSONB NOT NULL,
  context JSONB,
  timestamp BIGINT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, conversation_id)
);

-- Enable RLS for conversation_history
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

-- Create policies for conversation_history
CREATE POLICY "Users can view their own conversation_history"
  ON public.conversation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversation_history"
  ON public.conversation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation_history"
  ON public.conversation_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversation_history"
  ON public.conversation_history FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Create saved_items table
CREATE TABLE IF NOT EXISTS public.saved_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  original TEXT NOT NULL,
  correction TEXT,
  type TEXT NOT NULL,
  context TEXT,
  timestamp BIGINT NOT NULL,
  mastery_score INTEGER DEFAULT 0,
  explanation TEXT,
  examples JSONB,
  part_of_speech TEXT,
  next_review_date BIGINT,
  interval INTEGER,
  ease_factor REAL,
  review_count INTEGER,
  category TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Enable RLS for saved_items
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_items
CREATE POLICY "Users can view their own saved_items"
  ON public.saved_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved_items"
  ON public.saved_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved_items"
  ON public.saved_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved_items"
  ON public.saved_items FOR DELETE
  USING (auth.uid() = user_id);
