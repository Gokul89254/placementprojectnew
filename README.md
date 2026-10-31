# Placemate — Student Placement Management System

A production-quality, interview-friendly full-stack web application designed to digitize, streamline, and automate college campus placement drives.

Built from scratch using **React.js (Vite)**, **Node.js (Express.js)**, **MySQL**, and **JWT Authentication**.

---

## 🌟 Key Features & Workflow

### 1. Student Portal
- **Authentication & Profile**: Register, login, and maintain an academic profile (CGPA, department, graduation year, resume URL, and skill tags).
- **Job Discovery & Search**: Browse active corporate placement drives with filters for location, min CGPA, department, and skills.
- **Server-Side Eligibility Engine**: Automated evaluation verifying CGPA cutoff, graduation batch, and required skill coverage before application submission.
- **Application Tracking**: Real-time status tracking (`Applied`, `Shortlisted`, `Selected`, `Rejected`), interview schedules, and placement outcomes.

### 2. Recruiter Portal
- **Corporate Company Profile**: Create and update corporate profile details.
- **Job Posting Management**: Define job opportunities with eligibility parameters (min CGPA, graduation batch, deadline, required skills).
- **Expected Package**: Include an optional annual salary package in LPA on job postings; students and administrators can view it.
- **Candidate Filtering**: Search and filter applicants by CGPA, department, skills, and application status.
- **Shortlisting & Selection Workflow**: Update candidate application statuses (`Shortlisted`, `Selected`, `Rejected`) with job ownership enforcement.
- **Interview Scheduling**: Schedule interview rounds, modes, meeting links, locations, and completion status for applications to your jobs.
- **Placement Results**: Report offer, acceptance, or decline outcomes, package details, and offer dates for your candidates.

### 3. Placement Cell / Admin Portal
- **System Oversight Dashboard**: Platform metrics (Total Students, Companies, Jobs, Applications, Shortlisted, Placed).
- **Job Approval Workflow**: Review and approve corporate job postings before making them visible to students.
- **Directories Audit**: Audit student directory, company list, job postings, and master application log.
- **Recruitment Oversight**: View all recruiter-managed interview schedules and placement results without editing them.
- **Admin Account Management**: All admins can view the admin directory; only `gokulravi89254@gmail.com` can add, edit, or delete other admin accounts.

### 4. Email Notifications
- Email students when an application is received, shortlisted, rejected, or selected.
- Email recruiters when a student applies to one of their postings.
- Email students when an interview is scheduled, changed, or cancelled, and when an offer result is recorded or updated.
- Notifications use SMTP and are optional: the application workflows continue if SMTP is not configured or a mail provider is temporarily unavailable.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Axios, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js (Modular MVC/Service Architecture) |
| **Database** | MySQL (`mysql2` Connection Pool with Parameterized SQL Queries) |
| **Authentication** | JSON Web Token (JWT), `bcryptjs` (Salt Rounds = 10) |
| **API** | REST API Architecture |

---

## 🏗 Architecture & System Design

```
┌─────────────────────────────────────────────────────────────┐
│                      React 18 + Vite                        │
│   (React Router v6, AuthContext, Axios, Tailwind CSS)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON + Bearer JWT)
┌──────────────────────────────▼──────────────────────────────┐
│                    Node.js + Express.js                     │
│  (Auth Middleware, Controllers, Services, Error Handling)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Parameterized SQL Queries (MySQL connection pool)
┌──────────────────────────────▼──────────────────────────────┐
│                       MySQL Database                         │
│ (users, students, student_skills, companies, job_postings,  │
│ applications, interview_schedules, placement_results)       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄 Database ER Diagram

```mermaid
erDiagram
    users ||--o| students : "1 to 1"
    users ||--o{ companies : "1 to many"
    students ||--o{ student_skills : "1 to many"
    students ||--o{ applications : "1 to many"
    companies ||--o{ job_postings : "1 to many"
    job_postings ||--o{ job_required_skills : "1 to many"
    job_postings ||--o{ applications : "1 to many"
    applications ||--o{ interview_schedules : "1 to many"
    applications ||--o| placement_results : "1 to 1"

    users {
        int id PK
        string name
        string email UK
        string password_hash
        string role
        timestamp created_at
    }

    students {
        int id PK
        int user_id FK, UK
        string enrollment_number UK
        string department
        int graduation_year
        numeric cgpa
        string resume_url
    }

    student_skills {
        int id PK
        int student_id FK
        string skill_name
    }

    companies {
        int id PK
        int recruiter_id FK
        string company_name
        string location
    }

    job_postings {
        int id PK
        int company_id FK
        string title
        numeric minimum_cgpa
        int graduation_year
        date deadline
        string status
    }

    job_required_skills {
        int id PK
        int job_id FK
        string skill_name
    }

    applications {
        int id PK
        int job_id FK
        int student_id FK
        string status
        timestamp applied_at
    }

    interview_schedules {
        int id PK
        int application_id FK
        string round_name
        datetime scheduled_at
        string mode
        string status
    }

    placement_results {
        int id PK
        int application_id FK, UK
        string result_status
        decimal package_amount
        date offer_date
    }
```

---

## 🔐 Local Demo Credentials

> [!IMPORTANT]
> The seed script automatically generates demo accounts with pre-populated placement data. All accounts use password: `Password123`

| Persona | Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@example.com` | `Password123` |
| **Student 2** | `priya@example.com` | `Password123` |
| **Recruiter** | `recruiter@example.com` | `Password123` |
| **Major admin** | `gokulravi89254@gmail.com` | `Password123` |
| **Recruiter (Innovate AI Labs)** | `innovate@example.com` | `Password123` |

---

## 🚀 Installation & Running Guide

### 1. Prerequisites
- Node.js (v18+)
- MySQL 8.0 installed and running locally

### 2. Environment Setup
Clone the repository and configure backend environment variables in `backend/.env`:
```env
PORT=5001
# Optional: DATABASE_URL=mysql://root:your_password@localhost:3306/placement_db
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=placement_db
MYSQL_PORT=3306
JWT_SECRET=placement_platform_super_secret_jwt_key_2026
FRONTEND_URL=http://localhost:5173

# Optional email notifications; use an SMTP provider's credentials (not an account login password)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=Placemate <no-reply@example.com>
```

To enable notifications, copy the SMTP settings into `backend/.env` and restart the backend. For Gmail, use an App Password with SMTP access. Without valid SMTP settings, notifications are disabled and the backend logs a warning; SMTP passwords belong only in the ignored local `.env`, never in source control.

### 3. Initialize Database & Seed Demo Data
Run the automated initialization script inside `backend/`:
```bash
cd backend
npm install
npm run db:init
```

For an existing database, apply the non-destructive interview, placement-results, company approval, and job review migrations:
```bash
npm run db:migrate
```

### 4. Start Backend Server
```bash
cd backend
npm start
```
*Backend API server will run at `http://localhost:5001`*

### 5. Start Frontend Client
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend application will run at `http://localhost:5173`*

## 📋 Project Lifecycle & Documentation

For a submission-ready project report covering the SDLC, requirements, architecture, database, workflows, security, testing, setup, and API overview, see [docs/PROJECT_DOCUMENTATION.md](./docs/PROJECT_DOCUMENTATION.md). The concise lifecycle summary is in [docs/SDLC.md](./docs/SDLC.md), and endpoint details are in [docs/API.md](./docs/API.md).

---

## 🎓 Technical Interview Q&A Guide

### Q1: How does authentication and authorization work in this platform?
**Answer**:
- **Authentication**: When a user logs in via `POST /api/auth/login`, the backend finds the user record by email and compares the provided password with the stored hash using `bcrypt.compare()`. Upon verification, a JWT token signed with a secret key is generated containing payload claims (`userId`, `email`, `role`, `name`).
- **Authorization**: The client stores the JWT in `localStorage` and attaches it to the HTTP `Authorization: Bearer <token>` header for API requests. The `authenticateToken` middleware verifies the token and attaches `req.user`. Subsequent role middleware like `requireRole('student')` or `requireRole('recruiter')` checks `req.user.role` to allow or block endpoint access.

### Q2: How does the server-side eligibility engine evaluate students?
**Answer**:
When a student checks eligibility for a job via `GET /api/jobs/:jobId/eligibility`, the backend evaluates the student's profile against the job rules:
1. `student.cgpa >= job.minimum_cgpa`
2. `student.graduation_year === job.graduation_year`
3. Required skills coverage check comparing student skills with job required skills.
4. Deadline & job approval status check.

Eligibility computation strictly happens on the backend so that malicious clients cannot manipulate eligibility claims sent to the server.

### Q3: How do you prevent duplicate job applications?
**Answer**:
Duplicate application prevention is enforced at two distinct layers:
1. **Application Logic Layer**: Before creating an application in `applicationService.js`, an explicit SQL query checks if an application with the given `(job_id, student_id)` already exists.
2. **Database Constraint Layer**: The `applications` table includes a composite unique constraint `UNIQUE(job_id, student_id)`. If concurrent requests bypass the application check, MySQL rejects the duplicate and the API returns a `409 Conflict` error.

---

## 📁 Repository Structure

```
Placemate/
├── backend/
│   ├── src/
│   │   ├── config/        # Database connection pool (db.js)
│   │   ├── controllers/   # Route handler logic
│   │   ├── middleware/    # Auth & RBAC middleware
│   │   ├── routes/        # Express REST API routes
│   │   ├── services/      # Business & Database operations
│   │   ├── utils/         # JWT token generator
│   │   ├── db/            # schema.sql, seed.sql, initDb.js
│   │   └── app.js         # Express app configuration
│   ├── server.js          # Entry point server listener
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Navbar, ProtectedRoute
│   │   ├── context/       # AuthContext state manager
│   │   ├── pages/         # Student, Recruiter, Admin pages
│   │   ├── services/      # Axios instance & interceptors
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── docs/
│   └── API.md             # REST API Specifications
├── schema.sql
├── seed.sql
└── README.md
```
