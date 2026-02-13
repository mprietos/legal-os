-- Alerts Table for Actionable Alerts System

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  
  -- Source
  source_type VARCHAR(50) NOT NULL, -- 'compliance', 'grant'
  source_id UUID NOT NULL, -- Reference to company_compliance.id or company_grants.id
  
  -- Alert Properties
  title VARCHAR(255) NOT NULL,
  description TEXT,
  risk_level VARCHAR(20) CHECK (risk_level IN ('critical', 'high', 'medium', 'low', 'opportunity')),
  
  -- Quantifiable Impact
  economic_impact DECIMAL(15,2), -- Amount in EUR
  impact_type VARCHAR(20) CHECK (impact_type IN ('fine_risk', 'potential_income')),
  
  -- Timing
  deadline DATE,
  deadline_label VARCHAR(50),
  
  -- Action / CTA
  cta_action VARCHAR(50) NOT NULL,
  cta_target VARCHAR(255) NOT NULL,
  cta_label VARCHAR(100) NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'resolved', 'in_progress')),
  
  -- Paywall / Upsell
  is_premium BOOLEAN DEFAULT FALSE,
  teaser_message TEXT,
  
  UNIQUE(company_id, source_type, source_id)
);

-- Indexes
CREATE INDEX idx_alerts_company ON alerts(company_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_risk ON alerts(risk_level);

-- RLS Policies
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts for their companies"
  ON alerts FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid() OR managed_by = auth.uid()
    )
  );

CREATE POLICY "Users can update alerts for their companies"
  ON alerts FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid() OR managed_by = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
