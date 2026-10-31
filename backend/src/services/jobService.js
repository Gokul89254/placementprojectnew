const db = require('../config/db');
const emailNotificationService = require('./emailNotificationService');

class JobService {
  /**
   * Get filtered job postings
   */
  async getAllJobs(filters = {}, userRole = 'student') {
    const { search, location, minCgpa, skill, companyId, status } = filters;
    let queryValues = [];
    let whereClauses = [];

    // Filter status: Students see approved jobs only, recruiters see their status, admins can see all
    if (userRole === 'student') {
      whereClauses.push(`j.status = 'approved'`);
      whereClauses.push(`c.status = 'approved'`);
    } else if (status) {
      queryValues.push(status);
      whereClauses.push('j.status = ?');
    }

    if (search) {
      whereClauses.push('(LOWER(j.title) LIKE LOWER(?) OR LOWER(j.description) LIKE LOWER(?) OR LOWER(c.company_name) LIKE LOWER(?))');
      queryValues.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (location) {
      queryValues.push(`%${location}%`);
      whereClauses.push('LOWER(j.location) LIKE LOWER(?)');
    }

    if (minCgpa) {
      queryValues.push(parseFloat(minCgpa));
      whereClauses.push('j.minimum_cgpa <= ?');
    }

    if (companyId) {
      queryValues.push(parseInt(companyId, 10));
      whereClauses.push('j.company_id = ?');
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT 
        j.*,
        c.company_name,
        c.website AS company_website,
        c.location AS company_location,
        (SELECT JSON_ARRAYAGG(sk.skill_name)
         FROM job_required_skills sk
         WHERE sk.job_id = j.id) AS required_skills,
        COUNT(DISTINCT a.id) AS total_applications
      FROM job_postings j
      JOIN companies c ON j.company_id = c.id
      LEFT JOIN applications a ON j.id = a.job_id
      ${whereString}
      GROUP BY j.id, c.id
      ORDER BY j.created_at DESC
    `;

    const res = await db.query(sql, queryValues);
    let jobs = res.rows;

    // Filter by skill if requested
    if (skill) {
      const searchSkill = skill.toLowerCase();
      jobs = jobs.filter(j => 
        j.required_skills && j.required_skills.some(s => s.toLowerCase().includes(searchSkill))
      );
    }

    return jobs;
  }

  /**
   * Get job by ID with detailed required skills
   */
  async getJobById(jobId) {
    const sql = `
      SELECT 
        j.*,
        c.id AS company_id,
        c.company_name,
        c.description AS company_description,
        c.website AS company_website,
        c.location AS company_location,
        c.recruiter_id,
        (SELECT JSON_ARRAYAGG(sk.skill_name)
         FROM job_required_skills sk
         WHERE sk.job_id = j.id) AS required_skills
        FROM job_postings j
        JOIN companies c ON j.company_id = c.id
        WHERE j.id = ?
    `;

    const res = await db.query(sql, [jobId]);
    if (res.rowCount === 0) {
      const error = new Error('Job posting not found');
      error.status = 404;
      throw error;
    }

    return res.rows[0];
  }

  /**
   * Create new job posting (Recruiter)
   */
  async createJob(recruiterUserId, role, { company_id, title, description, location, employment_type, minimum_cgpa, expected_package, graduation_year, deadline, required_skills }) {
    if (!company_id || !title || !description || !location || !graduation_year || !deadline) {
      const error = new Error('Missing required job fields');
      error.status = 400;
      throw error;
    }

    const expectedPackage = expected_package === '' || expected_package === undefined || expected_package === null
      ? null
      : Number(expected_package);
    if (expectedPackage !== null && (!Number.isFinite(expectedPackage) || expectedPackage < 0)) {
      const error = new Error('Expected package must be a non-negative annual amount');
      error.status = 400;
      throw error;
    }

    // Verify company ownership
    const companyRes = await db.query('SELECT recruiter_id, status FROM companies WHERE id = ?', [company_id]);
    if (companyRes.rowCount === 0) {
      const error = new Error('Specified company does not exist');
      error.status = 404;
      throw error;
    }

    if (companyRes.rows[0].recruiter_id !== recruiterUserId && role !== 'admin') {
      const error = new Error('Forbidden. You do not own this company profile.');
      error.status = 403;
      throw error;
    }
    if (role === 'recruiter' && companyRes.rows[0].status !== 'approved') {
      const error = new Error('Your company profile must be approved by an admin before posting jobs');
      error.status = 409;
      throw error;
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const jobStatus = role === 'admin' ? 'approved' : 'pending';

      const jobRes = await client.query(
        `INSERT INTO job_postings (company_id, title, description, location, employment_type, minimum_cgpa, expected_package, graduation_year, deadline, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         `,
        [
          company_id,
          title.trim(),
          description.trim(),
          location.trim(),
          employment_type || 'Full-Time',
          minimum_cgpa ? parseFloat(minimum_cgpa) : 0.00,
          expectedPackage,
          parseInt(graduation_year, 10),
          deadline,
          jobStatus
        ]
      );

      const insertedJob = await client.query('SELECT * FROM job_postings WHERE id = ?', [jobRes.insertId]);
      const newJob = insertedJob.rows[0];

      if (Array.isArray(required_skills)) {
        for (const skill of required_skills) {
          if (skill && skill.trim()) {
            await client.query(
              `INSERT IGNORE INTO job_required_skills (job_id, skill_name) VALUES (?, ?)`,
              [newJob.id, skill.trim()]
            );
          }
        }
      }

      await client.query('COMMIT');
      const createdJob = await this.getJobById(newJob.id);
      if (role === 'recruiter') {
        const admins = await db.query("SELECT email FROM users WHERE role = 'admin'");
        await emailNotificationService.sendJobPendingReview({
          admin_emails: admins.rows.map(admin => admin.email),
          job_id: createdJob.id,
          job_title: createdJob.title,
          company_name: createdJob.company_name,
          location: createdJob.location,
          deadline: createdJob.deadline
        });
      }
      return createdJob;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update existing job posting
   */
  async updateJob(jobId, recruiterUserId, role, { title, description, location, employment_type, minimum_cgpa, expected_package, graduation_year, deadline, status, required_skills }) {
    const job = await this.getJobById(jobId);

    if (job.recruiter_id !== recruiterUserId && role !== 'admin') {
      const error = new Error('Forbidden. You do not own this job posting.');
      error.status = 403;
      throw error;
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const expectedPackage = expected_package === undefined
        ? job.expected_package
        : expected_package === '' || expected_package === null
          ? null
          : Number(expected_package);
      if (expectedPackage !== null && (!Number.isFinite(expectedPackage) || expectedPackage < 0)) {
        const error = new Error('Expected package must be a non-negative annual amount');
        error.status = 400;
        throw error;
      }

      await client.query(
        `UPDATE job_postings
         SET title = COALESCE(?, title),
             description = COALESCE(?, description),
             location = COALESCE(?, location),
             employment_type = COALESCE(?, employment_type),
             minimum_cgpa = COALESCE(?, minimum_cgpa),
             expected_package = ?,
             graduation_year = COALESCE(?, graduation_year),
             deadline = COALESCE(?, deadline),
             status = COALESCE(?, status),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [title, description, location, employment_type, minimum_cgpa, expectedPackage, graduation_year, deadline, status, jobId]
      );

      if (Array.isArray(required_skills)) {
        await client.query('DELETE FROM job_required_skills WHERE job_id = ?', [jobId]);
        for (const skill of required_skills) {
          if (skill && skill.trim()) {
            await client.query(
              `INSERT IGNORE INTO job_required_skills (job_id, skill_name) VALUES (?, ?)`,
              [jobId, skill.trim()]
            );
          }
        }
      }

      await client.query('COMMIT');
      return this.getJobById(jobId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Delete or close job posting
   */
  async deleteJob(jobId, recruiterUserId, role) {
    const job = await this.getJobById(jobId);
    if (job.recruiter_id !== recruiterUserId && role !== 'admin') {
      const error = new Error('Forbidden. You do not own this job posting.');
      error.status = 403;
      throw error;
    }

    await db.query('DELETE FROM job_postings WHERE id = ?', [jobId]);
    return { id: jobId, message: 'Job posting deleted successfully' };
  }

  /**
   * Server-side eligibility engine calculation
   */
  async checkEligibility(jobId, studentUserId) {
    // 1. Fetch Job
    const job = await this.getJobById(jobId);

    // 2. Fetch Student Profile & Skills
    const studentRes = await db.query(
      `SELECT s.*, u.name, u.email
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = ?`,
      [studentUserId]
    );

    if (studentRes.rowCount === 0) {
      const error = new Error('Student profile not found');
      error.status = 404;
      throw error;
    }

    const student = studentRes.rows[0];

    const skillsRes = await db.query(
      `SELECT skill_name FROM student_skills WHERE student_id = ?`,
      [student.id]
    );
    const studentSkills = skillsRes.rows.map(r => r.skill_name.toLowerCase());

    const reasons = [];

    // Check 1: CGPA
    const studentCgpa = parseFloat(student.cgpa);
    const requiredCgpa = parseFloat(job.minimum_cgpa);
    if (studentCgpa < requiredCgpa) {
      reasons.push(`Student CGPA (${studentCgpa.toFixed(2)}) is below the minimum requirement (${requiredCgpa.toFixed(2)})`);
    }

    // Check 2: Graduation Year
    const studentYear = parseInt(student.graduation_year, 10);
    const requiredYear = parseInt(job.graduation_year, 10);
    if (studentYear !== requiredYear) {
      reasons.push(`Student graduation year (${studentYear}) does not match the target batch (${requiredYear})`);
    }

    // Check 3: Skills Match
    const requiredSkills = job.required_skills ? job.required_skills.map(s => s.toLowerCase()) : [];
    const missingSkills = requiredSkills.filter(reqSkill => !studentSkills.includes(reqSkill));

    if (missingSkills.length > 0) {
      const missingFormatted = job.required_skills.filter(s => missingSkills.includes(s.toLowerCase()));
      reasons.push(`Missing required skill(s): ${missingFormatted.join(', ')}`);
    }

    // Check 4: Deadline check
    const deadlineDate = new Date(job.deadline);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (deadlineDate < currentDate) {
      reasons.push(`The application deadline (${job.deadline.toISOString ? job.deadline.toISOString().split('T')[0] : job.deadline}) has passed`);
    }

    // Check 5: Job status check
    if (job.status !== 'approved') {
      reasons.push(`Job posting is currently ${job.status} and not accepting applications`);
    }

    const eligible = reasons.length === 0;

    return {
      eligible,
      reasons,
      student_id: student.id,
      student_cgpa: studentCgpa,
      required_cgpa: requiredCgpa,
      student_graduation_year: studentYear,
      required_graduation_year: requiredYear,
      student_skills: skillsRes.rows.map(r => r.skill_name),
      required_skills: job.required_skills || [],
      missing_skills: job.required_skills ? job.required_skills.filter(s => missingSkills.includes(s.toLowerCase())) : []
    };
  }
}

module.exports = new JobService();
