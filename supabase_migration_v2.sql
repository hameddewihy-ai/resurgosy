-- ═══════════════════════════════════════════════════════════════════════════
-- RESURGO PropTech — Supabase Migration v2
-- Run this entire script in your Supabase SQL Editor (project > SQL Editor)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. profiles — extended user metadata ────────────────────────────────────
create table if not exists public.profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  full_name               text,
  phone                   text,
  province                text,
  national_id             text,
  company_name            text,
  commercial_register_no  text,
  professional_license_no text,
  specialty               text,
  country_of_residence    text,
  investment_range        text,
  department              text,
  employee_id             text,
  updated_at              timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- ── 2. saved_properties — user bookmarks ────────────────────────────────────
create table if not exists public.saved_properties (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  property_id text not null,
  saved_at    timestamptz default now(),
  unique(user_id, property_id)
);
alter table public.saved_properties enable row level security;
create policy "saved_own" on public.saved_properties for all using (auth.uid() = user_id);

-- ── 3. inquiries — property contact messages ─────────────────────────────────
create table if not exists public.inquiries (
  id             uuid primary key default gen_random_uuid(),
  sender_id      uuid references auth.users(id) on delete cascade not null,
  owner_id       uuid references auth.users(id) on delete set null,
  property_id    text,
  property_title text,
  property_img   text,
  owner_name     text,
  sender_name    text,
  sender_phone   text,
  message        text not null,
  status         text default 'جديد',
  created_at     timestamptz default now()
);
alter table public.inquiries enable row level security;
create policy "inquiries_sender_select" on public.inquiries for select using (auth.uid() = sender_id);
create policy "inquiries_owner_select"  on public.inquiries for select using (auth.uid() = owner_id);
create policy "inquiries_insert"        on public.inquiries for insert with check (auth.uid() = sender_id);
create policy "inquiries_owner_update"  on public.inquiries for update using (auth.uid() = owner_id);

-- ── 4. equipment — contractor machinery listings ─────────────────────────────
create table if not exists public.equipment (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid references auth.users(id) on delete cascade not null,
  name            text not null,
  brand           text,
  model           text,
  category        text,
  city            text,
  provider        text,
  rate            numeric(14,2),
  wet_rate        numeric(14,2),
  pricing_unit    text default 'day',
  fuel_included   boolean default false,
  transport       text default 'separate',
  transport_cost  numeric(14,2) default 0,
  dry_available   boolean default true,
  wet_available   boolean default false,
  hire_type       text default 'wet',
  available       boolean default true,
  condition_score int check (condition_score between 1 and 5) default 3,
  images          text[],
  attachments     jsonb default '[]',
  created_at      timestamptz default now()
);
alter table public.equipment enable row level security;
create policy "equipment_owner_all"     on public.equipment for all    using (auth.uid() = owner_id);
create policy "equipment_public_select" on public.equipment for select using (available = true);

-- ── 5. finishing_rfqs — requests for quotation ───────────────────────────────
create table if not exists public.finishing_rfqs (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid references auth.users(id) on delete cascade not null,
  client_name    text,
  city           text,
  district       text,
  area           numeric(10,2),
  services       text[],
  budget         text,
  property_state text,
  description    text,
  urgent         boolean default false,
  status         text default 'جديد',
  created_at     timestamptz default now()
);
alter table public.finishing_rfqs enable row level security;
create policy "rfq_client_all"    on public.finishing_rfqs for all    using (auth.uid() = client_id);
create policy "rfq_public_select" on public.finishing_rfqs for select using (status = 'جديد');

-- ── 6. finishing_bids — bids submitted by finishing companies ────────────────
create table if not exists public.finishing_bids (
  id             uuid primary key default gen_random_uuid(),
  rfq_id         uuid references public.finishing_rfqs(id) on delete cascade not null,
  company_id     uuid references auth.users(id) on delete cascade not null,
  company_name   text,
  price          numeric(15,2),
  duration_weeks int,
  notes          text,
  status         text default 'pending',
  created_at     timestamptz default now()
);
alter table public.finishing_bids enable row level security;
create policy "bids_company_all"   on public.finishing_bids for all    using (auth.uid() = company_id);
create policy "bids_rfq_owner_sel" on public.finishing_bids for select
  using (exists (select 1 from public.finishing_rfqs where id = rfq_id and client_id = auth.uid()));

-- ── 7. wallet_transactions — financial ledger ────────────────────────────────
-- Balance is always computed from this table (sum of amounts). No separate
-- wallets balance table — this is the source of truth.
create table if not exists public.wallet_transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  type       text not null,              -- deposit | withdrawal | escrow_hold | release | earning
  title      text,
  category   text,
  project_id text,
  amount     numeric(15,2) not null,    -- positive = in, negative = out
  status     text default 'completed',  -- completed | pending
  details    jsonb,
  created_at timestamptz default now()
);
alter table public.wallet_transactions enable row level security;
create policy "wallet_txn_own" on public.wallet_transactions for all using (auth.uid() = user_id);

-- ── 8. investments — crowdfunding investment records ────────────────────────
create table if not exists public.investments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  project_id  text not null,
  amount      numeric(15,2) not null,
  shares      numeric(12,4),
  share_price numeric(15,2),
  status      text default 'escrow',   -- escrow | active | completed
  locked      boolean default true,
  created_at  timestamptz default now()
);
alter table public.investments enable row level security;
create policy "investments_own" on public.investments for all using (auth.uid() = user_id);

-- ── 9. job_applications — career applications ───────────────────────────────
create table if not exists public.job_applications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  job_id     text,
  title      text,
  company    text,
  status     text default 'قيد المراجعة',
  created_at timestamptz default now()
);
alter table public.job_applications enable row level security;
create policy "job_apps_own" on public.job_applications for all using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- Done. 9 tables created with Row Level Security enabled.
-- ═══════════════════════════════════════════════════════════════════════════
