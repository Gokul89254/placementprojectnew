-- Keep the demo recruiter's companies separate so recruiter views stay company-scoped.
INSERT INTO users (name, email, password_hash, role)
SELECT 'Innovate AI Labs Recruiter', 'innovate@example.com',
       '$2a$10$vvfjWbKo3hHWUjEuztwhCu0c.1CQMZIbzgrHUXgoQLTmqxeC3dNX6', 'recruiter'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'innovate@example.com'
);

UPDATE companies
SET recruiter_id = (SELECT id FROM users WHERE email = 'innovate@example.com')
WHERE company_name = 'Innovate AI Labs'
  AND recruiter_id = (SELECT id FROM users WHERE email = 'recruiter@example.com');

ALTER TABLE companies
ADD CONSTRAINT uq_companies_recruiter UNIQUE (recruiter_id);
