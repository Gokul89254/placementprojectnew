const bcrypt = require('bcryptjs');
const db = require('../config/db');
const emailNotificationService = require('./emailNotificationService');
const { MAJOR_ADMIN_EMAIL } = require('../constants/admin');

class AdminService {
  async changeAdminPassword(adminId, { current_password, new_password }) {
    if (typeof current_password !== 'string' || !current_password || typeof new_password !== 'string' || new_password.length < 8) {
      const error = new Error('Current password and a new password of at least 8 characters are required');
      error.status = 400;
      throw error;
    }

    const admin = await db.query(
      "SELECT password_hash FROM users WHERE id = ? AND role = 'admin'",
      [adminId]
    );
    if (admin.rowCount === 0) {
      const error = new Error('Admin account not found');
      error.status = 404;
      throw error;
    }

    if (!await bcrypt.compare(current_password, admin.rows[0].password_hash)) {
      const error = new Error('Current password is incorrect');
      error.status = 401;
      throw error;
    }

    if (await bcrypt.compare(new_password, admin.rows[0].password_hash)) {
      const error = new Error('New password must be different from the current password');
      error.status = 400;
      throw error;
    }

    const passwordHash = await bcrypt.hash(new_password, 12);
    await db.query(
      "UPDATE users SET password_hash = ? WHERE id = ? AND role = 'admin'",
      [passwordHash, adminId]
    );
  }

  async createAdmin({ name, email, password }) {
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!normalizedName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || typeof password !== 'string' || password.length < 8) {
      const error = new Error('Name, a valid email address, and a password of at least 8 characters are required');
      error.status = 400;
      throw error;
    }

    const existing = await db.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.rowCount > 0) {
      const error = new Error('Email address is already registered');
      error.status = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    try {
      const result = await db.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
        [normalizedName, normalizedEmail, passwordHash]
      );
      return {
        id: result.insertId,
        name: normalizedName,
        email: normalizedEmail,
        role: 'admin'
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        const conflict = new Error('Email address is already registered');
        conflict.status = 409;
        throw conflict;
      }
      throw error;
    }
  }

  async getAllAdmins() {
    const result = await db.query(
      `SELECT id, name, email, created_at
       FROM users
       WHERE role = 'admin'
       ORDER BY created_at ASC, id ASC`
    );
    return result.rows;
  }

  async updateAdmin(adminId, { name, email }) {
    const id = Number(adminId);
    if (!Number.isInteger(id) || id < 1) {
      const error = new Error('A valid admin account ID is required');
      error.status = 400;
      throw error;
    }

    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!normalizedName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      const error = new Error('A name and valid email address are required');
      error.status = 400;
      throw error;
    }

    const admin = await db.query(
      "SELECT email FROM users WHERE id = ? AND role = 'admin'",
      [id]
    );
    if (admin.rowCount === 0) {
      const error = new Error('Admin account not found');
      error.status = 404;
      throw error;
    }
    if (admin.rows[0].email.toLowerCase() === MAJOR_ADMIN_EMAIL) {
      const error = new Error('The major administrator account cannot be changed');
      error.status = 403;
      throw error;
    }

    const duplicate = await db.query(
      'SELECT id FROM users WHERE email = ? AND id <> ?',
      [normalizedEmail, id]
    );
    if (duplicate.rowCount > 0) {
      const error = new Error('Email address is already registered');
      error.status = 409;
      throw error;
    }

    try {
      await db.query(
        "UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = 'admin' AND LOWER(email) <> ?",
        [normalizedName, normalizedEmail, id, MAJOR_ADMIN_EMAIL]
      );
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        const conflict = new Error('Email address is already registered');
        conflict.status = 409;
        throw conflict;
      }
      throw error;
    }

    const updated = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ? AND role = \'admin\'',
      [id]
    );
    if (updated.rowCount === 0) {
      const error = new Error('Admin account not found');
      error.status = 404;
      throw error;
    }
    return updated.rows[0];
  }

  async deleteAdmin(adminId) {
    const id = Number(adminId);
    if (!Number.isInteger(id) || id < 1) {
      const error = new Error('A valid admin account ID is required');
      error.status = 400;
      throw error;
    }

    const result = await db.query(
      "DELETE FROM users WHERE id = ? AND role = 'admin' AND LOWER(email) <> ?",
      [id, MAJOR_ADMIN_EMAIL]
    );
    if (result.rowCount > 0) return;

    const existing = await db.query(
      "SELECT email FROM users WHERE id = ? AND role = 'admin'",
      [id]
    );
    if (existing.rowCount === 0) {
      const error = new Error('Admin account not found');
      error.status = 404;
      throw error;
    }

    const error = new Error('The major administrator account cannot be deleted');
    error.status = 403;
    throw error;
  }

  /**
   * Get global placement metrics
   */
  async getDashboardMetrics() {
    const studentsRes = await db.query('SELECT COUNT(*) AS count FROM students');
    const companiesRes = await db.query('SELECT COUNT(*) AS count FROM companies');
    const pendingCompaniesRes = await db.query("SELECT COUNT(*) AS count FROM companies WHERE status = 'pending'");
    const jobsRes = await db.query('SELECT COUNT(*) AS count FROM job_postings');
    const pendingJobsRes = await db.query("SELECT COUNT(*) AS count FROM job_postings WHERE status = 'pending'");
    const appsRes = await db.query('SELECT COUNT(*) AS count FROM applications');
    const shortlistedRes = await db.query("SELECT COUNT(*) AS count FROM applications WHERE status = 'shortlisted'");
    const selectedRes = await db.query("SELECT COUNT(*) AS count FROM applications WHERE status = 'selected'");
    const interviewsRes = await db.query("SELECT COUNT(*) AS count FROM interview_schedules WHERE status = 'scheduled'");
    const placementsRes = await db.query("SELECT COUNT(*) AS count FROM placement_results WHERE result_status = 'accepted'");

    return {
      total_students: parseInt(studentsRes.rows[0].count, 10),
      total_companies: parseInt(companiesRes.rows[0].count, 10),
      pending_companies_count: parseInt(pendingCompaniesRes.rows[0].count, 10),
      total_jobs: parseInt(jobsRes.rows[0].count, 10),
      pending_jobs_count: parseInt(pendingJobsRes.rows[0].count, 10),
      total_applications: parseInt(appsRes.rows[0].count, 10),
      total_shortlisted: parseInt(shortlistedRes.rows[0].count, 10),
      total_selected: parseInt(selectedRes.rows[0].count, 10),
      scheduled_interviews: parseInt(interviewsRes.rows[0].count, 10),
      total_placements: parseInt(placementsRes.rows[0].count, 10)
    };
  }

  /**
   * Get all students with details
   */
  async getAllStudents() {
    const { students } = await this.getStudentDirectory();
    return students;
  }

  async getStudentDirectory({ department, search } = {}) {
    const departmentFilters = [];
    const studentValues = [];

    if (department) {
      departmentFilters.push('s.department = ?');
      studentValues.push(department);
    }

    const normalizedSearch = typeof search === 'string' ? search.trim() : '';
    if (normalizedSearch) {
      departmentFilters.push('(u.name LIKE ? OR u.email LIKE ? OR s.enrollment_number LIKE ?)');
      const searchPattern = `%${normalizedSearch}%`;
      studentValues.push(searchPattern, searchPattern, searchPattern);
    }

    const studentWhere = departmentFilters.length ? `WHERE ${departmentFilters.join(' AND ')}` : '';
    const [departmentsRes, studentsRes] = await Promise.all([
      db.query(
        `SELECT department, COUNT(*) AS student_count
         FROM students
         GROUP BY department
         ORDER BY student_count DESC, department ASC`
      ),
      db.query(
        `SELECT
           s.*, u.name, u.email, u.created_at AS user_created_at,
           (SELECT JSON_ARRAYAGG(sk.skill_name)
            FROM student_skills sk
            WHERE sk.student_id = s.id) AS skills,
           (SELECT COUNT(*) FROM applications a WHERE a.student_id = s.id) AS applications_count,
           (SELECT COUNT(*) FROM applications a WHERE a.student_id = s.id AND a.status = 'selected') AS selected_count
         FROM students s
         JOIN users u ON s.user_id = u.id
         ${studentWhere}
         ORDER BY s.created_at DESC`,
        studentValues
      )
    ]);

    const totalStudents = departmentsRes.rows.reduce(
      (total, departmentRow) => total + Number(departmentRow.student_count),
      0
    );
    const departments = departmentsRes.rows.map(departmentRow => ({
      department: departmentRow.department,
      student_count: Number(departmentRow.student_count),
      percentage: totalStudents === 0
        ? 0
        : Number((Number(departmentRow.student_count) / totalStudents * 100).toFixed(1))
    }));

    return {
      students: studentsRes.rows,
      departments,
      total_students: totalStudents
    };
  }

  /**
   * Get all companies
   */
  async getAllCompanies() {
    const res = await db.query(
      `SELECT 
         c.*, u.name AS recruiter_name, u.email AS recruiter_email,
         COUNT(DISTINCT j.id) AS total_jobs_posted
       FROM companies c
       JOIN users u ON c.recruiter_id = u.id
       LEFT JOIN job_postings j ON c.id = j.company_id
       GROUP BY c.id, u.id
       ORDER BY c.created_at DESC`
    );
    return res.rows;
  }

  async getAllRecruiters() {
    const res = await db.query(
      `SELECT id, name, email, created_at
       FROM users
       WHERE role = 'recruiter'
       ORDER BY created_at DESC`
    );
    return res.rows;
  }

  async deleteCompany(companyId) {
    const result = await db.query('DELETE FROM companies WHERE id = ?', [companyId]);
    if (result.rowCount === 0) {
      const error = new Error('Company not found');
      error.status = 404;
      throw error;
    }
  }

  async updateCompanyStatus(companyId, status) {
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      const error = new Error('Invalid company status');
      error.status = 400;
      throw error;
    }

    const existing = await db.query('SELECT id FROM companies WHERE id = ?', [companyId]);
    if (existing.rowCount === 0) {
      const error = new Error('Company not found');
      error.status = 404;
      throw error;
    }

    await db.query(
      'UPDATE companies SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, companyId]
    );

    const company = await db.query(
      `SELECT c.*, u.name AS recruiter_name, u.email AS recruiter_email,
              (SELECT COUNT(*) FROM job_postings j WHERE j.company_id = c.id) AS total_jobs_posted
       FROM companies c
       JOIN users u ON c.recruiter_id = u.id
       WHERE c.id = ?`,
      [companyId]
    );
    return company.rows[0];
  }

  async deleteRecruiter(recruiterId) {
    const result = await db.query(
      "DELETE FROM users WHERE id = ? AND role = 'recruiter'",
      [recruiterId]
    );
    if (result.rowCount === 0) {
      const error = new Error('Recruiter not found');
      error.status = 404;
      throw error;
    }
  }

  /**
   * Get all jobs
   */
  async getAllJobs() {
    const res = await db.query(
      `SELECT 
         j.*, c.company_name, u.name AS recruiter_name, u.email AS recruiter_email,
         COUNT(DISTINCT a.id) AS applicants_count
       FROM job_postings j
       JOIN companies c ON j.company_id = c.id
       JOIN users u ON c.recruiter_id = u.id
       LEFT JOIN applications a ON j.id = a.job_id
       GROUP BY j.id, c.id, u.id
       ORDER BY j.created_at DESC`
    );
    return res.rows;
  }

  /**
   * Get all applications
   */
  async getAllApplications(recruiterUserId = null) {
    const res = await db.query(
      `SELECT 
         a.id AS application_id, a.status, a.applied_at,
         j.id AS job_id, j.title AS job_title, j.location AS job_location,
         c.company_name,
         u.name AS student_name, u.email AS student_email,
         s.department, s.cgpa, s.graduation_year
       FROM applications a
       JOIN job_postings j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       JOIN students s ON a.student_id = s.id
       JOIN users u ON s.user_id = u.id
       ${recruiterUserId ? 'WHERE c.recruiter_id = ?' : ''}
       ORDER BY a.applied_at DESC`,
      recruiterUserId ? [recruiterUserId] : []
    );
    return res.rows;
  }

  async getApplicationDirectory() {
    const [departmentsRes, applications] = await Promise.all([
      db.query(
        `SELECT department, COUNT(*) AS student_count
         FROM students
         GROUP BY department
         ORDER BY student_count DESC, department ASC`
      ),
      this.getAllApplications()
    ]);

    const totalStudents = departmentsRes.rows.reduce(
      (total, departmentRow) => total + Number(departmentRow.student_count),
      0
    );
    const departments = departmentsRes.rows.map(departmentRow => ({
      department: departmentRow.department,
      student_count: Number(departmentRow.student_count),
      percentage: totalStudents === 0
        ? 0
        : Number((Number(departmentRow.student_count) / totalStudents * 100).toFixed(1))
    }));

    return {
      applications,
      departments,
      total_students: totalStudents,
      total_applications: applications.length
    };
  }

  async getAllInterviews(recruiterUserId = null) {
    const res = await db.query(
      `SELECT i.id, i.application_id, i.round_name,
              DATE_FORMAT(i.scheduled_at, '%Y-%m-%dT%H:%i') AS scheduled_at,
              i.mode, i.location, i.meeting_link, i.notes, i.status,
              s.id AS student_id, u.name AS student_name, u.email AS student_email,
              j.title AS job_title, c.company_name
       FROM interview_schedules i
       JOIN applications a ON i.application_id = a.id
       JOIN students s ON a.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN job_postings j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       ${recruiterUserId ? 'WHERE c.recruiter_id = ?' : ''}
       ORDER BY i.scheduled_at ASC`,
      recruiterUserId ? [recruiterUserId] : []
    );
    return res.rows;
  }

  async saveInterview({ id, application_id, round_name, scheduled_at, mode, location, meeting_link, notes, status = 'scheduled' }, recruiterUserId = null) {
    const dateTime = typeof scheduled_at === 'string'
      ? /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(scheduled_at)
      : null;
    const datePart = dateTime?.[1];
    const validDate = datePart && new Date(`${datePart}T00:00:00Z`).toISOString().slice(0, 10) === datePart;
    const validTime = dateTime && Number(dateTime[2]) < 24 && Number(dateTime[3]) < 60 && Number(dateTime[4] || 0) < 60;

    if (!application_id || !round_name?.trim() || !validDate || !validTime) {
      const error = new Error('Application, round name, and a valid interview date/time are required');
      error.status = 400;
      throw error;
    }

    if (!['online', 'in_person'].includes(mode)) {
      const error = new Error('Interview mode must be online or in-person');
      error.status = 400;
      throw error;
    }

    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      const error = new Error('Invalid interview status');
      error.status = 400;
      throw error;
    }

    const application = await db.query(
      `SELECT a.id FROM applications a
       JOIN job_postings j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE a.id = ? ${recruiterUserId ? 'AND c.recruiter_id = ?' : ''}`,
      recruiterUserId ? [application_id, recruiterUserId] : [application_id]
    );
    if (application.rowCount === 0) {
      if (recruiterUserId) {
        const exists = await db.query('SELECT id FROM applications WHERE id = ?', [application_id]);
        if (exists.rowCount > 0) {
          const error = new Error('You can only manage applications for your own job postings');
          error.status = 403;
          throw error;
        }
      }
      const error = new Error('Application not found');
      error.status = 404;
      throw error;
    }

    const values = [
      application_id,
      round_name.trim(),
      scheduled_at.replace('T', ' '),
      mode,
      location?.trim() || null,
      meeting_link?.trim() || null,
      notes?.trim() || null,
      status
    ];

    let interviewId = id;
    if (id) {
      const existing = await db.query(
        `SELECT i.id FROM interview_schedules i
         JOIN applications a ON i.application_id = a.id
         JOIN job_postings j ON a.job_id = j.id
         JOIN companies c ON j.company_id = c.id
         WHERE i.id = ? ${recruiterUserId ? 'AND c.recruiter_id = ?' : ''}`,
        recruiterUserId ? [id, recruiterUserId] : [id]
      );
      if (existing.rowCount === 0) {
        if (recruiterUserId) {
          const exists = await db.query('SELECT id FROM interview_schedules WHERE id = ?', [id]);
          if (exists.rowCount > 0) {
            const error = new Error('You can only manage interviews for your own job postings');
            error.status = 403;
            throw error;
          }
        }
        const error = new Error('Interview schedule not found');
        error.status = 404;
        throw error;
      }

      await db.query(
        `UPDATE interview_schedules
         SET application_id = ?, round_name = ?, scheduled_at = ?, mode = ?,
             location = ?, meeting_link = ?, notes = ?, status = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [...values, id]
      );
    } else {
      const result = await db.query(
        `INSERT INTO interview_schedules
           (application_id, round_name, scheduled_at, mode, location, meeting_link, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        values
      );
      interviewId = result.insertId;
    }

    const interview = await this.getInterviewNotificationDetails(interviewId, recruiterUserId);
    const action = status === 'cancelled'
      ? 'cancelled'
      : status === 'completed'
        ? 'completed'
        : id
          ? 'updated'
          : 'scheduled';
    await emailNotificationService.sendInterviewNotification(interview, action);
    return interviewId;
  }

  async getInterviewNotificationDetails(id, recruiterUserId = null) {
    const result = await db.query(
      `SELECT u.name AS student_name, u.email AS student_email, i.round_name,
              DATE_FORMAT(i.scheduled_at, '%Y-%m-%d %H:%i') AS scheduled_at,
              i.mode, i.location, i.meeting_link, i.notes, i.status,
              j.title AS job_title, c.company_name
       FROM interview_schedules i
       JOIN applications a ON i.application_id = a.id
       JOIN students s ON a.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN job_postings j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE i.id = ? ${recruiterUserId ? 'AND c.recruiter_id = ?' : ''}`,
      recruiterUserId ? [id, recruiterUserId] : [id]
    );
    return result.rows[0];
  }

  async deleteInterview(id, recruiterUserId = null) {
    const interview = await this.getInterviewNotificationDetails(id, recruiterUserId);
    if (!interview) {
      if (recruiterUserId) {
        const exists = await db.query('SELECT id FROM interview_schedules WHERE id = ?', [id]);
        if (exists.rowCount > 0) {
          const error = new Error('You can only manage interviews for your own job postings');
          error.status = 403;
          throw error;
        }
      }
      const error = new Error('Interview schedule not found');
      error.status = 404;
      throw error;
    }
    const result = await db.query('DELETE FROM interview_schedules WHERE id = ?', [id]);
    if (result.rowCount === 0) {
      const error = new Error('Interview schedule not found');
      error.status = 404;
      throw error;
    }
    await emailNotificationService.sendInterviewNotification(interview, 'cancelled');
  }

  async getAllPlacementResults(recruiterUserId = null) {
    const res = await db.query(
      `SELECT p.id, p.application_id, p.result_status, p.package_amount,
              p.offer_date, p.notes,
              s.id AS student_id, u.name AS student_name, u.email AS student_email,
              j.title AS job_title, c.company_name
       FROM placement_results p
       JOIN applications a ON p.application_id = a.id
       JOIN students s ON a.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN job_postings j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       ${recruiterUserId ? 'WHERE c.recruiter_id = ?' : ''}
       ORDER BY p.updated_at DESC`,
      recruiterUserId ? [recruiterUserId] : []
    );
    return res.rows;
  }

  async savePlacementResult({ application_id, result_status, package_amount, offer_date, notes }, recruiterUserId = null) {
    if (!application_id || !['offered', 'accepted', 'declined'].includes(result_status)) {
      const error = new Error('Application and a valid placement result are required');
      error.status = 400;
      throw error;
    }

    const packageAmount = package_amount === '' || package_amount === undefined || package_amount === null
      ? null
      : Number(package_amount);
    if (packageAmount !== null && (!Number.isFinite(packageAmount) || packageAmount < 0)) {
      const error = new Error('Package amount must be a non-negative number');
      error.status = 400;
      throw error;
    }

    const validOfferDate = typeof offer_date === 'string'
      && /^\d{4}-\d{2}-\d{2}$/.test(offer_date)
      && new Date(`${offer_date}T00:00:00Z`).toISOString().slice(0, 10) === offer_date;
    if (offer_date && !validOfferDate) {
      const error = new Error('Offer date must be a valid date');
      error.status = 400;
      throw error;
    }

    const application = await db.query(
      `SELECT a.id FROM applications a
       JOIN job_postings j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE a.id = ? ${recruiterUserId ? 'AND c.recruiter_id = ?' : ''}`,
      recruiterUserId ? [application_id, recruiterUserId] : [application_id]
    );
    if (application.rowCount === 0) {
      if (recruiterUserId) {
        const exists = await db.query('SELECT id FROM applications WHERE id = ?', [application_id]);
        if (exists.rowCount > 0) {
          const error = new Error('You can only manage applications for your own job postings');
          error.status = 403;
          throw error;
        }
      }
      const error = new Error('Application not found');
      error.status = 404;
      throw error;
    }

    const existingResult = await db.query(
      `SELECT result_status, package_amount,
              DATE_FORMAT(offer_date, '%Y-%m-%d') AS offer_date, notes
       FROM placement_results WHERE application_id = ?`,
      [application_id]
    );
    await db.query(
      `INSERT INTO placement_results (application_id, result_status, package_amount, offer_date, notes)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         result_status = VALUES(result_status),
         package_amount = VALUES(package_amount),
         offer_date = VALUES(offer_date),
         notes = VALUES(notes),
         updated_at = CURRENT_TIMESTAMP`,
      [application_id, result_status, packageAmount, offer_date || null, notes?.trim() || null]
    );

    const result = await db.query('SELECT id FROM placement_results WHERE application_id = ?', [application_id]);
    const previousPackage = existingResult.rows[0]?.package_amount;
    const packageChanged = existingResult.rowCount > 0 && (
      (previousPackage === null) !== (packageAmount === null)
      || (previousPackage !== null && Number(previousPackage) !== packageAmount)
    );
    if (
      existingResult.rowCount === 0
      || existingResult.rows[0].result_status !== result_status
      || packageChanged
      || existingResult.rows[0].offer_date !== (offer_date || null)
      || existingResult.rows[0].notes !== (notes?.trim() || null)
    ) {
      const notificationDetails = await db.query(
        `SELECT u.name AS student_name, u.email AS student_email,
                p.result_status, p.package_amount, p.offer_date, p.notes,
                j.title AS job_title, c.company_name
         FROM placement_results p
         JOIN applications a ON p.application_id = a.id
         JOIN students s ON a.student_id = s.id
         JOIN users u ON s.user_id = u.id
         JOIN job_postings j ON a.job_id = j.id
         JOIN companies c ON j.company_id = c.id
         WHERE p.application_id = ?`,
        [application_id]
      );
      await emailNotificationService.sendPlacementResult(notificationDetails.rows[0]);
    }
    return result.rows[0].id;
  }

  async deletePlacementResult(id, recruiterUserId = null) {
    const result = await db.query(
      `DELETE p FROM placement_results p
       JOIN applications a ON p.application_id = a.id
       JOIN job_postings j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE p.id = ? ${recruiterUserId ? 'AND c.recruiter_id = ?' : ''}`,
      recruiterUserId ? [id, recruiterUserId] : [id]
    );
    if (result.rowCount === 0) {
      if (recruiterUserId) {
        const exists = await db.query('SELECT id FROM placement_results WHERE id = ?', [id]);
        if (exists.rowCount > 0) {
          const error = new Error('You can only manage results for your own job postings');
          error.status = 403;
          throw error;
        }
      }
      const error = new Error('Placement result not found');
      error.status = 404;
      throw error;
    }
  }

  /**
   * Admin approves/rejects job posting
   */
  async updateJobStatus(jobId, status) {
    if (!['pending', 'approved', 'rejected', 'closed'].includes(status)) {
      const error = new Error('Invalid job status');
      error.status = 400;
      throw error;
    }

    const exists = await db.query('SELECT id FROM job_postings WHERE id = ?', [jobId]);
    if (exists.rowCount === 0) {
      const error = new Error('Job posting not found');
      error.status = 404;
      throw error;
    }

    await db.query(
      `UPDATE job_postings
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?
       `,
      [status, jobId]
    );

    const updatedJob = await db.query('SELECT * FROM job_postings WHERE id = ?', [jobId]);
    return updatedJob.rows[0];
  }
}

module.exports = new AdminService();
