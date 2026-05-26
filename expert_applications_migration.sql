-- expert_applications table
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS expert_applications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  name         text NOT NULL,
  specialty    text,
  credentials  text[],
  city         text,
  years        int,
  phone        text NOT NULL,
  email        text NOT NULL,
  bio          text,
  status       text NOT NULL DEFAULT 'pending'  -- pending | approved | rejected
);

-- Admin can see all; public can only insert (no read)
ALTER TABLE expert_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_apply" ON expert_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_read_all" ON expert_applications
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
