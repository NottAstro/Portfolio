-- Run this query in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor

ALTER TABLE public.certificates 
ADD COLUMN IF NOT EXISTS description text;
