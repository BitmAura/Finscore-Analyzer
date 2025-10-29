-- ============================================
-- BANKING & NBFC CRITICAL FEATURES SCHEMA
-- ============================================
-- Additional tables for real-world loan processing
-- Run AFTER FINAL_PRODUCTION_SCHEMA.sql
-- ============================================

-- ============================================
-- APPLICANT MANAGEMENT
-- ============================================

-- Loan Applications Table
CREATE TABLE IF NOT EXISTS public.loan_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Loan officer/bank user

    -- Application Details
    application_number TEXT UNIQUE NOT NULL DEFAULT ('LN-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 10))),
    loan_type TEXT NOT NULL CHECK (loan_type IN ('home', 'personal', 'auto', 'business', 'education', 'gold', 'loan-against-property', 'working-capital', 'other')),
    loan_amount NUMERIC(15,2) NOT NULL,
    loan_tenure INTEGER, -- in months
    loan_purpose TEXT,

    -- Status Workflow
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'documents-pending', 'under-review', 'verification', 'approved', 'rejected', 'disbursed', 'closed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

    -- Timestamps
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    decision_at TIMESTAMPTZ,
    disbursed_at TIMESTAMPTZ,

    -- Decision
    approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected', 'conditional')),
    approved_amount NUMERIC(15,2),
    approved_tenure INTEGER,
    interest_rate NUMERIC(5,2),
    rejection_reason TEXT,
    conditions TEXT[],

    -- Metadata
    notes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applicants Table (Main applicant details)
CREATE TABLE IF NOT EXISTS public.applicants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,

    -- Personal Details
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),

    -- Identity
    pan_number TEXT UNIQUE,
    aadhaar_number TEXT,
    passport_number TEXT,
    driving_license TEXT,
    voter_id TEXT,

    -- Contact
    email TEXT,
    phone TEXT NOT NULL,
    alternate_phone TEXT,

    -- Address
    current_address TEXT NOT NULL,
    permanent_address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    residence_type TEXT CHECK (residence_type IN ('owned', 'rented', 'parental', 'company-provided')),
    years_at_current_address INTEGER,

    -- Employment
    employment_type TEXT CHECK (employment_type IN ('salaried', 'self-employed', 'business', 'professional', 'retired', 'unemployed')),
    employer_name TEXT,
    employer_type TEXT CHECK (employer_type IN ('mnc', 'psu', 'private', 'government', 'startup', 'sme')),
    designation TEXT,
    years_with_employer NUMERIC(4,1),
    total_experience NUMERIC(4,1),
    monthly_income NUMERIC(15,2),
    other_income NUMERIC(15,2),

    -- Business (for self-employed)
    business_name TEXT,
    business_type TEXT,
    business_vintage INTEGER, -- in years
    annual_turnover NUMERIC(15,2),

    -- Banking
    primary_bank TEXT,
    salary_account_bank TEXT,

    -- Verification Status
    pan_verified BOOLEAN DEFAULT false,
    aadhaar_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    employment_verified BOOLEAN DEFAULT false,

    -- Flags
    is_primary BOOLEAN DEFAULT true,
    existing_customer BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Co-Applicants Table (Joint applications)
CREATE TABLE IF NOT EXISTS public.co_applicants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,

    -- Personal Details (same as applicants)
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    relationship_with_applicant TEXT CHECK (relationship_with_applicant IN ('spouse', 'parent', 'sibling', 'child', 'business-partner', 'other')),

    -- Identity
    pan_number TEXT UNIQUE,
    aadhaar_number TEXT,

    -- Contact
    email TEXT,
    phone TEXT NOT NULL,

    -- Employment
    employment_type TEXT,
    employer_name TEXT,
    monthly_income NUMERIC(15,2),

    -- Flags
    contributing_to_loan BOOLEAN DEFAULT true,
    pan_verified BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guarantors Table
CREATE TABLE IF NOT EXISTS public.guarantors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,

    full_name TEXT NOT NULL,
    relationship_with_applicant TEXT,
    pan_number TEXT,
    aadhaar_number TEXT,
    phone TEXT NOT NULL,
    email TEXT,

    -- Financial Standing
    monthly_income NUMERIC(15,2),
    net_worth NUMERIC(15,2),

    pan_verified BOOLEAN DEFAULT false,
    consent_given BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MULTI-STATEMENT MANAGEMENT
-- ============================================

-- Statement Groups (Consolidate multiple statements for one applicant)
CREATE TABLE IF NOT EXISTS public.statement_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES public.applicants(id) ON DELETE CASCADE,

    group_name TEXT NOT NULL, -- e.g., "HDFC Salary Account - 6 Months"
    group_type TEXT CHECK (group_type IN ('same-account-multiple-periods', 'multiple-accounts', 'co-applicant', 'guarantor')),

    -- Consolidated Analysis
    total_statements INTEGER DEFAULT 0,
    date_range_start DATE,
    date_range_end DATE,
    total_months_covered INTEGER,

    -- Consolidated Metrics
    consolidated_analysis JSONB DEFAULT '{}'::jsonb,
    cross_verification_status TEXT DEFAULT 'pending' CHECK (cross_verification_status IN ('pending', 'verified', 'discrepancy-found', 'failed')),
    discrepancies JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link analysis_jobs to statement_groups
ALTER TABLE public.analysis_jobs
ADD COLUMN IF NOT EXISTS statement_group_id UUID REFERENCES public.statement_groups(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS statement_period_start DATE,
ADD COLUMN IF NOT EXISTS statement_period_end DATE,
ADD COLUMN IF NOT EXISTS password_hash TEXT; -- For password-protected PDFs (one-way hash for security)

-- ============================================
-- INCOME VERIFICATION
-- ============================================

CREATE TABLE IF NOT EXISTS public.income_verification (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
    analysis_job_id UUID REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,

    -- Salary Analysis (for salaried)
    employer_name_detected TEXT,
    salary_account BOOLEAN DEFAULT false,
    salary_day INTEGER, -- Day of month salary credited
    salary_credits JSONB DEFAULT '[]'::jsonb, -- Last 6-12 months
    average_salary NUMERIC(15,2),
    salary_consistency_score INTEGER, -- 0-100
    salary_trend TEXT CHECK (salary_trend IN ('increasing', 'stable', 'decreasing', 'irregular')),

    -- Income Stability
    income_sources_count INTEGER,
    primary_income_percentage NUMERIC(5,2),
    income_diversification_score INTEGER, -- 0-100

    -- Verification
    declared_income NUMERIC(15,2), -- From application form
    bank_detected_income NUMERIC(15,2),
    income_variance NUMERIC(5,2), -- Percentage difference
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'mismatch', 'suspicious')),

    -- Red Flags
    red_flags JSONB DEFAULT '[]'::jsonb,
    suspicion_score INTEGER DEFAULT 0, -- 0-100

    -- Self-employed specific
    monthly_credits JSONB DEFAULT '[]'::jsonb,
    business_transactions_count INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FOIR & OBLIGATION TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS public.foir_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,

    -- Income
    average_monthly_income NUMERIC(15,2) NOT NULL,
    other_income NUMERIC(15,2) DEFAULT 0,
    total_monthly_income NUMERIC(15,2) NOT NULL,

    -- Existing Obligations
    home_loan_emi NUMERIC(15,2) DEFAULT 0,
    personal_loan_emi NUMERIC(15,2) DEFAULT 0,
    auto_loan_emi NUMERIC(15,2) DEFAULT 0,
    credit_card_payments NUMERIC(15,2) DEFAULT 0,
    other_emis NUMERIC(15,2) DEFAULT 0,
    total_obligations NUMERIC(15,2) NOT NULL,

    -- FOIR Calculation
    foir NUMERIC(5,2) NOT NULL, -- Fixed Obligation to Income Ratio (percentage)
    foir_status TEXT CHECK (foir_status IN ('excellent', 'good', 'borderline', 'high-risk', 'unacceptable')),

    -- Loan Eligibility
    max_eligible_emi NUMERIC(15,2), -- Based on FOIR < 50%
    max_loan_amount NUMERIC(15,2), -- Calculated based on tenure and rate

    -- Existing Loans Detected
    existing_loans JSONB DEFAULT '[]'::jsonb,

    -- Recommendations
    recommendations TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FRAUD DETECTION ADVANCED
-- ============================================

CREATE TABLE IF NOT EXISTS public.fraud_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_job_id UUID NOT NULL REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,

    -- Statement Tampering Detection
    balance_continuity_check BOOLEAN DEFAULT true,
    balance_mismatch_count INTEGER DEFAULT 0,
    transaction_gaps_detected JSONB DEFAULT '[]'::jsonb,
    calculation_errors INTEGER DEFAULT 0,

    -- PDF Analysis
    pdf_metadata JSONB DEFAULT '{}'::jsonb,
    pdf_creation_date TIMESTAMPTZ,
    pdf_modification_date TIMESTAMPTZ,
    pdf_software TEXT,
    metadata_suspicious BOOLEAN DEFAULT false,

    -- Income Manipulation
    circular_transactions JSONB DEFAULT '[]'::jsonb,
    cash_inflation_detected BOOLEAN DEFAULT false,
    cash_deposit_ratio NUMERIC(5,2),
    temporary_credits JSONB DEFAULT '[]'::jsonb,
    friends_family_transfers_count INTEGER DEFAULT 0,

    -- High-Risk Activities
    loan_stacking_detected BOOLEAN DEFAULT false,
    nbfc_lenders JSONB DEFAULT '[]'::jsonb,
    payday_loan_usage BOOLEAN DEFAULT false,
    p2p_lending_detected BOOLEAN DEFAULT false,
    crypto_trading_detected BOOLEAN DEFAULT false,
    gambling_transactions JSONB DEFAULT '[]'::jsonb,

    -- Forgery Detection
    duplicate_statement BOOLEAN DEFAULT false,
    invalid_bank_format BOOLEAN DEFAULT false,
    signature_mismatch BOOLEAN DEFAULT false,

    -- Overall Score
    fraud_score INTEGER NOT NULL DEFAULT 0, -- 0-100
    fraud_level TEXT CHECK (fraud_level IN ('no-risk', 'low', 'medium', 'high', 'confirmed-fraud')),

    -- Evidence
    fraud_evidences JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BANKING BEHAVIOR SCORE
-- ============================================

CREATE TABLE IF NOT EXISTS public.banking_behavior (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_job_id UUID NOT NULL REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,

    -- Account Vintage
    first_transaction_date DATE,
    last_transaction_date DATE,
    account_age_months INTEGER,
    account_age_status TEXT CHECK (account_age_status IN ('new', 'regular', 'mature', 'legacy')),
    meets_minimum_age BOOLEAN, -- 6 months minimum

    -- Balance Behavior
    average_monthly_balance NUMERIC(15,2),
    minimum_balance_maintained BOOLEAN,
    days_with_zero_balance INTEGER,
    below_minimum_count INTEGER,

    -- Transaction Patterns
    total_transactions INTEGER,
    digital_transaction_ratio NUMERIC(5,2), -- UPI/NEFT vs cash
    international_transactions INTEGER,
    overdraft_usage_count INTEGER,

    -- Cheque Management
    inward_cheque_returns INTEGER,
    outward_cheque_returns INTEGER,
    cheque_return_charges NUMERIC(15,2),

    -- Financial Discipline
    insurance_premiums_paid BOOLEAN,
    sip_investments BOOLEAN,
    regular_savings BOOLEAN,

    -- Banking Behavior Score
    behavior_score INTEGER NOT NULL, -- 0-100
    behavior_rating TEXT CHECK (behavior_rating IN ('excellent', 'good', 'average', 'poor', 'very-poor')),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMPLOYER VERIFICATION DATABASE
-- ============================================

CREATE TABLE IF NOT EXISTS public.approved_employers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    employer_name TEXT NOT NULL UNIQUE,
    employer_category TEXT CHECK (employer_category IN ('mnc', 'psu', 'private-listed', 'private-unlisted', 'government', 'startup', 'sme', 'unknown')),
    industry TEXT,

    -- Risk Rating
    risk_rating TEXT CHECK (risk_rating IN ('low', 'medium', 'high')),
    approved_for_lending BOOLEAN DEFAULT true,

    -- Verification
    verified_by TEXT,
    verification_date DATE,

    -- Additional Info
    employee_count INTEGER,
    founded_year INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_loan_applications_user ON public.loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON public.loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_applicants_application ON public.applicants(application_id);
CREATE INDEX IF NOT EXISTS idx_applicants_pan ON public.applicants(pan_number);
CREATE INDEX IF NOT EXISTS idx_statement_groups_application ON public.statement_groups(application_id);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_group ON public.analysis_jobs(statement_group_id);
CREATE INDEX IF NOT EXISTS idx_income_verification_application ON public.income_verification(application_id);
CREATE INDEX IF NOT EXISTS idx_foir_application ON public.foir_analysis(application_id);
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_job ON public.fraud_analysis(analysis_job_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.co_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statement_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foir_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banking_behavior ENABLE ROW LEVEL SECURITY;

-- Loan Applications: Users can only see their own
DROP POLICY IF EXISTS "Users can view own loan applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Users can create loan applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Users can update own loan applications" ON public.loan_applications;

CREATE POLICY "Users can view own loan applications"
    ON public.loan_applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create loan applications"
    ON public.loan_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loan applications"
    ON public.loan_applications FOR UPDATE
    USING (auth.uid() = user_id);

-- Applicants: Cascade from loan_applications
CREATE POLICY "Users can view applicants for their applications"
    ON public.applicants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.loan_applications
            WHERE id = applicants.application_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert applicants"
    ON public.applicants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.loan_applications
            WHERE id = applicants.application_id AND user_id = auth.uid()
        )
    );

-- Similar policies for other tables...
CREATE POLICY "Users can view own co-applicants"
    ON public.co_applicants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.loan_applications
            WHERE id = co_applicants.application_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own statement groups"
    ON public.statement_groups FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.loan_applications
            WHERE id = statement_groups.application_id AND user_id = auth.uid()
        )
    );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON public.loan_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applicants_updated_at BEFORE UPDATE ON public.applicants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statement_groups_updated_at BEFORE UPDATE ON public.statement_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETED ✅
-- ============================================

