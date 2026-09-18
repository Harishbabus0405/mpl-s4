-- ============================================================
-- MPL S4 CRICKET TOURNAMENT - SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase project's SQL Editor:
-- Project: https://fwcvbxeyqwvt0jqrhewq.supabase.co
-- ============================================================

-- 1. TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  team_name TEXT NOT NULL,
  owner TEXT,
  initial_points INTEGER DEFAULT 25000,
  remaining_points INTEGER DEFAULT 25000,
  player_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  player_number INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  role TEXT,
  category TEXT,
  status TEXT DEFAULT 'AVAILABLE', -- 'AVAILABLE' | 'DISPLAYED' | 'SOLD' | 'UNSOLD'
  team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
  bought_price INTEGER DEFAULT 0,
  image_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AUCTION STATE TABLE (Singleton row for shared live state)
CREATE TABLE IF NOT EXISTS public.auction_state (
  id TEXT PRIMARY KEY DEFAULT 'current',
  current_player_id TEXT,
  current_player_data JSONB,
  auction_phase TEXT DEFAULT 'HOME', -- 'HOME' | 'MAIN_AUCTION' | 'MAIN_COMPLETED' | 'UNSOLD_ROUND' | 'FINAL_COMPLETED'
  current_status TEXT DEFAULT 'IDLE',
  current_category_key TEXT DEFAULT 'BOWLERS',
  just_sold_player_id TEXT,
  just_sold_team_id TEXT,
  just_sold_price INTEGER,
  main_auction_completed BOOLEAN DEFAULT FALSE,
  unsold_round_started BOOLEAN DEFAULT FALSE,
  auction_completed BOOLEAN DEFAULT FALSE,
  player_statuses JSONB DEFAULT '{}'::jsonb,
  unsold_round_processed JSONB DEFAULT '[]'::jsonb,
  team_assignments JSONB DEFAULT '{}'::jsonb,
  full_snapshot JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AUCTION HISTORY TABLE (Live Sold Player Feed)
CREATE TABLE IF NOT EXISTS public.auction_history (
  id BIGSERIAL PRIMARY KEY,
  player_id TEXT NOT NULL,
  player_number INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  role TEXT,
  team_id TEXT,
  team_name TEXT,
  bought_price INTEGER NOT NULL,
  auction_round TEXT DEFAULT 'MAIN_AUCTION',
  action TEXT DEFAULT 'PURCHASE',
  sold_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INITIAL SEED DATA: 16 MPL S4 FRANCHISES (25,000 PTS EACH)
-- ============================================================
INSERT INTO public.teams (id, team_name, owner, initial_points, remaining_points, player_count)
VALUES
  ('team-1', 'MADATHUR SHINING STARS', 'SURYA', 25000, 25000, 0),
  ('team-2', 'MADATHUR CSK', 'MANI', 25000, 25000, 0),
  ('team-3', 'MADATHUR VEERANS', 'PRASANTH', 25000, 25000, 0),
  ('team-4', 'MADATHUR MI', 'MANIYA', 25000, 25000, 0),
  ('team-5', 'MADATHUR MONSTERS', 'VM', 25000, 25000, 0),
  ('team-6', 'MADATHUR MCC', 'JANAGAN', 25000, 25000, 0),
  ('team-7', 'MADATHUR SUPER KINGS', 'KARTHI', 25000, 25000, 0),
  ('team-8', 'MADATHUR JYMKHANA', 'GOPINATH', 25000, 25000, 0),
  ('team-9', 'MADATHUR GPNCC', 'KENNADY', 25000, 25000, 0),
  ('team-10', 'MADATHUR SYNDICATE', 'BALA', 25000, 25000, 0),
  ('team-11', 'MADATHUR RDX', 'SANJAY Ss', 25000, 25000, 0),
  ('team-12', 'MADATHUR LIONS', 'VARMA', 25000, 25000, 0),
  ('team-13', 'MADATHUR DEFENDERS', 'SUBHASH', 25000, 25000, 0),
  ('team-14', 'MADATHUR BAD EAGLES', 'RAMDASS', 25000, 25000, 0),
  ('team-15', 'MADATHUR A2G', 'RANJITH', 25000, 25000, 0),
  ('team-16', 'MADATHUR CHASERS', 'KAVI', 25000, 25000, 0)
ON CONFLICT (id) DO UPDATE SET
  team_name = EXCLUDED.team_name,
  owner = EXCLUDED.owner;

-- Seed Initial Singleton Auction State
INSERT INTO public.auction_state (id, auction_phase, current_category_key, current_status)
VALUES ('current', 'HOME', 'BOWLERS', 'IDLE')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_history ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy (Public/Anon read access for all viewers)
DROP POLICY IF EXISTS "Public Read Teams" ON public.teams;
CREATE POLICY "Public Read Teams" ON public.teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Players" ON public.players;
CREATE POLICY "Public Read Players" ON public.players FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Auction State" ON public.auction_state;
CREATE POLICY "Public Read Auction State" ON public.auction_state FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Auction History" ON public.auction_history;
CREATE POLICY "Public Read Auction History" ON public.auction_history FOR SELECT USING (true);

-- 2. Write Policies (Allow write operations for auction controllers)
DROP POLICY IF EXISTS "Enable All for Teams" ON public.teams;
CREATE POLICY "Enable All for Teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable All for Players" ON public.players;
CREATE POLICY "Enable All for Players" ON public.players FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable All for Auction State" ON public.auction_state;
CREATE POLICY "Enable All for Auction State" ON public.auction_state FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable All for Auction History" ON public.auction_history;
CREATE POLICY "Enable All for Auction History" ON public.auction_history FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- ENABLE SUPABASE REALTIME REPLICATION
-- ============================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_state;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_history;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
