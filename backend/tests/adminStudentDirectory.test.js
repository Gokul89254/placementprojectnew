const assert = require('node:assert/strict');
const { test } = require('node:test');
const db = require('../src/config/db');
const adminService = require('../src/services/adminService');

test('returns actual department counts and filters student rows by department and search', async () => {
  const originalQuery = db.query;
  const queries = [];
  db.query = async (sql, params = []) => {
    queries.push({ sql, params });
    if (sql.includes('GROUP BY department')) {
      return {
        rows: [
          { department: 'Computer Science', student_count: 3 },
          { department: 'Information Technology', student_count: 1 }
        ],
        rowCount: 2
      };
    }
    return {
      rows: [{ id: 5, name: 'Ada Student', department: 'Computer Science' }],
      rowCount: 1
    };
  };

  try {
    const directory = await adminService.getStudentDirectory({
      department: 'Computer Science',
      search: 'Ada'
    });

    assert.equal(directory.total_students, 4);
    assert.deepEqual(directory.departments, [
      { department: 'Computer Science', student_count: 3, percentage: 75 },
      { department: 'Information Technology', student_count: 1, percentage: 25 }
    ]);
    assert.equal(directory.students.length, 1);
    assert.match(queries[1].sql, /s\.department = \?/);
    assert.match(queries[1].sql, /u\.name LIKE \? OR u\.email LIKE \? OR s\.enrollment_number LIKE \?/);
    assert.deepEqual(queries[1].params, [
      'Computer Science',
      '%Ada%',
      '%Ada%',
      '%Ada%'
    ]);
  } finally {
    db.query = originalQuery;
  }
});

test('returns application rows with registered-student department analytics', async () => {
  const originalQuery = db.query;
  const application = {
    application_id: 12,
    student_name: 'Ada Student',
    student_email: 'ada@example.com',
    department: 'Computer Science',
    company_name: 'Example Corp',
    job_title: 'Software Engineer'
  };

  db.query = async (sql) => {
    if (sql.includes('GROUP BY department')) {
      return {
        rows: [
          { department: 'Computer Science', student_count: 3 },
          { department: 'Information Technology', student_count: 1 }
        ],
        rowCount: 2
      };
    }

    return { rows: [application], rowCount: 1 };
  };

  try {
    const directory = await adminService.getApplicationDirectory();

    assert.equal(directory.total_students, 4);
    assert.equal(directory.total_applications, 1);
    assert.deepEqual(directory.departments, [
      { department: 'Computer Science', student_count: 3, percentage: 75 },
      { department: 'Information Technology', student_count: 1, percentage: 25 }
    ]);
    assert.deepEqual(directory.applications, [application]);
  } finally {
    db.query = originalQuery;
  }
});
