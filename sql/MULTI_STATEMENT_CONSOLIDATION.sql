-- MULTI-STATEMENT CONSOLIDATION SYSTEM
-- Enables banks to upload multiple statements and get consolidated analysis

-- Statement Groups Table - Groups multiple statements together
CREATE TABLE IF NOT EXISTS statement_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_name VARCHAR(255) NOT NULL,
  group_type VARCHAR(50) NOT NULL CHECK (group_type IN ('single_account', 'multi_account', 'loan_application')),
  reference_id VARCHAR(100) UNIQUE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  total_statements INTEGER DEFAULT 0,
  total_accounts INTEGER DEFAULT 0,
  consolidated_balance DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to analysis_jobs if they don't exist
DO $$
BEGIN
  -- Check if analysis_jobs table exists first
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analysis_jobs' AND table_schema = 'public') THEN

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analysis_jobs' AND column_name = 'statement_group_id') THEN
      ALTER TABLE analysis_jobs ADD COLUMN statement_group_id UUID REFERENCES statement_groups(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analysis_jobs' AND column_name = 'application_id') THEN
      ALTER TABLE analysis_jobs ADD COLUMN application_id UUID;
      -- Add foreign key constraint only if loan_applications table exists
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loan_applications' AND table_schema = 'public') THEN
        ALTER TABLE analysis_jobs ADD CONSTRAINT fk_analysis_jobs_application_id
        FOREIGN KEY (application_id) REFERENCES loan_applications(id) ON DELETE CASCADE;
      END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analysis_jobs' AND column_name = 'statement_period_start') THEN
      ALTER TABLE analysis_jobs ADD COLUMN statement_period_start DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analysis_jobs' AND column_name = 'statement_period_end') THEN
      ALTER TABLE analysis_jobs ADD COLUMN statement_period_end DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analysis_jobs' AND column_name = 'password_hash') THEN
      ALTER TABLE analysis_jobs ADD COLUMN password_hash TEXT;
    END IF;

  END IF;
END $$;

-- Statement Group Members - Links individual analysis jobs to groups
CREATE TABLE IF NOT EXISTS statement_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES statement_groups(id) ON DELETE CASCADE,
  analysis_job_id UUID NOT NULL REFERENCES analysis_jobs(id) ON DELETE CASCADE,
  account_identifier VARCHAR(255), -- Account number or unique identifier
  bank_name VARCHAR(100),
  account_type VARCHAR(50), -- 'savings', 'current', 'salary', etc.
  statement_period_start DATE,
  statement_period_end DATE,
  opening_balance DECIMAL(15,2),
  closing_balance DECIMAL(15,2),
  is_primary_account BOOLEAN DEFAULT false,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, analysis_job_id)
);

-- Consolidated Analysis Results
CREATE TABLE IF NOT EXISTS consolidated_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES statement_groups(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50) NOT NULL, -- 'financial_summary', 'foir', 'fraud', 'behavior'
  result_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, analysis_type)
);

-- Cross-Verification Results
CREATE TABLE IF NOT EXISTS cross_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES statement_groups(id) ON DELETE CASCADE,
  verification_type VARCHAR(100) NOT NULL, -- 'balance_continuity', 'income_consistency', 'duplicate_detection'
  status VARCHAR(50) NOT NULL CHECK (status IN ('passed', 'warning', 'failed')),
  details JSONB,
  severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consolidated Metrics Cache
CREATE TABLE IF NOT EXISTS consolidated_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES statement_groups(id) ON DELETE CASCADE,
  metric_type VARCHAR(100) NOT NULL,
  metric_value JSONB NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE(group_id, metric_type)
);

-- Row Level Security Policies
ALTER TABLE statement_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE statement_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidated_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidated_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for statement_groups
CREATE POLICY "Users can view their own statement groups" ON statement_groups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own statement groups" ON statement_groups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statement groups" ON statement_groups
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for statement_group_members
CREATE POLICY "Users can view members of their groups" ON statement_group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM statement_groups
      WHERE id = group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add members to their groups" ON statement_group_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM statement_groups
      WHERE id = group_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for consolidated data
CREATE POLICY "Users can view consolidated data for their groups" ON consolidated_analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM statement_groups
      WHERE id = group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view cross-verifications for their groups" ON cross_verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM statement_groups
      WHERE id = group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view consolidated metrics for their groups" ON consolidated_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM statement_groups
      WHERE id = group_id AND user_id = auth.uid()
    )
  );

-- Indexes for Performance
CREATE INDEX idx_statement_groups_user_id ON statement_groups(user_id);
CREATE INDEX idx_statement_groups_status ON statement_groups(status);
CREATE INDEX idx_statement_groups_reference_id ON statement_groups(reference_id);

CREATE INDEX idx_statement_group_members_group_id ON statement_group_members(group_id);
CREATE INDEX idx_statement_group_members_job_id ON statement_group_members(analysis_job_id);
CREATE INDEX idx_statement_group_members_account ON statement_group_members(account_identifier);

CREATE INDEX idx_consolidated_analyses_group_type ON consolidated_analyses(group_id, analysis_type);
CREATE INDEX idx_cross_verifications_group_status ON cross_verifications(group_id, status);
CREATE INDEX idx_consolidated_metrics_group_type ON consolidated_metrics(group_id, metric_type, expires_at);

-- Functions for Consolidated Analysis

-- Function to calculate consolidated financial metrics
CREATE OR REPLACE FUNCTION calculate_consolidated_financials(group_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  total_income DECIMAL(15,2) := 0;
  total_expenses DECIMAL(15,2) := 0;
  total_balance DECIMAL(15,2) := 0;
  account_count INTEGER := 0;
BEGIN
  -- Calculate totals across all statements in the group
  SELECT
    COALESCE(SUM((metadata->>'totalIncome')::DECIMAL), 0),
    COALESCE(SUM((metadata->>'totalExpenses')::DECIMAL), 0),
    COUNT(DISTINCT sgm.account_identifier)
  INTO total_income, total_expenses, account_count
  FROM statement_group_members sgm
  JOIN analysis_jobs aj ON sgm.analysis_job_id = aj.id
  WHERE sgm.group_id = group_id_param AND aj.status = 'completed';

  -- Calculate total balance from latest statements
  SELECT COALESCE(SUM(sgm.closing_balance), 0)
  INTO total_balance
  FROM statement_group_members sgm
  WHERE sgm.group_id = group_id_param;

  result := jsonb_build_object(
    'totalIncome', total_income,
    'totalExpenses', total_expenses,
    'netCashFlow', total_income - total_expenses,
    'totalBalance', total_balance,
    'accountCount', account_count,
    'averageMonthlyIncome', total_income / GREATEST(account_count, 1),
    'savingsRate', CASE WHEN total_income > 0 THEN ((total_income - total_expenses) / total_income * 100) ELSE 0 END
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check balance continuity
CREATE OR REPLACE FUNCTION check_balance_continuity(group_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '[]'::jsonb;
  prev_balance DECIMAL(15,2);
  curr_row RECORD;
BEGIN
  -- Check balance continuity between consecutive statements
  FOR curr_row IN
    SELECT
      sgm.account_identifier,
      sgm.statement_period_end,
      sgm.closing_balance,
      LAG(sgm.closing_balance) OVER (
        PARTITION BY sgm.account_identifier
        ORDER BY sgm.statement_period_end
      ) as prev_balance
    FROM statement_group_members sgm
    WHERE sgm.group_id = group_id_param
    ORDER BY sgm.account_identifier, sgm.statement_period_end
  LOOP
    IF curr_row.prev_balance IS NOT NULL AND ABS(curr_row.prev_balance - curr_row.closing_balance) > 100 THEN
      result := result || jsonb_build_object(
        'account', curr_row.account_identifier,
        'date', curr_row.statement_period_end,
        'expectedBalance', curr_row.prev_balance,
        'actualBalance', curr_row.closing_balance,
        'discrepancy', curr_row.closing_balance - curr_row.prev_balance,
        'severity', CASE WHEN ABS(curr_row.closing_balance - curr_row.prev_balance) > 1000 THEN 'high' ELSE 'medium' END
      );
    END IF;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect duplicate income sources
CREATE OR REPLACE FUNCTION detect_duplicate_income(group_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '[]'::jsonb;
  income_sources JSONB;
BEGIN
  -- Aggregate income sources across all accounts
  SELECT jsonb_object_agg(
    COALESCE(bank_name, 'Unknown'),
    jsonb_build_object('totalCredits', SUM(total_credits), 'accountCount', COUNT(*))
  )
  INTO income_sources
  FROM (
    SELECT
      aj.metadata->>'bankName' as bank_name,
      (aj.metadata->>'totalIncome')::DECIMAL as total_credits
    FROM statement_group_members sgm
    JOIN analysis_jobs aj ON sgm.analysis_job_id = aj.id
    WHERE sgm.group_id = group_id_param AND aj.status = 'completed'
  ) sub;

  -- Flag potential duplicate income if multiple accounts show similar income amounts
  SELECT jsonb_agg(
    jsonb_build_object(
      'bank', key,
      'amount', value->>'totalCredits',
      'accounts', value->>'accountCount',
      'risk', CASE WHEN (value->>'accountCount')::INTEGER > 1 THEN 'high' ELSE 'low' END
    )
  )
  INTO result
  FROM jsonb_object_keys(income_sources) AS k(key)
  CROSS JOIN jsonb_object_values(income_sources) AS v(value)
  WHERE (value->>'totalCredits')::DECIMAL > 50000; -- High income threshold

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update statement group totals
CREATE OR REPLACE FUNCTION update_statement_group_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE statement_groups
  SET
    total_statements = (
      SELECT COUNT(*) FROM statement_group_members WHERE group_id = COALESCE(NEW.group_id, OLD.group_id)
    ),
    total_accounts = (
      SELECT COUNT(DISTINCT account_identifier) FROM statement_group_members WHERE group_id = COALESCE(NEW.group_id, OLD.group_id)
    ),
    consolidated_balance = (
      SELECT COALESCE(SUM(closing_balance), 0) FROM statement_group_members WHERE group_id = COALESCE(NEW.group_id, OLD.group_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.group_id, OLD.group_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_statement_group_totals
  AFTER INSERT OR UPDATE OR DELETE ON statement_group_members
  FOR EACH ROW EXECUTE FUNCTION update_statement_group_totals();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON statement_groups TO authenticated;
GRANT ALL ON statement_group_members TO authenticated;
GRANT ALL ON consolidated_analyses TO authenticated;
GRANT ALL ON cross_verifications TO authenticated;
GRANT ALL ON consolidated_metrics TO authenticated;

-- Grant function execution permissions
GRANT EXECUTE ON FUNCTION calculate_consolidated_financials(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_balance_continuity(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_duplicate_income(UUID) TO authenticated;