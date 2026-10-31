-- Placemate MySQL Seed Data
-- Demo Credentials:
-- Major admin: gokulravi89254@gmail.com / Password123
-- Recruiter: recruiter@example.com / Password123
-- Student: student@example.com / Password123

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE applications;
TRUNCATE TABLE job_required_skills;
TRUNCATE TABLE job_postings;
TRUNCATE TABLE companies;
TRUNCATE TABLE student_skills;
TRUNCATE TABLE students;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Hash for 'Password123': $2a$10$vvfjWbKo3hHWUjEuztwhCu0c.1CQMZIbzgrHUXgoQLTmqxeC3dNX6

-- 1. SEED USERS
INSERT INTO users (name, email, password_hash, role) VALUES
('System Administrator', 'gokulravi89254@gmail.com', '$2a$10$vvfjWbKo3hHWUjEuztwhCu0c.1CQMZIbzgrHUXgoQLTmqxeC3dNX6', 'admin'),
('Sarah Jenkins (Recruiter)', 'recruiter@example.com', '$2a$10$vvfjWbKo3hHWUjEuztwhCu0c.1CQMZIbzgrHUXgoQLTmqxeC3dNX6', 'recruiter'),
('David Miller (Recruiter)', 'techcorp@example.com', '$2a$10$vvfjWbKo3hHWUjEuztwhCu0c.1CQMZIbzgrHUXgoQLTmqxeC3dNX6', 'recruiter'),
('Alex Johnson', 'student@example.com', '$2a$10$vvfjWbKo3hHWUjEuztwhCu0c.1CQMZIbzgrHUXgoQLTmqxeC3dNX6', 'student'),
('Priya Sharma', 'priya@example.com', '$2a$10$vvfjWbKo3hHWUjEuztwhCu0c.1CQMZIbzgrHUXgoQLTmqxeC3dNX6', 'student'),
('Rahul Verma', 'rahul@example.com', '$2a$10$vvfjWbKo3hHWUjEuztwhCu0c.1CQMZIbzgrHUXgoQLTmqxeC3dNX6', 'student'),
('Ananya Das', 'ananya@example.com', '$2a$10$vvfjWbKo3hHWUjEuztwhCu0c.1CQMZIbzgrHUXgoQLTmqxeC3dNX6', 'student');

INSERT INTO users (name, email, password_hash, role) VALUES
('Innovate AI Labs Recruiter', 'innovate@example.com', '$2a$10$vvfjWbKo3hHWUjEuztwhCu0c.1CQMZIbzgrHUXgoQLTmqxeC3dNX6', 'recruiter');

-- 2. SEED STUDENTS
-- user_id 4: Alex Johnson
INSERT INTO students (user_id, enrollment_number, phone, department, graduation_year, cgpa, resume_url) VALUES
(4, 'EN2026CS101', '+1987654321', 'Computer Science', 2026, 8.50, 'https://example.com/resumes/alex_johnson.pdf'),
(5, 'EN2026IT204', '+1987654322', 'Information Technology', 2026, 9.20, 'https://example.com/resumes/priya_sharma.pdf'),
(6, 'EN2026EC305', '+1987654323', 'Electronics & Communication', 2026, 7.10, 'https://example.com/resumes/rahul_verma.pdf'),
(7, 'EN2025ME408', '+1987654324', 'Mechanical Engineering', 2025, 6.40, 'https://example.com/resumes/ananya_das.pdf');

-- 3. SEED STUDENT SKILLS
-- Alex (Student ID 1)
INSERT INTO student_skills (student_id, skill_name) VALUES
(1, 'React'), (1, 'Node.js'), (1, 'JavaScript'), (1, 'SQL'), (1, 'Git'),
-- Priya (Student ID 2)
(2, 'React'), (2, 'Node.js'), (2, 'Python'), (2, 'PostgreSQL'), (2, 'Docker'), (2, 'Java'),
-- Rahul (Student ID 3)
(3, 'JavaScript'), (3, 'HTML'), (3, 'CSS'), (3, 'C++'),
-- Ananya (Student ID 4)
(4, 'AutoCAD'), (4, 'Python'), (4, 'SolidWorks');

-- 4. SEED COMPANIES
-- Each recruiter account manages one company.
INSERT INTO companies (recruiter_id, company_name, description, website, location, status) VALUES
(2, 'Global Tech Solutions', 'Leading enterprise software & cloud infrastructure provider.', 'https://globaltech.example.com', 'Bangalore, India', 'approved'),
(8, 'Innovate AI Labs', 'Next-gen artificial intelligence & data analytics startup.', 'https://innovateai.example.com', 'Hyderabad, India', 'approved'),
(3, 'CloudScale Systems', 'Scalable microservices and cloud management platforms.', 'https://cloudscale.example.com', 'Pune, India', 'approved');

-- 5. SEED JOB POSTINGS
INSERT INTO job_postings (company_id, title, description, location, employment_type, minimum_cgpa, graduation_year, deadline, status) VALUES
(1, 'Software Development Engineer (SDE-1)', 'Build high-performance web applications using React, Node.js, and SQL databases. Work in an agile engineering environment.', 'Bangalore, India', 'Full-Time', 7.50, 2026, '2026-12-31', 'approved'),
(1, 'Frontend Web Developer', 'Create intuitive and reactive user interfaces using modern React, Tailwind CSS, and REST APIs.', 'Remote', 'Full-Time', 7.00, 2026, '2026-11-30', 'approved'),
(2, 'Associate Data Engineer', 'Design data pipelines and manage PostgreSQL data warehouses for machine learning models.', 'Hyderabad, India', 'Full-Time', 8.00, 2026, '2026-10-15', 'approved'),
(3, 'Backend Systems Engineer', 'Optimize Express microservices, execute raw SQL optimization, and manage database connection pooling.', 'Pune, India', 'Full-Time', 8.50, 2026, '2026-12-15', 'approved'),
(1, 'QA Automation Intern', 'Write automated end-to-end test suites and regression pipelines for cloud applications.', 'Bangalore, India', 'Internship', 6.50, 2026, '2026-09-30', 'pending');

-- 6. SEED JOB REQUIRED SKILLS
-- Job 1: SDE-1
INSERT INTO job_required_skills (job_id, skill_name) VALUES
(1, 'React'), (1, 'Node.js'), (1, 'SQL'),
-- Job 2: Frontend Developer
(2, 'React'), (2, 'JavaScript'), (2, 'CSS'),
-- Job 3: Data Engineer
(3, 'Python'), (3, 'PostgreSQL'), (3, 'SQL'),
-- Job 4: Backend Systems Engineer
(4, 'Node.js'), (4, 'PostgreSQL'),
-- Job 5: QA Intern
(5, 'Testing'), (5, 'Java');

-- 7. SEED APPLICATIONS
-- Alex Johnson (Student ID 1) applied to SDE-1 (Job 1) & Frontend (Job 2)
INSERT INTO applications (job_id, student_id, status, applied_at) VALUES
(1, 1, 'shortlisted', CURRENT_TIMESTAMP - INTERVAL 5 DAY),
(2, 1, 'applied', CURRENT_TIMESTAMP - INTERVAL 2 DAY),
-- Priya Sharma (Student ID 2) applied to SDE-1 (Job 1), Data Engineer (Job 3), Backend Systems (Job 4)
(1, 2, 'selected', CURRENT_TIMESTAMP - INTERVAL 10 DAY),
(3, 2, 'shortlisted', CURRENT_TIMESTAMP - INTERVAL 4 DAY),
(4, 2, 'applied', CURRENT_TIMESTAMP - INTERVAL 1 DAY),
-- Rahul Verma (Student ID 3) applied to Frontend Developer (Job 2)
(2, 3, 'rejected', CURRENT_TIMESTAMP - INTERVAL 6 DAY);
