ALTER TABLE job_postings
ADD COLUMN expected_package DECIMAL(12,2) NULL
CHECK (expected_package IS NULL OR expected_package >= 0.00);
