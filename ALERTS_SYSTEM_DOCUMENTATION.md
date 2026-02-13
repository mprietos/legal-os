# Actionable Alerts System - Architecture & Documentation

## Overview

The Actionable Alerts System transforms passive compliance notifications into high-priority, actionable items. The goal is to drive user action (e.g., generating documents) and upsell free users to Pro plans by showing the economic impact of risks and opportunities.

## 1. Data Model

### Alerts Table (`alerts`)

Centralized table for all high-priority items.

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  source_type VARCHAR(50), -- 'compliance', 'grant'
  source_id UUID,
  
  -- Core Data
  title VARCHAR(255),
  description TEXT,
  risk_level VARCHAR(20), -- 'critical', 'high', 'medium', 'low', 'opportunity'
  
  -- Impact
  economic_impact DECIMAL(15,2), -- Potential Fine or Grant Amount
  impact_type VARCHAR(20), -- 'fine_risk', 'potential_income'
  
  -- Timing
  deadline DATE,
  deadline_label VARCHAR(50),
  
  -- ACTION
  cta_action VARCHAR(50),
  cta_target VARCHAR(255), -- Link to resolution
  cta_label VARCHAR(100),
  
  -- Paywall
  is_premium BOOLEAN DEFAULT FALSE,
  teaser_message TEXT
);
```

## 2. Backend Logic (Alerts Engine)

Located in `src/lib/alerts/engine.ts`.

### Prioritization Rules

1.  **Critical Risk**: Severity 'critical' OR Deadline <= 3 days.
    *   *Impact*: ~7,500€ (Fine risk).
    *   *CTA*: "Resolver riesgo ahora".
2.  **High Risk**: Severity 'high' OR Deadline <= 7 days.
    *   *Impact*: ~3,000€.
3.  **Opportunity**: Grant match score > 50%.
    *   *Impact*: Estimated Grant Amount.
    *   *CTA*: "Solicitar ayuda".

### Paywall Strategy

*   **Free Users**: Can see that a "Critical Risk" exists and its potential fine (e.g., "7.500€"), but the specific document generation is locked.
*   **Pro Users**: Can execute the CTA immediately.

## 3. Frontend Architecture

### Components
*   **`AlertsFeed`**: Main component in Dashboard. Fetches `alerts` table.
*   **`PaywallModal`**: Displays when a free user clicks a Premium action.

### Integration
Added to `src/app/dashboard/page.tsx` at the top of the view.

## 4. Automation

*   **Cron Job**: `/api/cron/process-alerts`
*   **Logic**: Scans `company_compliance` and `company_grants` to upsert records into `alerts`.

## 5. Testing & Verification

### Generate Alerts Manually
```bash
curl -X GET http://localhost:3000/api/cron/process-alerts
```

### Flow Verification
1.  **Run Cron**: Ensure alerts appear in Dashboard.
2.  **Check Priority**: Critical items should be at the top with red background.
3.  **Check Paywall**: Clicking a premium alert (locked) should open the modal with the "Potential Value" display.
