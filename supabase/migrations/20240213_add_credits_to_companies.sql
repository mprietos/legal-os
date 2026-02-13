-- Add credits column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 3;

-- Optional: Update existing free companies to have 3 credits if they were created before this column
UPDATE companies SET credits = 3 WHERE plan = 'free' AND (credits IS NULL OR credits > 3);
