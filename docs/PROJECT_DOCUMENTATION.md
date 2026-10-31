# Placemate
## Student Placement Management System

**Project Documentation and Software Development Life Cycle (SDLC)**

| Document detail | Information |
|---|---|
| Project | Placemate — Student Placement Management System |
| Document version | 1.0 |
| Prepared by | Gokul R |
| Department / Institution | [Department or institution] |
| Date | October 2026 |
| Application type | Full-stack web application |

> Replace the bracketed personal details before submitting this document.

---

## 1. Executive Summary

Placemate is a centralized web application for managing campus recruitment and student placement activities. It provides separate workspaces for students, recruiters, and placement-cell administrators. Students maintain academic profiles, find eligible job opportunities, apply, and track application progress. Recruiters manage their company profile and job postings, review applicants, schedule interviews, and report hiring outcomes. Administrators oversee users and recruitment activity, approve job postings, and view system-wide placement information.

The application is built with React and Vite for the frontend, Node.js and Express for the REST API, and MySQL for persistent data. JWT authentication and role-based authorization protect restricted operations. Optional SMTP email notifications inform students and recruiters about key application events.

---

## 2. Problem Statement

Placement activities can involve student profiles, employer information, job criteria, application decisions, interview schedules, and final outcomes spread across separate spreadsheets, messages, or manual records. This can make it difficult to:

- Maintain consistent student and recruitment information.
- Check whether students satisfy job eligibility criteria.
- Track the progress of applications from submission to final outcome.
- Share interview schedules and decisions with the appropriate students.
- Give placement staff an accurate view of recruitment activity.

Placemate addresses these needs by bringing the principal placement workflows into one role-based system.

## 3. Project Objectives

1. Provide students with a profile, job discovery, eligibility, application, and status-tracking experience.
2. Provide recruiters with tools to publish jobs and manage applicants for their own company.
3. Allow recruiters to schedule interviews and report placement outcomes for their own job postings.
4. Give administrators oversight of system-wide placement activity and job-posting approval.
5. Notify relevant users of important workflow changes when SMTP email is configured.
6. Store application information in a relational database with authorization checks and data-integrity constraints.

## 4. Scope

### Included

- Student, recruiter, and administrator authentication.
- Student academic profiles, skills, and resume URL.
- Company profiles and recruiter-managed job postings.
- Optional expected annual package in LPA, displayed on student and administrator job pages.
- Job discovery, filtering, and server-side eligibility checks.
- Student applications and recruiter review/status updates.
- Recruiter interview scheduling and management.
- Recruiter placement-result reporting.
- Student application, interview, and outcome tracking.
- Administrator job approvals, directories, dashboard metrics, and read-only recruitment oversight.
- Optional SMTP email notifications.

### Not included in the current version

- Direct integration with external applicant-tracking or HR systems.
- Automated interview video conferencing.
- Automated offer-letter generation or electronic signatures.
- A persistent notification delivery queue with retry and delivery-status tracking.
- Production hosting configuration for a particular cloud provider.
- Full automated end-to-end UI test coverage.

## 5. Stakeholders and User Roles

| Role | Main responsibilities | Data access |
|---|---|---|
| Student | Maintain profile, find jobs, apply, review application progress, and view interview and placement information | Own profile and own applications |
| Recruiter | Manage one company profile, post jobs, review applicants, update application status, schedule interviews, and report outcomes | Records belonging to the recruiter’s company |
| Administrator / placement cell | Approve job postings, oversee platform activity, review directories and applications, and monitor interview and placement records | System-wide oversight; interview and result pages are read-only |
| Major administrator | View the admin directory and create, update, or delete other admin accounts | Only `gokulravi89254@gmail.com` can manage other admin accounts; the major account cannot be changed or deleted |

### Company-level access rule

Each recruiter account is associated with one company profile. Recruiter API operations filter by the authenticated recruiter’s user ID through the company and job relationships. A recruiter must not be able to manage another company’s applications, interview schedules, or placement results. The database also enforces one company profile per recruiter.

## 6. Functional Requirements

| ID | Requirement | Implemented behavior |
|---|---|---|
| FR-01 | Authenticate users by role | Register and log in; issue and verify JWT access tokens |
| FR-02 | Maintain student information | Store academic profile, skills, phone, and resume URL |
| FR-03 | Manage companies and jobs | Recruiters maintain a company profile and create job postings with optional annual package information |
| FR-04 | Evaluate student eligibility | Backend checks job criteria, including CGPA, graduation year, skills, deadline, and posting availability |
| FR-05 | Submit and review applications | Students apply; recruiters list, filter, and update applications for their own job postings |
| FR-06 | Schedule interview rounds | Recruiters create, edit, and cancel interview schedules for their applications |
| FR-07 | Record placement outcomes | Recruiters report offered, accepted, or declined outcomes, including optional package and offer date |
| FR-08 | Track progress as a student | Students view application status, interview schedules, and placement results |
| FR-09 | Provide administrator oversight | Admins approve jobs, view platform metrics, and review system-wide applications, interviews, and results |
| FR-10 | Send workflow email notifications | When SMTP is configured, send relevant application, status, interview, and placement emails |
| FR-11 | Enforce role and ownership access | Protected API routes verify authentication, role, and recruiter-to-company ownership |

## 7. Non-Functional Requirements

- **Security:** Passwords are hashed; protected API routes require valid JWTs and appropriate roles.
- **Authorization:** Recruiter access is restricted to their company’s recruitment records.
- **Data integrity:** MySQL foreign keys, unique constraints, and check constraints protect relationships and allowed values.
- **Reliability:** Email is optional; SMTP errors are logged and do not roll back an already saved workflow action.
- **Maintainability:** Backend routes, controllers, and services are separated by responsibility.
- **Usability:** The React interface provides separate role-based navigation and workflow pages.
- **Database access:** Application SQL uses parameterized queries through the `mysql2` database layer.
- **Configuration:** Database, JWT, frontend, and optional SMTP settings are stored in environment configuration rather than hard-coded application logic.

## 8. Software Development Life Cycle

The project follows an iterative SDLC. Requirements, design, implementation, verification, and documentation were refined as the placement workflows were reviewed.

### Phase 1 — Planning and requirements analysis

- Identified the placement stakeholders: students, recruiters, and placement administrators.
- Defined the main placement process: job publication, student application, recruiter review, interview rounds, and final outcome.
- Identified data-privacy and role-separation needs, especially recruiter access to only their own company’s records.

### Phase 2 — System analysis and design

- Selected React/Vite for the frontend, Express/Node.js for the API, and MySQL for persistence.
- Organized the backend into routes, controllers, middleware, services, and database configuration.
- Designed relational data around users, students, companies, jobs, applications, interviews, and placement results.
- Defined role-based routes and recruiter ownership checks.

### Phase 3 — Implementation

- Implemented authentication, profiles, job postings, job search, eligibility, and applications.
- Implemented recruiter applicant review, interview schedule management, and placement-result reporting.
- Implemented administrator job approval, system dashboards, directories, and read-only recruitment oversight.
- Implemented optional SMTP notifications for application, status, interview, and offer changes.
- Added additive database migrations for existing databases.

### Phase 4 — Verification and testing

- Built the frontend for production.
- Ran backend JavaScript syntax checks and the backend automated notification test.
- Verified API health and MySQL connectivity.
- Tested recruiter and administrator API access using role-specific accounts.
- Verified that recruiter queries return only the recruiter’s company records and that attempts to write another recruiter’s records are rejected.
- Verified that the company-ownership migration is repeatable and existing applications remain available.
- Tested email formatting and SMTP delivery against a local test SMTP server. Actual external email delivery depends on configuring valid SMTP credentials.

### Phase 5 — Deployment and operation

- Configure MySQL and environment variables for the target environment.
- Apply additive migrations to an existing database.
- Start the Express API and Vite frontend.
- Monitor server logs and back up the database as part of ongoing operation.

### Phase 6 — Maintenance

- Apply schema changes through versioned migrations.
- Keep secrets out of source files and source control.
- Review dependency updates and security advisories.
- Expand automated API and UI tests as the application grows.

## 9. System Architecture

```text
┌─────────────────────────────────────────────┐
│ React 18 + Vite frontend                    │
│ Role-specific pages, routing, API client    │
└──────────────────────┬──────────────────────┘
                       │ HTTPS/JSON REST API
┌──────────────────────▼──────────────────────┐
│ Node.js + Express backend                   │
│ Routes → authentication/role middleware     │
│        → controllers → business services    │
└──────────────┬─────────────────────┬────────┘
               │                     │
┌──────────────▼─────────────┐  ┌────▼─────────────────┐
│ MySQL database             │  │ SMTP email provider  │
│ Placement and user records│  │ Optional notifications│
└────────────────────────────┘  └──────────────────────┘
```

### Main layers

1. **Frontend:** React pages, React Router, Axios API calls, and Tailwind CSS styling.
2. **API routing:** Express routes map HTTP requests to controllers and apply authentication/role middleware.
3. **Controllers:** Coordinate request handling, call business services, and return JSON responses.
4. **Services:** Implement application rules, authorization ownership checks, database operations, and notifications.
5. **Persistence:** MySQL tables accessed through `mysql2` and parameterized SQL.
6. **Email:** Nodemailer sends configured SMTP notifications. SMTP is optional.

## 10. Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, React Router, Axios, Tailwind CSS, Lucide icons |
| Backend | Node.js, Express.js |
| Database | MySQL 8+, `mysql2` |
| Authentication | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` password hashing |
| Email | Nodemailer with SMTP |
| API style | REST with JSON request and response bodies |

## 11. Database Design

| Table | Purpose |
|---|---|
| `users` | Login identity, email, password hash, and role |
| `students` | Student-specific academic and contact profile |
| `student_skills` | Skill tags associated with student profiles |
| `companies` | Company profile owned by one recruiter account |
| `job_postings` | Recruitment opportunities published by companies |
| `job_required_skills` | Skills required for a job posting |
| `applications` | A student’s application to a job; one application per student/job pair |
| `interview_schedules` | Interview rounds associated with an application; an application may have multiple rounds |
| `placement_results` | Current offer outcome associated with an application; one result per application |
| `schema_migrations` | Applied migration identifiers used by the migration runner |

### Key relationships and constraints

- A user can have a student profile; a recruiter owns a company profile.
- A company can publish multiple jobs.
- A student can submit applications to multiple jobs.
- An application can have multiple interview schedules and one placement result.
- Foreign keys use cascading behavior for dependent records where configured in the schema.
- The `(job_id, student_id)` application pair is unique.
- `companies.recruiter_id` is unique, enforcing one company per recruiter.
- `placement_results.application_id` is unique, enforcing at most one current result per application.

The authoritative schema is [backend/src/db/schema.sql](../backend/src/db/schema.sql). Additive schema changes are stored under [backend/src/db/migrations/](../backend/src/db/migrations/).

## 12. Core Workflows

### Student applies for a job

1. Student signs in and completes their profile.
2. Student views job postings and checks eligibility.
3. Backend evaluates the student profile against the job requirements.
4. Eligible student submits an application.
5. The application is stored and recruiter/student emails are sent if SMTP is configured.
6. The student sees the application in the application tracker.

### Recruiter reviews and shortlists

1. Recruiter signs in and selects one of their job postings.
2. Recruiter reviews and filters applications for that job.
3. Recruiter updates an application to shortlisted, rejected, or selected.
4. Backend validates recruiter ownership and saves the status.
5. Student receives a status email if email is configured.

### Recruiter schedules an interview

1. Recruiter opens the interview page.
2. The application selector lists applications for the recruiter’s own company only.
3. Recruiter enters the round, time, mode, location or meeting link, and optional notes.
4. Backend checks that the application belongs to the authenticated recruiter’s company.
5. The interview is saved and the student is emailed when SMTP is configured.
6. The student sees the interview in their application tracker.

### Recruiter reports an offer or outcome

1. Recruiter selects an application for one of their own jobs.
2. Recruiter records offered, accepted, or declined, and may enter package, date, and notes.
3. Backend checks company ownership and saves or updates the result.
4. Student receives an email when SMTP is configured and can view the result.
5. Administrators can view the outcome in platform-wide oversight.

### Administrator oversight

1. Administrator reviews dashboard metrics and pending job approvals.
2. Administrator can review platform directories, applications, interview schedules, and placement outcomes.
3. Interview and placement pages are read-only for administrators; recruiters manage their own records.

## 13. Security and Privacy

- Passwords are stored as bcrypt hashes rather than plaintext.
- JWT authentication protects private API endpoints.
- Role middleware restricts student, recruiter, and administrator functions.
- Recruiter services filter and validate application ownership using the authenticated recruiter ID.
- A recruiter cannot use a different application or interview/result ID to access another company’s records.
- SQL parameters are bound through prepared query calls to reduce injection risk.
- Credentials and secrets belong in the ignored local `backend/.env`, not in source files or documentation.
- Resume URLs and student profile data should be treated as personal information; deploy with appropriate access policies and HTTPS.
- Production deployments should use a strong private JWT secret, secure database credentials, backups, and a production-grade SMTP account.

## 14. Email Notifications

When SMTP is configured, the application can send:

- Application confirmation to the student and new-applicant notification to the recruiter.
- Student email when an application status changes.
- Student email when an interview is scheduled, updated, completed, or cancelled.
- Student email when an offer result is recorded or changed.

Email configuration uses `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and optionally `SMTP_FROM`. These settings belong in `backend/.env`. Without SMTP configuration, workflows still operate and a warning is logged. When delivery fails, the workflow record remains saved and the failure is logged. A durable retry queue is not currently implemented.

## 15. Installation and Running Instructions

### Prerequisites

- Node.js 18 or newer and npm.
- MySQL 8 or newer, running and accessible.
- A browser for the frontend.
- Optional SMTP credentials if email delivery is required.

### Configure the backend

1. Copy `backend/.env.example` to `backend/.env`.
2. Set MySQL host, user, password, database, and port.
3. Set a private `JWT_SECRET`.
4. Add SMTP settings only if email notifications are required.
5. Install backend dependencies and initialize the database.

```powershell
Set-Location 'PlacementHub\backend'
npm install
npm run db:init

For an existing database, use the additive migration command instead:

```powershell
Set-Location 'PlacementHub\backend'
npm run db:migrate
```

### Start the backend

```powershell
Set-Location 'PlacementHub\backend'
npm start
```

The API normally listens on `http://localhost:5001`. Check `http://localhost:5001/api/health` for service and database status.

### Start the frontend

Open a second terminal:

```powershell
Set-Location 'PlacementHub\frontend'
npm install
npm run dev
```

Open the Vite URL printed in the terminal, normally `http://localhost:5173`.

### Demo accounts

Seeded demo accounts use the password `Password123`. They are for local development and must not be used in a production deployment.

| Role | Email |
|---|---|
| Major administrator | `gokulravi89254@gmail.com` |
| Recruiter — Global Tech Solutions | `recruiter@example.com` |
| Recruiter — CloudScale Systems | `techcorp@example.com` |
| Recruiter — Innovate AI Labs | `innovate@example.com` |
| Student | `student@example.com` |
| Student | `priya@example.com` |

## 16. API Overview

Base URL: `http://localhost:5001/api`

| Area | Representative endpoints | Access |
|---|---|---|
| Authentication | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Public or authenticated |
| Student profile | `GET /students/me`, `PUT /students/me`, `GET /students/me/applications` | Student |
| Jobs | `GET /jobs`, `GET /jobs/:id`, `GET /jobs/:id/eligibility`, `POST /jobs/:id/apply` | Public/student |
| Recruiter applicants | `GET /jobs/:jobId/applications`, `PATCH /applications/:id/status` | Recruiter owner or admin |
| Recruiter interviews | `GET/POST /recruiter/interviews`, `PUT/DELETE /recruiter/interviews/:id` | Recruiter; own company |
| Recruiter placement results | `GET/POST /recruiter/placements`, `DELETE /recruiter/placements/:id` | Recruiter; own company |
| Admin oversight | `GET /admin/dashboard`, `GET /admin/applications`, `GET /admin/interviews`, `GET /admin/placements` | Admin |
| Admin job approval | `PATCH /admin/jobs/:id/status` | Admin |
| Health | `GET /health` or `GET /api/health` | Public |

See [API.md](./API.md) for request fields, response examples, and additional endpoint details.

## 17. Verification and Test Plan

### Current verification

- Frontend production build completed successfully.
- Backend JavaScript syntax checks completed successfully for changed files.
- Backend automated SMTP notification test passed using a local test SMTP server.
- API health endpoint reported an active service and connected MySQL database.
- Recruiter API queries were verified to return only records for the recruiter’s company.
- Attempts to manage another recruiter’s application were rejected.
- Database migration was applied and rerun; existing applications were retained.

### Recommended regression tests

1. Register/login for each supported user role.
2. Verify a student who meets job criteria can apply and an ineligible student receives an appropriate error.
3. Verify duplicate applications are rejected.
4. Verify recruiters see only their own jobs and applicants.
5. Verify cross-company interview/result reads and writes are denied.
6. Verify interview creation, editing, cancellation, and student visibility.
7. Verify placement result creation/update and student visibility.
8. Verify administrators can view all results but cannot write recruiter-managed interview/result records.
9. Verify email delivery with a test SMTP server and verify the app remains operational when SMTP is unavailable.
10. Verify the database health check and migration behavior.

## 18. Limitations and Future Enhancements

- Add broader automated API and frontend end-to-end tests.
- Add a durable email queue, retries, and notification delivery history.
- Add audit history for recruiter and administrator changes.
- Add pagination and reporting exports for larger datasets.
- Add configurable interview reminders and calendar export.
- Add deployment-specific monitoring, logging, and backup automation.
- Review dependency audit findings and apply safe updates.

## 19. Glossary

| Term | Meaning |
|---|---|
| Application | A student’s submission for a particular job posting |
| Recruiter | A company representative who manages that company’s recruitment workflow |
| Placement result | Offer status and related outcome details for an application |
| SMTP | Standard protocol used to send email through a mail provider |
| JWT | Signed token used to authenticate API requests |
| Migration | Versioned database change applied without resetting existing data |

## 20. Related Project Documents

- [Project README and quick-start guide](../README.md)
- [Detailed REST API reference](./API.md)
- [SDLC and requirements summary](./SDLC.md)
- [Backend database schema](../backend/src/db/schema.sql)
