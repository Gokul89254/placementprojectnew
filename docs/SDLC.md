# Placemate SDLC and Project Documentation

## 1. Project overview

Placemate is a role-based student placement management system built with React, Express, Node.js, and MySQL. It centralizes student profiles, employer recruitment drives, job applications, interview schedules, and placement outcomes for students, recruiters, and placement-cell administrators.

## 2. Requirements analysis

### Functional requirements

| ID | Requirement | Current implementation |
|---|---|---|
| FR-01 | Register and authenticate students, recruiters, and administrators | JWT authentication and role-protected routes |
| FR-02 | Maintain student academic profiles and skills | Student profile and skill management |
| FR-03 | Manage companies, job postings, eligibility, and recruitment applications | Recruiter company/job tools and server-side eligibility checks |
| FR-04 | Track application review, shortlisting, selection, and rejection | Application workflow and student application tracker |
| FR-05 | Schedule and manage interview rounds for applications | Recruiters manage schedules for their own jobs; admins can view all schedules |
| FR-06 | Record offers, acceptances, declines, package details, and offer dates | Recruiters record outcomes for their own jobs; admins can view all results |
| FR-07 | Give the placement cell a central view of placement activity | Admin metrics, job approval queue, interviews, and placement results |
| FR-08 | Restrict protected operations to authorized roles | JWT middleware and admin/recruiter/student role checks |
| FR-09 | Notify participants about application, interview, and placement progress | Optional SMTP email notifications to students and recruiters |

### Non-functional requirements

- Use parameterized SQL queries and relational constraints to protect data integrity.
- Keep the interface responsive and provide clear loading, empty, and error states.
- Keep database credentials in the ignored `backend/.env`; never commit local secrets.
- Use the MySQL connection pool and transactions for related multi-step writes.

## 3. System design

### Architecture

1. **Presentation layer:** React, Vite, React Router, Axios, and Tailwind CSS.
2. **API layer:** Express routes and controllers validate requests and return JSON responses.
3. **Business layer:** Service classes implement authentication, eligibility, recruitment, interview, and result workflows.
4. **Persistence layer:** MySQL tables with foreign keys, unique constraints, and parameterized access through `mysql2`.
5. **Notification layer:** Nodemailer sends SMTP email after application, status, interview, and offer changes; delivery failures are logged without undoing saved workflow changes.

### Main data relationships

- A user may have a student profile; recruiters own company profiles.
- Companies publish jobs; students apply to jobs.
- Applications can have multiple interview schedules and at most one current placement result.
- Deleting a parent record cascades to its dependent placement records.

### Access control

- Students maintain their own profile and view their applications, interview schedules, and results.
- Recruiters manage their companies, jobs, applicant workflows, interview schedules, and placement outcomes subject to job ownership.
- Each recruiter account is associated with one company profile, preventing cross-company candidate and outcome visibility.
- Administrators manage platform-wide records and job approvals, and have read-only oversight of interview schedules and placement outcomes.

## 4. Implementation plan and status

| Phase | Work | Status |
|---|---|---|
| Planning and analysis | Identify student, recruiter, and placement-cell workflows | Implemented |
| Design | Define React/Express/MySQL architecture, role boundaries, and relational entities | Implemented |
| Implementation | Build authentication, profiles, recruitment, applications, interviews, and results | Implemented |
| Testing | Build frontend; verify API health, database connectivity, role-specific endpoints, and new workflows | Frontend build and API smoke checks verified |
| Deployment | Configure environment variables, initialize/migrate MySQL, and start frontend/backend | Documented |
| Maintenance | Review errors, back up data, update dependencies, and add schema changes as migrations | Ongoing |

## 5. Verification plan

Run the following checks after installation and database setup:

1. `npm run db:migrate` from `backend/` applies additive interview, placement-results, and company/job approval changes without dropping existing data.
2. `npm start` from `backend/` starts the API; `GET /api/health` reports a connected database.
3. `npm run build` from the repository root builds the React application.
4. Sign in as a recruiter and verify `/api/recruiter/interviews` and `/api/recruiter/placements` only expose records for their own job postings.
5. Sign in as an administrator and verify `/api/admin/interviews` and `/api/admin/placements` provide read-only system-wide oversight.
6. Create, edit, and delete an interview schedule as a recruiter; verify the student's application tracker reflects changes.
7. Record and update a placement result as a recruiter; verify administrator metrics and the student's application tracker.
8. Attempt recruiter operations against another recruiter's job and verify access is denied.
9. Attempt admin endpoints with a non-admin token and verify access is denied.
10. Configure local SMTP settings and verify application, status, interview, and placement email notifications using `npm test` in `backend/`.

Demo account credentials are listed in the repository README. Use them only with a local seeded development database.

## 6. Deployment and operations

1. Install Node.js 18 or newer and MySQL 8.
2. Copy `backend/.env.example` to `backend/.env` and set MySQL credentials and a private JWT secret. Configure SMTP variables if email notifications are required.
3. Run `npm install` in the root, `backend/`, and `frontend/` as applicable.
4. Run `npm run db:init` only for a new development database; it resets/reseeds the application schema.
5. Run `npm run db:migrate` for the additive interview and placement-results schema on an existing database.
6. Start the API and frontend using the commands in the README.
7. Back up MySQL before production migrations; do not run the reset-and-seed initializer against production data.

## 7. Maintenance and future improvements

- Add automated API and UI tests for role boundaries and application workflows.
- Add audit history for administrator changes and interview/result updates.
- Add durable notification retries and delivery-status tracking for SMTP failures.
- Add reporting exports and pagination as the number of records grows.
- Keep future schema changes additive and versioned under `backend/src/db/migrations/`.
