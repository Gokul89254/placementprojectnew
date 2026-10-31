SET @job_status_check_name = (
  SELECT tc.CONSTRAINT_NAME
  FROM information_schema.TABLE_CONSTRAINTS tc
  JOIN information_schema.CHECK_CONSTRAINTS cc
    ON tc.CONSTRAINT_SCHEMA = cc.CONSTRAINT_SCHEMA
   AND tc.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
  WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
    AND tc.TABLE_NAME = 'job_postings'
    AND tc.CONSTRAINT_TYPE = 'CHECK'
    AND LOWER(cc.CHECK_CLAUSE) LIKE '%status%'
    AND LOWER(cc.CHECK_CLAUSE) LIKE '%pending%'
    AND LOWER(cc.CHECK_CLAUSE) LIKE '%approved%'
  LIMIT 1
);
SET @drop_job_status_check = IF(
  @job_status_check_name IS NULL,
  'SELECT 1',
  CONCAT('ALTER TABLE job_postings DROP CHECK `', REPLACE(@job_status_check_name, '`', '``'), '`')
);
PREPARE drop_job_status_check FROM @drop_job_status_check;
EXECUTE drop_job_status_check;
DEALLOCATE PREPARE drop_job_status_check;
ALTER TABLE job_postings MODIFY status VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE job_postings
  ADD CONSTRAINT chk_job_postings_status
  CHECK (status IN ('pending', 'approved', 'rejected', 'closed'));
