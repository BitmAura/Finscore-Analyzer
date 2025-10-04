-- user_dashboard_stats
CREATE TABLE IF NOT EXISTS user_dashboard_stats (
  user_id uuid PRIMARY KEY,
  total_analyses integer DEFAULT 0,
  this_month integer DEFAULT 0,
  processing_queue integer DEFAULT 0,
  avg_processing_time text DEFAULT '0 min',
  system_health float DEFAULT 98.5,
  storage_used integer DEFAULT 0,
  active_users integer DEFAULT 1,
  risk_alerts_count integer DEFAULT 0
);

-- user_activities
CREATE TABLE IF NOT EXISTS user_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text,
  description text,
  created_at timestamptz DEFAULT now(),
  status text
);

-- analysis_jobs
CREATE TABLE IF NOT EXISTS analysis_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text,
  document_name text
);

