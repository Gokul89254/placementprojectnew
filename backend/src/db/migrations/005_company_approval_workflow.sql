SET @company_status_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'companies'
    AND column_name = 'status'
);
SET @add_company_status_column = IF(
  @company_status_column_exists = 0,
  'ALTER TABLE companies ADD COLUMN status VARCHAR(20) NULL',
  'SELECT 1'
);
PREPARE add_company_status_column FROM @add_company_status_column;
EXECUTE add_company_status_column;
DEALLOCATE PREPARE add_company_status_column;
UPDATE companies SET status = 'approved' WHERE status IS NULL;
ALTER TABLE companies
  MODIFY status VARCHAR(20) NOT NULL DEFAULT 'pending';
SET @company_status_check_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE table_schema = DATABASE()
    AND table_name = 'companies'
    AND constraint_name = 'chk_companies_status'
    AND constraint_type = 'CHECK'
);
SET @add_company_status_check = IF(
  @company_status_check_exists = 0,
  'ALTER TABLE companies ADD CONSTRAINT chk_companies_status CHECK (status IN (''pending'', ''approved'', ''rejected''))',
  'SELECT 1'
);
PREPARE add_company_status_check FROM @add_company_status_check;
EXECUTE add_company_status_check;
DEALLOCATE PREPARE add_company_status_check;
