-- ── Phase 2 Migration — RESURGO
-- Run in Supabase SQL Editor (project: yjdyibeisprrzyozpqkd)

-- ── 1. companies (FinishingCompaniesPage live data) ─────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  name            text NOT NULL,
  city            text,
  badge           text DEFAULT 'قيد التحقق',
  specializations text[] DEFAULT '{}',
  description     text,
  phone           text,
  email           text,
  website         text,
  price_range_tier text DEFAULT 'mid',
  rating          numeric(3,1) DEFAULT 0,
  projects_count  int DEFAULT 0,
  logo_url        text,
  is_active       boolean NOT NULL DEFAULT true
);
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies_public_read" ON companies
  FOR SELECT USING (is_active = true);
CREATE POLICY "companies_admin_all" ON companies
  FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ── 2. developers (DevelopersPage live data) ────────────────────────────────
CREATE TABLE IF NOT EXISTS developers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  name                text NOT NULL,
  city                text,
  type                text,
  status              text DEFAULT 'قيد الإنشاء',
  founded_year        int,
  projects_completed  int DEFAULT 0,
  description         text,
  phone               text,
  email               text,
  logo_url            text,
  is_active           boolean NOT NULL DEFAULT true
);
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "developers_public_read" ON developers
  FOR SELECT USING (is_active = true);
CREATE POLICY "developers_admin_all" ON developers
  FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ── 3. studies (StudiesPage live data) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS studies (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  title        text NOT NULL,
  city         text,
  type         text,
  author       text,
  summary      text,
  content      text,
  category     text DEFAULT 'دراسة جدوى',
  is_published boolean NOT NULL DEFAULT true
);
ALTER TABLE studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "studies_public_read" ON studies
  FOR SELECT USING (is_published = true);
CREATE POLICY "studies_admin_all" ON studies
  FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ── 4. price_history (PropertyDetailPage chart) ─────────────────────────────
CREATE TABLE IF NOT EXISTS price_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  month       text NOT NULL,
  price       numeric NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "price_history_public_read" ON price_history
  FOR SELECT USING (true);
CREATE POLICY "price_history_admin_all" ON price_history
  FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
