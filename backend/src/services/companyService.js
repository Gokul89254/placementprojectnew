const db = require('../config/db');
const emailNotificationService = require('./emailNotificationService');

class CompanyService {
  /**
   * Create a new company profile (Recruiter)
   */
  async createCompany(recruiterUserId, role, { company_name, description, website, location }) {
    if (!company_name) {
      const error = new Error('Company name is required');
      error.status = 400;
      throw error;
    }

    const existing = await db.query('SELECT id FROM companies WHERE recruiter_id = ?', [recruiterUserId]);
    if (existing.rowCount > 0) {
      const error = new Error('Each recruiter account can manage only one company profile');
      error.status = 409;
      throw error;
    }

    let res;
    try {
      res = await db.query(
        `INSERT INTO companies (recruiter_id, company_name, description, website, location, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [recruiterUserId, company_name.trim(), description || '', website || '', location || '', role === 'admin' ? 'approved' : 'pending']
      );
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const error = new Error('Each recruiter account can manage only one company profile');
        error.status = 409;
        throw error;
      }
      throw err;
    }

    const company = await db.query('SELECT * FROM companies WHERE id = ?', [res.insertId]);
    if (role === 'recruiter') {
      await this.notifyAdminsOfCompany(company.rows[0]);
    }
    return company.rows[0];
  }

  async notifyAdminsOfCompany(company) {
    const recruiterResult = await db.query(
      'SELECT name, email FROM users WHERE id = ?',
      [company.recruiter_id]
    );
    const adminUsers = await db.query("SELECT email FROM users WHERE role = 'admin'");
    const recruiter = recruiterResult.rows[0];
    await emailNotificationService.sendCompanyPendingReview({
      admin_emails: adminUsers.rows.map(admin => admin.email),
      company_id: company.id,
      company_name: company.company_name,
      recruiter_name: recruiter?.name || 'Recruiter',
      recruiter_email: recruiter?.email || '',
      location: company.location
    });
  }

  /**
   * Get list of all companies
   */
  async getAllCompanies() {
    const res = await db.query(
      `SELECT c.*, u.name AS recruiter_name, u.email AS recruiter_email,
              COUNT(j.id) AS active_jobs_count
       FROM companies c
       JOIN users u ON c.recruiter_id = u.id
       LEFT JOIN job_postings j ON c.id = j.company_id AND j.status = 'approved'
       WHERE c.status = 'approved'
       GROUP BY c.id, u.id
       ORDER BY c.created_at DESC`
    );
    return res.rows;
  }

  /**
   * Get single company by ID with its job postings
   */
  async getCompanyById(companyId) {
    const companyRes = await db.query(
      `SELECT c.*, u.name AS recruiter_name, u.email AS recruiter_email
       FROM companies c
       JOIN users u ON c.recruiter_id = u.id
       WHERE c.id = ?`,
      [companyId]
    );

    if (companyRes.rowCount === 0) {
      const error = new Error('Company not found');
      error.status = 404;
      throw error;
    }

    const company = companyRes.rows[0];

    // Fetch jobs
    const jobsRes = await db.query(
      `SELECT j.*,
              (SELECT JSON_ARRAYAGG(sk.skill_name)
               FROM job_required_skills sk
               WHERE sk.job_id = j.id) AS required_skills,
              COUNT(DISTINCT a.id) AS total_applications
       FROM job_postings j
       LEFT JOIN applications a ON j.id = a.job_id
       WHERE j.company_id = ?
       GROUP BY j.id
       ORDER BY j.created_at DESC`,
      [companyId]
    );

    company.jobs = jobsRes.rows;
    return company;
  }

  /**
   * Update company profile & recruiter credentials dynamically
   */
  async updateCompany(companyId, recruiterUserId, role, { recruiter_name, recruiter_email, company_name, description, website, location }) {
    // Check ownership
    const existing = await db.query('SELECT recruiter_id FROM companies WHERE id = ?', [companyId]);
    if (existing.rowCount === 0) {
      const error = new Error('Company not found');
      error.status = 404;
      throw error;
    }

    if (existing.rows[0].recruiter_id !== recruiterUserId && role !== 'admin') {
      const error = new Error('Forbidden. You do not own this company profile.');
      error.status = 403;
      throw error;
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Update recruiter user info if provided
      if (recruiter_name || recruiter_email) {
        if (recruiter_email) {
          const emailCheck = await client.query('SELECT id FROM users WHERE email = ? AND id != ?', [recruiter_email.toLowerCase().trim(), recruiterUserId]);
          if (emailCheck.rowCount > 0) {
            const error = new Error('Email address is already used by another account');
            error.status = 409;
            throw error;
          }
        }

        await client.query(
          `UPDATE users
           SET name = COALESCE(?, name),
               email = COALESCE(?, email),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [recruiter_name ? recruiter_name.trim() : null, recruiter_email ? recruiter_email.toLowerCase().trim() : null, recruiterUserId]
        );
      }

      // Update company fields
      await client.query(
        `UPDATE companies
         SET company_name = COALESCE(?, company_name),
             description = COALESCE(?, description),
             website = COALESCE(?, website),
             location = COALESCE(?, location),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [company_name, description, website, location, companyId]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return this.getCompanyById(companyId);
  }
}

module.exports = new CompanyService();
