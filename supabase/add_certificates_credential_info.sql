-- Migration to add Credential Info fields to the certificates table in Supabase
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

ALTER TABLE public.certificates 
ADD COLUMN IF NOT EXISTS issuer text,
ADD COLUMN IF NOT EXISTS issue_date text,
ADD COLUMN IF NOT EXISTS credential_url text,
ADD COLUMN IF NOT EXISTS tags text;
