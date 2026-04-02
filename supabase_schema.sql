-- Run this in your Supabase SQL Editor

-- 1. Create a users extension table for credits
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  credits integer default 0,
  role text default 'citizen',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

-- 2. Create Reports table (PostGIS ideally, but using lat/lng floats for simplicity first)
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  latitude double precision not null,
  longitude double precision not null,
  image_url text,
  status text default 'pending', -- 'pending', 'verified', 'rejected'
  severity text default 'low', -- 'low', 'medium', 'high', 'critical'
  risk_index integer default 0,
  eta_to_ocean_hours integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to insert reports (for the portal)
CREATE POLICY "Anyone can insert a report" 
  ON public.reports FOR INSERT 
  WITH CHECK (true);

-- Allow everyone to view reports (for the dashboard)
CREATE POLICY "Everyone can view reports" 
  ON public.reports FOR SELECT 
  USING (true);

-- 3. Create Alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid default gen_random_uuid() primary key,
  report_id uuid references public.reports(id),
  title text not null,
  description text,
  severity text not null,
  acknowledged boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view alerts" 
  ON public.alerts FOR SELECT 
  USING (true);

-- Create a storage bucket for waste images
insert into storage.buckets (id, name, public)
values ('waste-images', 'waste-images', true)
on conflict (id) do nothing;

create policy "Images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'waste-images' );

create policy "Anyone can upload an image"
  on storage.objects for insert
  with check ( bucket_id = 'waste-images' );
