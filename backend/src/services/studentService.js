const db = require('../config/db');

class StudentService {
  /**
   * Get student profile & summary by user ID
   */
  async getStudentProfile(userId) {
    const studentRes = await db.query(
      `SELECT s.*, u.name, u.email
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = ?`,
      [userId]
    );

    if (studentRes.rowCount === 0) {
      const error = new Error('Student profile not found');
      error.status = 404;
      throw error;
    }

    const student = studentRes.rows[0];

    // Fetch skills
    const skillsRes = await db.query(
      `SELECT skill_name FROM student_skills WHERE student_id = ? ORDER BY skill_name ASC`,
      [student.id]
    );
    student.skills = skillsRes.rows.map(r => r.skill_name);

    // Fetch application summary stats
    const statsRes = await db.query(
      `SELECT 
         COUNT(*) AS total_applications,
         COALESCE(SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END), 0) AS shortlisted_count,
         COALESCE(SUM(CASE WHEN status = 'selected' THEN 1 ELSE 0 END), 0) AS selected_count,
         COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) AS rejected_count,
         COALESCE(SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END), 0) AS pending_count
       FROM applications
       WHERE student_id = ?`,
      [student.id]
    );

    student.stats = {
      total_applications: parseInt(statsRes.rows[0].total_applications, 10),
      shortlisted_count: parseInt(statsRes.rows[0].shortlisted_count, 10),
      selected_count: parseInt(statsRes.rows[0].selected_count, 10),
      rejected_count: parseInt(statsRes.rows[0].rejected_count, 10),
      pending_count: parseInt(statsRes.rows[0].pending_count, 10)
    };

    return student;
  }

  /**
   * Update student profile, user credentials & skills list dynamically
   */
  async updateStudentProfile(userId, { name, email, phone, enrollment_number, department, graduation_year, cgpa, resume_url, skills }) {
    const studentRes = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
    if (studentRes.rowCount === 0) {
      const error = new Error('Student profile not found');
      error.status = 404;
      throw error;
    }

    const studentId = studentRes.rows[0].id;
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Update users table (name, email)
      if (name !== undefined || email !== undefined) {
        if (email && email.trim()) {
          const emailCheck = await client.query('SELECT id FROM users WHERE email = ? AND id != ?', [email.toLowerCase().trim(), userId]);
          if (emailCheck.rowCount > 0) {
            const error = new Error('Email address is already used by another account');
            error.status = 409;
            throw error;
          }
        }

        const nameVal = name !== undefined && name !== null ? name.trim() : null;
        const emailVal = email !== undefined && email !== null ? email.toLowerCase().trim() : null;

        await client.query(
          `UPDATE users
           SET name = COALESCE(?, name),
               email = COALESCE(?, email),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [nameVal || null, emailVal || null, userId]
        );
      }

      // 2. Parse & sanitize student fields
      const phoneVal = phone !== undefined ? phone.toString().trim() : null;
      const enrollVal = enrollment_number !== undefined ? enrollment_number.toString().trim() : null;
      const deptVal = department !== undefined ? department.toString().trim() : null;
      const gradVal = graduation_year !== undefined && graduation_year !== '' ? parseInt(graduation_year, 10) : null;
      const cgpaVal = cgpa !== undefined && cgpa !== '' ? parseFloat(cgpa) : null;
      const resumeVal = resume_url !== undefined ? resume_url.toString().trim() : null;

      await client.query(
        `UPDATE students 
         SET phone = COALESCE(?, phone),
             enrollment_number = COALESCE(?, enrollment_number),
             department = COALESCE(?, department),
             graduation_year = COALESCE(?, graduation_year),
             cgpa = COALESCE(?, cgpa),
             resume_url = COALESCE(?, resume_url),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [phoneVal, enrollVal, deptVal, gradVal, cgpaVal, resumeVal, studentId]
      );

      // 3. Update student_skills tags
      if (Array.isArray(skills)) {
        await client.query('DELETE FROM student_skills WHERE student_id = ?', [studentId]);

        for (const skill of skills) {
          if (skill && skill.toString().trim()) {
            await client.query(
              'INSERT IGNORE INTO student_skills (student_id, skill_name) VALUES (?, ?)',
              [studentId, skill.toString().trim()]
            );
          }
        }
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return this.getStudentProfile(userId);
  }

  /**
   * Get all job applications for current student
   */
  async getStudentApplications(userId) {
    const studentRes = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
    if (studentRes.rowCount === 0) {
      const error = new Error('Student profile not found');
      error.status = 404;
      throw error;
    }

    const studentId = studentRes.rows[0].id;

    const appsRes = await db.query(
      `SELECT 
         a.id AS application_id,
         a.status,
         a.applied_at,
         a.updated_at,
         j.id AS job_id,
         j.title AS job_title,
         j.location AS job_location,
         j.employment_type,
         j.minimum_cgpa,
         j.deadline,
         c.id AS company_id,
         c.company_name,
         (SELECT JSON_ARRAYAGG(JSON_OBJECT(
           'id', i.id,
           'round_name', i.round_name,
           'scheduled_at', DATE_FORMAT(i.scheduled_at, '%Y-%m-%dT%H:%i'),
           'mode', i.mode,
           'location', i.location,
           'meeting_link', i.meeting_link,
           'status', i.status
         ))
          FROM interview_schedules i
          WHERE i.application_id = a.id) AS interviews,
         (SELECT JSON_OBJECT(
           'result_status', p.result_status,
           'package_amount', p.package_amount,
           'offer_date', p.offer_date,
           'notes', p.notes
         )
          FROM placement_results p
          WHERE p.application_id = a.id) AS placement_result
       FROM applications a
       JOIN job_postings j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.applied_at DESC`,
      [studentId]
    );

    return appsRes.rows;
  }
}

module.exports = new StudentService();
