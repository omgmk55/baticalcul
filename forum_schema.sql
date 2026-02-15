-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Create Topics Table
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    -- Reference public.profiles for easier joining of username
    author_id UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    -- Reference public.profiles for easier joining of username
    author_id UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Enable Row Level Security
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- Cleanup existing policies to avoid conflicts (French and English names)
DROP POLICY IF EXISTS "Topics are viewable by everyone" ON public.topics;
DROP POLICY IF EXISTS "Topics viewable by everyone" ON public.topics;
DROP POLICY IF EXISTS "Users can create topics" ON public.topics;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des sujets" ON public.topics;
DROP POLICY IF EXISTS "Users can update their own topics" ON public.topics;
DROP POLICY IF EXISTS "Users can delete their own topics" ON public.topics;
DROP POLICY IF EXISTS "Messages are viewable by everyone" ON public.messages;
DROP POLICY IF EXISTS "Messages viewable by everyone" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
-- Policies for Topics
CREATE POLICY "Topics viewable by everyone" ON public.topics FOR
SELECT USING (true);
CREATE POLICY "Users can create topics" ON public.topics FOR
INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own topics" ON public.topics FOR
UPDATE WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete their own topics" ON public.topics FOR DELETE USING (auth.uid() = author_id);
-- Policies for Messages
CREATE POLICY "Messages viewable by everyone" ON public.messages FOR
SELECT USING (true);
CREATE POLICY "Users can create messages" ON public.messages FOR
INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own messages" ON public.messages FOR
UPDATE WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete their own messages" ON public.messages FOR DELETE USING (auth.uid() = author_id);