-- Add submit_count column to draft_applications table
ALTER TABLE draft_applications ADD COLUMN IF NOT EXISTS submit_count INTEGER DEFAULT 0;

-- Update existing records to have submit_count = 1 if status is 'submitted'
UPDATE draft_applications 
SET submit_count = 1 
WHERE status = 'submitted' AND submit_count IS NULL;

-- Update existing records to have submit_count = 0 if status is 'draft'
UPDATE draft_applications 
SET submit_count = 0 
WHERE status = 'draft' AND submit_count IS NULL;
