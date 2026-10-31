const assert = require('node:assert/strict');
const { test } = require('node:test');
const db = require('../src/config/db');
const emailNotificationService = require('../src/services/emailNotificationService');
const companyService = require('../src/services/companyService');

test('creates a pending recruiter company and notifies admins', async () => {
  const originalQuery = db.query;
  const originalNotification = emailNotificationService.sendCompanyPendingReview;
  const queries = [];
  let notification;

  db.query = async (sql, params = []) => {
    queries.push({ sql, params });
    if (sql.includes('SELECT id FROM companies')) return { rows: [], rowCount: 0 };
    if (sql.includes('INSERT INTO companies')) return { rows: [], rowCount: 1, insertId: 17 };
    if (sql.includes('SELECT * FROM companies')) {
      return {
        rows: [{
          id: 17,
          recruiter_id: 5,
          company_name: 'Example Company',
          location: 'Remote',
          status: 'pending'
        }],
        rowCount: 1
      };
    }
    if (sql.includes('SELECT name, email FROM users')) {
      return { rows: [{ name: 'Alex Recruiter', email: 'recruiter@example.test' }], rowCount: 1 };
    }
    if (sql.includes("WHERE role = 'admin'")) {
      return { rows: [{ email: 'admin@example.test' }], rowCount: 1 };
    }
    throw new Error(`Unexpected SQL in test: ${sql}`);
  };
  emailNotificationService.sendCompanyPendingReview = async details => {
    notification = details;
  };

  try {
    const company = await companyService.createCompany(5, 'recruiter', {
      company_name: 'Example Company',
      location: 'Remote'
    });

    assert.equal(company.status, 'pending');
    assert.equal(queries[1].params[5], 'pending');
    assert.deepEqual(notification.admin_emails, ['admin@example.test']);
    assert.equal(notification.company_id, 17);
    assert.equal(notification.recruiter_email, 'recruiter@example.test');
  } finally {
    db.query = originalQuery;
    emailNotificationService.sendCompanyPendingReview = originalNotification;
  }
});
