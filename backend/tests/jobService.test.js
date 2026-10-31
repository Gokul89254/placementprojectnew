const assert = require('node:assert/strict');
const { test } = require('node:test');
const db = require('../src/config/db');
const jobService = require('../src/services/jobService');

test('persists and returns an updated expected job package', async () => {
  const originalGetJobById = jobService.getJobById;
  const originalConnect = db.pool.connect;
  let savedPackage = null;
  let updateParameters;

  jobService.getJobById = async id => ({
    id,
    recruiter_id: 7,
    expected_package: savedPackage
  });
  db.pool.connect = async () => ({
    query: async (sql, parameters = []) => {
      if (sql.includes('UPDATE job_postings')) {
        updateParameters = parameters;
        savedPackage = parameters[5];
      }
      return { rows: [], rowCount: 1 };
    },
    release: () => {}
  });

  try {
    const updatedJob = await jobService.updateJob(42, 7, 'recruiter', {
      expected_package: '8.50'
    });

    assert.equal(updateParameters[5], 8.5);
    assert.equal(updatedJob.expected_package, 8.5);
  } finally {
    jobService.getJobById = originalGetJobById;
    db.pool.connect = originalConnect;
  }
});
