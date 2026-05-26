-- ═══════════════════════════════════════════════════════════════════
-- RESURGO — Phase 1 Migration
-- Run this entire file in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. developer_projects ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS developer_projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  developer_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  city            text,
  type            text,
  total_units     int DEFAULT 0,
  sold_units      int DEFAULT 0,
  progress        int DEFAULT 0,
  start_date      date,
  next_milestone  text,
  description     text,
  status          text NOT NULL DEFAULT 'active'
);

ALTER TABLE developer_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "developer_own_projects" ON developer_projects
  FOR ALL USING (developer_id = auth.uid());

CREATE POLICY "admin_all_projects" ON developer_projects
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── 2. developer_tasks (for Gantt) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS developer_tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid REFERENCES developer_projects(id) ON DELETE CASCADE,
  title       text NOT NULL,
  start_date  date,
  end_date    date,
  progress    int DEFAULT 0,
  assigned_to text,
  status      text NOT NULL DEFAULT 'pending'
);

ALTER TABLE developer_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "developer_tasks_via_project" ON developer_tasks
  FOR ALL USING (
    project_id IN (
      SELECT id FROM developer_projects WHERE developer_id = auth.uid()
    )
  );

-- ── 3. engineer_tasks ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS engineer_tasks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  engineer_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id   uuid,
  title         text NOT NULL,
  city          text,
  type          text DEFAULT 'residential',
  priority      text DEFAULT 'medium',
  status        text DEFAULT 'pending',
  requested_at  date DEFAULT CURRENT_DATE,
  lat           numeric,
  lng           numeric,
  notes         text
);

ALTER TABLE engineer_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "engineer_own_tasks" ON engineer_tasks
  FOR ALL USING (engineer_id = auth.uid());

CREATE POLICY "admin_all_tasks" ON engineer_tasks
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── 4. engineer_reports (IVS) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS engineer_reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  engineer_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id       uuid REFERENCES engineer_tasks(id),
  property_id   uuid,
  report_type   text DEFAULT 'IVS',
  findings      jsonb,
  notes         text,
  status        text DEFAULT 'draft',
  issued_at     date
);

ALTER TABLE engineer_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "engineer_own_reports" ON engineer_reports
  FOR ALL USING (engineer_id = auth.uid());

-- ── 5. contractor_rfqs ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contractor_rfqs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  client_id     uuid REFERENCES auth.users(id),
  client_name   text,
  service       text NOT NULL,
  description   text,
  city          text,
  governorate   text,
  contact_phone text,
  budget_usd    numeric,
  urgency       text DEFAULT 'عادي',
  status        text DEFAULT 'new',
  contractor_id uuid REFERENCES auth.users(id),
  quote_price   numeric,
  quote_notes   text,
  quoted_at     timestamptz
);

ALTER TABLE contractor_rfqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_insert_rfq" ON contractor_rfqs
  FOR INSERT WITH CHECK (client_id = auth.uid() OR client_id IS NULL);

CREATE POLICY "contractor_read_rfqs" ON contractor_rfqs
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('contractor', 'admin')
    OR client_id = auth.uid()
  );

CREATE POLICY "contractor_update_rfq" ON contractor_rfqs
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('contractor', 'admin')
  );

CREATE POLICY "admin_all_rfqs" ON contractor_rfqs
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── 6. city_price_baselines (for Appraiser) ─────────────────────────
CREATE TABLE IF NOT EXISTS city_price_baselines (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city            text NOT NULL UNIQUE,
  base_price_usd  numeric NOT NULL,
  last_updated    date DEFAULT CURRENT_DATE,
  notes           text
);

ALTER TABLE city_price_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_read_baselines" ON city_price_baselines
  FOR SELECT USING (true);

CREATE POLICY "admin_manage_baselines" ON city_price_baselines
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Seed initial values
INSERT INTO city_price_baselines (city, base_price_usd) VALUES
  ('دمشق', 1850), ('ريف دمشق', 1200), ('حلب', 1240), ('حمص', 1120),
  ('حماة', 980), ('اللاذقية', 2100), ('طرطوس', 1680), ('إدلب', 420),
  ('دير الزور', 380), ('الرقة', 290), ('الحسكة', 510),
  ('السويداء', 890), ('درعا', 620), ('القنيطرة', 550)
ON CONFLICT (city) DO NOTHING;

-- ── 7. investor_projects ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investor_projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  title           text NOT NULL,
  city            text,
  type            text,
  target_amount   numeric,
  raised_amount   numeric DEFAULT 0,
  roi_expected    numeric,
  min_investment  numeric DEFAULT 1000,
  duration_months int,
  status          text DEFAULT 'open',
  description     text,
  cover_image     text
);

ALTER TABLE investor_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_read_investor_projects" ON investor_projects
  FOR SELECT USING (true);

CREATE POLICY "admin_manage_investor_projects" ON investor_projects
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── 8. notifications ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL,
  body        text,
  type        text DEFAULT 'system',
  read        boolean DEFAULT false,
  link        text
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "admin_insert_notifications" ON notifications
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR user_id = auth.uid()
  );

-- ── 9. valuation_requests (if not exists) ───────────────────────────
CREATE TABLE IF NOT EXISTS valuation_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  user_id       uuid REFERENCES auth.users(id),
  client_name   text NOT NULL,
  client_email  text,
  client_phone  text,
  city          text,
  district      text,
  area          numeric,
  property_type text,
  floor         text DEFAULT 'mid',
  tier          text DEFAULT 'desktop',
  notes         text,
  status        text DEFAULT 'pending',
  submitted_at  date DEFAULT CURRENT_DATE
);

ALTER TABLE valuation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_own_valuation_req" ON valuation_requests
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "appraiser_read_all" ON valuation_requests
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('appraiser', 'admin')
  );

CREATE POLICY "appraiser_update_status" ON valuation_requests
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('appraiser', 'admin')
  );

CREATE POLICY "anyone_insert_valuation" ON valuation_requests
  FOR INSERT WITH CHECK (true);

-- ── 10. valuation_reports (if not exists) ───────────────────────────
CREATE TABLE IF NOT EXISTS valuation_reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  request_id      uuid REFERENCES valuation_requests(id),
  appraiser_id    uuid REFERENCES auth.users(id),
  client_name     text,
  city            text,
  district        text,
  area            numeric,
  property_type   text,
  baseline_value  numeric,
  adjustments     jsonb,
  final_value     numeric,
  final_low       numeric,
  final_high      numeric,
  currency        text DEFAULT 'USD',
  notes           text,
  tier            text,
  issued_at       date,
  status          text DEFAULT 'certified'
);

ALTER TABLE valuation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appraiser_manage_reports" ON valuation_reports
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('appraiser', 'admin')
  );

CREATE POLICY "user_read_own_report" ON valuation_reports
  FOR SELECT USING (
    request_id IN (
      SELECT id FROM valuation_requests WHERE user_id = auth.uid()
    )
  );
