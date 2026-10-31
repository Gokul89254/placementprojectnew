# Placemate - REST API Documentation

Base URL: `http://localhost:5001/api`

Standard Response Format:
```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

Standard Error Format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["ERROR_CODE"]
}
```

---

## 1. Authentication Endpoints

### 1.1 User Registration
- **Method**: `POST`
- **Endpoint**: `/auth/register`
- **Authentication**: None (Public)
- **Request Body**:
```json
{
  "name": "Alex Johnson",
  "email": "student@example.com",
  "password": "Password123",
  "role": "student",
  "department": "Computer Science",
  "graduation_year": 2026,
  "cgpa": 8.5
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": 4,
      "name": "Alex Johnson",
      "email": "student@example.com",
      "role": "student"
    }
  }
}
```

### 1.2 User Login
- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Authentication**: None (Public)
- **Request Body**:
```json
{
  "email": "student@example.com",
  "password": "Password123"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": 4,
      "name": "Alex Johnson",
      "email": "student@example.com",
      "role": "student"
    }
  }
}
```

### 1.3 Get Current Authenticated User
- **Method**: `GET`
- **Endpoint**: `/auth/me`
- **Authentication**: Required (`Bearer <token>`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Authenticated user profile retrieved",
  "data": {
    "user": {
      "id": 4,
      "name": "Alex Johnson",
      "email": "student@example.com",
      "role": "student",
      "student_profile": {
        "id": 1,
        "enrollment_number": "EN2026CS101",
        "department": "Computer Science",
        "graduation_year": 2026,
        "cgpa": "8.50",
        "skills": ["React", "Node.js", "SQL"]
      }
    }
  }
}
```

---

## 2. Student Endpoints

### 2.1 Get Student Profile
- **Method**: `GET`
- **Endpoint**: `/students/me`
- **Authentication**: Required
- **Role**: `student`
- **Success Response (200 OK)**: Returns detailed profile, skill tags, and application summary statistics.

### 2.2 Update Student Profile
- **Method**: `PUT`
- **Endpoint**: `/students/me`
- **Authentication**: Required
- **Role**: `student`
- **Request Body**:
```json
{
  "phone": "+1987654321",
  "department": "Computer Science",
  "graduation_year": 2026,
  "cgpa": 8.5,
  "resume_url": "https://example.com/resumes/alex.pdf",
  "skills": ["React", "Node.js", "Express", "MySQL"]
}
```

### 2.3 Get Student Submitted Applications
- **Method**: `GET`
- **Endpoint**: `/students/me/applications`
- **Authentication**: Required
- **Role**: `student`

---

## 3. Job & Eligibility Endpoints

### 3.1 Get Available Job Postings
- **Method**: `GET`
- **Endpoint**: `/jobs?search=Developer&location=Bangalore&minCgpa=7.5`
- **Authentication**: Optional / Public

### 3.2 Get Server-Side Job Eligibility Evaluation
- **Method**: `GET`
- **Endpoint**: `/jobs/:jobId/eligibility`
- **Authentication**: Required
- **Role**: `student`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Student is eligible for this job",
  "data": {
    "eligible": true,
    "reasons": [],
    "student_cgpa": 8.5,
    "required_cgpa": 7.5,
    "required_skills": ["React", "Node.js", "SQL"]
  }
}
```
- **Ineligible Response**:
```json
{
  "success": true,
  "message": "Student is not eligible for this job",
  "data": {
    "eligible": false,
    "reasons": [
      "Student CGPA (7.10) is below the minimum requirement (7.50)",
      "Missing required skill(s): React, Node.js"
    ]
  }
}
```

### 3.3 Apply for Job
- **Method**: `POST`
- **Endpoint**: `/jobs/:jobId/apply`
- **Authentication**: Required
- **Role**: `student`
- When SMTP is configured, an application confirmation is emailed to the student and a new-applicant notification is emailed to the recruiter.

---

## 4. Recruiter & Shortlisting Endpoints

### 4.1 Create Job Posting
- **Method**: `POST`
- **Endpoint**: `/jobs`
- **Authentication**: Required
- **Role**: `recruiter` or `admin`
- Recruiter job postings and candidate workflows are scoped to the recruiter's single company profile.
- Job creation and update may include `expected_package`, a non-negative annual package amount in LPA (lakhs per annum). It is optional; omit or pass `null` when the company does not disclose it. Student job listings and administrator job listings display the saved amount.

### 4.2 Get Applicants for Job
- **Method**: `GET`
- **Endpoint**: `/jobs/:jobId/applications?minCgpa=8.0&department=Computer%20Science`
- **Authentication**: Required
- **Role**: `recruiter` (Job Owner) or `admin`

### 4.3 Update Candidate Application Status
- **Method**: `PATCH`
- **Endpoint**: `/applications/:id/status`
- **Authentication**: Required
- **Role**: `recruiter` (Job Owner) or `admin`
- **Request Body**:
```json
{
  "status": "shortlisted"
}
```
- Allowed statuses: `applied`, `shortlisted`, `rejected`, `selected`.
- When the status changes, an email notification is sent to the student.

---

## 5. Admin Endpoints

### Registered Student Directory Analytics
- **GET** `/admin/students` — returns the registered students, department counts, percentages, and total student count.
- Optional query parameters: `department` (exact department name) and `search` (matches student name, email, or enrollment/roll number). Department statistics remain global while student records are filtered.

### Admin Account Management
- **PATCH** `/admin/account/password` — change the authenticated admin's password. Requires `current_password` and `new_password` (minimum 8 characters); current password is verified before storing a bcrypt hash.
- **GET** `/admin/admins` — list admin names, emails, and account creation dates. Available to all authenticated admins.
- **POST** `/admin/admins` — create another admin account. Requires `name`, `email`, and `password` (minimum 8 characters). Only the major admin (`gokulravi89254@gmail.com`) can use this endpoint; the password is stored as a bcrypt hash.
- **PATCH** `/admin/admins/:id` — update another admin's name and email. Only the major admin can use this endpoint; the major admin account cannot be changed.
- **DELETE** `/admin/admins/:id` — delete an admin account. Only the major admin can use this endpoint; the major admin account cannot be deleted.
- Public registration is limited to student and recruiter accounts. Admin accounts must be created by the major admin.

### 5.1 Admin Overview Metrics
- **Method**: `GET`
- **Endpoint**: `/admin/dashboard`
- **Authentication**: Required
- **Role**: `admin`

### 5.2 Approve or Reject Job Posting
- **Method**: `PATCH`
- **Endpoint**: `/admin/jobs/:id/status`
- **Authentication**: Required
- **Role**: `admin`
- **Request Body**: `{ "status": "approved" }` or `{ "status": "rejected" }`
- Allowed statuses: `pending`, `approved`, `rejected`, and `closed`.
- Jobs submitted by recruiters start as `pending` and are hidden from students until approved. Rejected jobs remain hidden.
- When a recruiter submits a job, each registered admin is emailed a link to the admin job review page. Configure SMTP as described below.

### 5.3 Review company profiles
- **PATCH** `/admin/companies/:id/status` — set company status to `pending`, `approved`, or `rejected`.
- Recruiter-created company profiles are pending by default. Admins receive an email with a link to the company review page.
- Only approved companies are listed publicly and their jobs can be listed to students. Recruiters cannot post jobs until their company is approved.

### 5.4 Recruiter Interview Schedules
- **GET** `/recruiter/applications` — list applications for the authenticated recruiter's jobs.
- **GET** `/recruiter/interviews` — list scheduled interviews for the authenticated recruiter's jobs.
- **POST** `/recruiter/interviews` — create a schedule.
- **PUT** `/recruiter/interviews/:id` — update a schedule.
- **DELETE** `/recruiter/interviews/:id` — delete a schedule.

Schedule request fields: `application_id`, `round_name`, `scheduled_at` (local ISO date/time), `mode` (`online` or `in_person`), and optional `location`, `meeting_link`, `notes`, and `status` (`scheduled`, `completed`, or `cancelled`).
- Students are emailed when an interview is scheduled, updated, or cancelled.
- Recruiters can only access applications and schedules for their own job postings. Admins can view all interview schedules using `GET /admin/interviews`.

### 5.5 Recruiter Placement Results
- **GET** `/recruiter/placements` — list results for applications to the authenticated recruiter's jobs.
- **POST** `/recruiter/placements` — record or update the result for an application.
- **DELETE** `/recruiter/placements/:id` — delete a recorded result.

Result request fields: `application_id`, `result_status` (`offered`, `accepted`, or `declined`), and optional `package_amount`, `offer_date`, and `notes`. A result is unique per application; submitting it again updates that result.
- Students are emailed when a placement result is created or changed.
- Recruiters can only access results for their own job postings. Admins can view all placement results using `GET /admin/placements`.

### 5.6 Email configuration
Email delivery is optional and uses the backend SMTP settings: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`. Configure these in the ignored `backend/.env` file and restart the backend. Admin job and company review notifications are sent to all accounts with the `admin` role. If SMTP is missing or unavailable, the posting remains pending for review and the backend logs the delivery/configuration issue.
