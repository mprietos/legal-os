-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  -- Identificación
  cif_nif VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,

  -- Datos inferidos del onboarding
  country VARCHAR(2) NOT NULL, -- ES, MX, AR, etc.
  region VARCHAR(100),
  sector VARCHAR(100) NOT NULL,
  company_size VARCHAR(50) NOT NULL, -- micro, small, medium
  employee_count INTEGER,
  employee_count INTEGER,
  annual_revenue DECIMAL(15,2),
  
  -- Clasificación extendida V2
  cnae_code VARCHAR(10),
  cnae_description VARCHAR(255),

  -- Compliance score
  compliance_score INTEGER DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
  last_score_update TIMESTAMP WITH TIME ZONE,

  -- Subscription
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),

  -- Owner (user_id from Supabase Auth)
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Para gestorías
  managed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Users profile extension
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'company_owner' CHECK (role IN ('company_owner', 'gestor', 'admin')),

  -- Para gestorías
  is_gestor BOOLEAN DEFAULT FALSE,
  gestor_companies UUID[] DEFAULT '{}'
);

-- Compliance requirements catalog
CREATE TABLE compliance_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL, -- labor, tax, data_protection, environmental, etc.
  severity VARCHAR(20) CHECK (severity IN ('critical', 'high', 'medium', 'low')),

  -- Aplicabilidad
  countries VARCHAR(2)[] DEFAULT '{}', -- ['ES', 'MX']
  sectors VARCHAR(100)[] DEFAULT '{}',
  company_sizes VARCHAR(50)[] DEFAULT '{}',

  -- Deadline info
  is_recurring BOOLEAN DEFAULT FALSE,
  frequency VARCHAR(50), -- monthly, quarterly, annual

  -- Guidance
  action_steps JSONB,
  estimated_time INTEGER, -- minutos
  links JSONB
);

-- Company compliance status
CREATE TABLE company_compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  requirement_id UUID REFERENCES compliance_requirements(id) ON DELETE CASCADE NOT NULL,

  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'not_applicable')),
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),

  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,

  notes TEXT,

  UNIQUE(company_id, requirement_id)
);

-- Grants and subsidies catalog
CREATE TABLE grants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  issuer VARCHAR(255) NOT NULL, -- Organismo que convoca

  -- Elegibilidad
  countries VARCHAR(2)[] DEFAULT '{}',
  sectors VARCHAR(100)[] DEFAULT '{}',
  company_sizes VARCHAR(50)[] DEFAULT '{}',
  min_employees INTEGER,
  max_employees INTEGER,
  
  -- Criterios de matching V2
  regions VARCHAR(100)[] DEFAULT '{}', -- Comunidades autónomas / Provincias
  permitted_cnae_codes VARCHAR(10)[] DEFAULT '{}',
  min_revenue DECIMAL(15,2),
  max_revenue DECIMAL(15,2),

  -- Detalles financieros
  max_amount DECIMAL(15,2),
  funding_type VARCHAR(50), -- grant, loan, tax_credit

  -- Plazos
  application_start DATE,
  application_deadline DATE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Requisitos
  requirements JSONB,
  requirements JSONB,
  documents_needed JSONB,
  
  -- Estimación económica V2
  estimation_params JSONB, -- { "base_amount": 5000, "per_employee": 100, "max_cap": 20000 }

  -- Links
  official_url TEXT,
  application_url TEXT
);

-- Company grants matching
CREATE TABLE company_grants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  grant_id UUID REFERENCES grants(id) ON DELETE CASCADE NOT NULL,

  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  status VARCHAR(20) DEFAULT 'opportunity' CHECK (status IN ('opportunity', 'in_progress', 'submitted', 'awarded', 'rejected')),

  applied_at TIMESTAMP WITH TIME ZONE,
  result_date DATE,
  awarded_amount DECIMAL(15,2),

  notes TEXT,

  notes TEXT,
  
  -- Explicabilidad Matching V2
  match_data JSONB, -- { "score_breakdown": [...], "impact_estimation": {...} }

  UNIQUE(company_id, grant_id)
);

-- AI Generated documents
CREATE TABLE generated_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,

  document_type VARCHAR(100) NOT NULL, -- grant_application, compliance_report, policy_document
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,

  -- Metadata
  related_grant_id UUID REFERENCES grants(id) ON DELETE SET NULL,
  related_requirement_id UUID REFERENCES compliance_requirements(id) ON DELETE SET NULL,

  -- AI generation info
  ai_model VARCHAR(50) DEFAULT 'claude-3-5-sonnet',
  generation_prompt TEXT,

  -- Version control
  version INTEGER DEFAULT 1,
  is_final BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_companies_owner ON companies(owner_id);
CREATE INDEX idx_companies_cif ON companies(cif_nif);
CREATE INDEX idx_company_compliance_company ON company_compliance(company_id);
CREATE INDEX idx_company_compliance_status ON company_compliance(status);
CREATE INDEX idx_company_grants_company ON company_grants(company_id);
CREATE INDEX idx_grants_active ON grants(is_active);
CREATE INDEX idx_grants_deadline ON grants(application_deadline);


-- Scoring Rules for Matching Engine V2
CREATE TABLE scoring_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  
  rule_type VARCHAR(50) NOT NULL, -- 'sector_match', 'size_match', 'region_match', 'cnae_match', 'revenue_match'
  weight INTEGER NOT NULL DEFAULT 10,
  config JSONB, -- { "exact_match": true, "multiplier": 1.5 }
  is_active BOOLEAN DEFAULT TRUE,
  description VARCHAR(255)
);

-- Seed basic scoring rules
INSERT INTO scoring_rules (rule_type, weight, description) VALUES
('sector_match', 40, 'Coincidencia de sector industrial'),
('company_size_match', 20, 'Coincidencia de tamaño de empresa'),
('region_match', 15, 'Coincidencia de región/CCAA'),
('cnae_match', 15, 'Coincidencia específica de CNAE'),
('financial_match', 10, 'Compatibilidad financiera');
-- Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users can view their own companies"
  ON companies FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = managed_by);

CREATE POLICY "Users can insert their own companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own companies"
  ON companies FOR UPDATE
  USING (auth.uid() = owner_id OR auth.uid() = managed_by);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for company_compliance
CREATE POLICY "Users can view compliance for their companies"
  ON company_compliance FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid() OR managed_by = auth.uid()
    )
  );

CREATE POLICY "Users can update compliance for their companies"
  ON company_compliance FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid() OR managed_by = auth.uid()
    )
  );

-- RLS Policies for company_grants
CREATE POLICY "Users can view grants for their companies"
  ON company_grants FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid() OR managed_by = auth.uid()
    )
  );

CREATE POLICY "Users can update grants for their companies"
  ON company_grants FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid() OR managed_by = auth.uid()
    )
  );

-- RLS Policies for generated_documents
CREATE POLICY "Users can view documents for their companies"
  ON generated_documents FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid() OR managed_by = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_compliance_updated_at BEFORE UPDATE ON company_compliance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grants_updated_at BEFORE UPDATE ON grants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
