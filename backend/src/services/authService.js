const bcrypt = require('bcryptjs');
const db = require('../config/db');
const emailNotificationService = require('./emailNotificationService');
const { generateToken } = require('../utils/token');

class AuthService {
  /**
   * Register a new student or recruiter account.
   */
  async register({ name, email, password, role, enrollment_number, department, graduation_year, cgpa, company_name }) {
    if (!['student', 'recruiter'].includes(role)) {
      const error = new Error('Only student and recruiter accounts can register');
      error.status = 400;
      throw error;
    }

    // 1. Check duplicate email
    const existingUser = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser.rowCount > 0) {
      const error = new Error('Email address is already registered');
      error.status = 409;
      throw error;
    }

    // 2. Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 3. Begin database transaction
    const client = await db.pool.connect();
    let createdCompanyId = null;
    try {
      await client.query('BEGIN');

      // Insert User
      const userInsert = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES (?, ?, ?, ?)`,
        [name.trim(), email.toLowerCase().trim(), password_hash, role]
      );
      const userRes = await client.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [userInsert.insertId]
      );
      const newUser = userRes.rows[0];

      // If Student, create student profile
      if (role === 'student') {
        const enrollNum = enrollment_number || `EN${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
        const dept = department || 'General Engineering';
        const gradYear = graduation_year ? parseInt(graduation_year, 10) : new Date().getFullYear() + 1;
        const studentCgpa = cgpa ? parseFloat(cgpa) : 0.00;

        await client.query(
          `INSERT INTO students (user_id, enrollment_number, department, graduation_year, cgpa)
           VALUES (?, ?, ?, ?, ?)`,
          [newUser.id, enrollNum, dept, gradYear, studentCgpa]
        );
      }

      // If Recruiter, create initial company profile if provided
      if (role === 'recruiter' && company_name) {
        const companyInsert = await client.query(
          `INSERT INTO companies (recruiter_id, company_name, description, location, status)
           VALUES (?, ?, ?, ?, 'pending')`,
          [newUser.id, company_name.trim(), 'Company profile created upon recruiter registration.', 'To be updated']
        );
        createdCompanyId = companyInsert.insertId;
      }

      await client.query('COMMIT');

      if (createdCompanyId) {
        const admins = await db.query("SELECT email FROM users WHERE role = 'admin'");
        await emailNotificationService.sendCompanyPendingReview({
          admin_emails: admins.rows.map(admin => admin.email),
          company_id: createdCompanyId,
          company_name: company_name.trim(),
          recruiter_name: newUser.name,
          recruiter_email: newUser.email,
          location: 'To be updated'
        });
      }

      // 4. Generate JWT Token
      const token = generateToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      });

      return {
        token,
        user: newUser
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Login user with credentials
   */
  async login({ email, password }) {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.status = 400;
      throw error;
    }

    // 1. Find user by email
    const res = await db.query(
      `SELECT id, name, email, password_hash, role FROM users WHERE email = ?`,
      [email.toLowerCase().trim()]
    );

    if (res.rowCount === 0) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    const user = res.rows[0];

    // 2. Compare password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    // 3. Generate Token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  /**
   * Fetch details of currently authenticated user
   */
  async getMe(userId) {
    const userRes = await db.query(
      `SELECT id, name, email, role, created_at FROM users WHERE id = ?`,
      [userId]
    );

    if (userRes.rowCount === 0) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    const user = userRes.rows[0];

    // Enrich response based on role
    if (user.role === 'student') {
      const studentRes = await db.query(
        `SELECT s.*,
                (SELECT JSON_ARRAYAGG(sk.skill_name)
                 FROM student_skills sk
                 WHERE sk.student_id = s.id) AS skills
         FROM students s
         WHERE s.user_id = ?`,
        [userId]
      );
      user.student_profile = studentRes.rows[0] || null;
    } else if (user.role === 'recruiter') {
      const companyRes = await db.query(
        `SELECT * FROM companies WHERE recruiter_id = ?`,
        [userId]
      );
      user.companies = companyRes.rows;
    }

    return user;
  }
}

module.exports = new AuthService();
