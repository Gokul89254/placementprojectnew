const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { test } = require('node:test');
const db = require('../src/config/db');
const adminService = require('../src/services/adminService');
const authService = require('../src/services/authService');
const { requireMajorAdmin } = require('../src/middleware/authMiddleware');

test('changes admin password only after verifying the current password', async () => {
  const originalQuery = db.query;
  const currentHash = await bcrypt.hash('current-password', 4);
  let savedHash;
  db.query = async (sql, params = []) => {
    if (sql.startsWith('SELECT password_hash')) {
      return { rows: [{ password_hash: currentHash }], rowCount: 1 };
    }
    if (sql.startsWith('UPDATE users SET password_hash')) {
      [savedHash] = params;
      return { rows: [], rowCount: 1 };
    }
    throw new Error(`Unexpected query: ${sql}`);
  };

  try {
    await assert.rejects(
      adminService.changeAdminPassword(7, { current_password: 'wrong-password', new_password: 'new-password-123' }),
      { status: 401, message: 'Current password is incorrect' }
    );
    assert.equal(savedHash, undefined);

    await adminService.changeAdminPassword(7, { current_password: 'current-password', new_password: 'new-password-123' });
    assert.equal(await bcrypt.compare('new-password-123', savedHash), true);
  } finally {
    db.query = originalQuery;
  }
});

test('creates a new admin with a hashed password and normalized email', async () => {
  const originalQuery = db.query;
  const queries = [];
  db.query = async (sql, params = []) => {
    queries.push({ sql, params });
    if (sql.startsWith('SELECT id FROM users WHERE email')) return { rows: [], rowCount: 0 };
    if (sql.startsWith('INSERT INTO users')) return { rows: [], rowCount: 1, insertId: 25 };
    throw new Error(`Unexpected query: ${sql}`);
  };

  try {
    const admin = await adminService.createAdmin({
      name: ' New Admin ',
      email: ' New.Admin@Example.com ',
      password: 'secure-password-123'
    });

    assert.deepEqual(admin, {
      id: 25,
      name: 'New Admin',
      email: 'new.admin@example.com',
      role: 'admin'
    });
    assert.match(queries[1].sql, /'admin'/);
    assert.equal(queries[1].params[0], 'New Admin');
    assert.equal(queries[1].params[1], 'new.admin@example.com');
    assert.equal(await bcrypt.compare('secure-password-123', queries[1].params[2]), true);
  } finally {
    db.query = originalQuery;
  }
});

test('lists admin accounts without exposing password data', async () => {
  const originalQuery = db.query;
  const admins = [{ id: 1, name: 'Major Admin', email: 'gokulravi89254@gmail.com', created_at: '2026-01-01' }];
  db.query = async (sql) => {
    assert.match(sql, /SELECT id, name, email, created_at/);
    assert.doesNotMatch(sql, /password_hash/);
    return { rows: admins, rowCount: admins.length };
  };

  try {
    assert.deepEqual(await adminService.getAllAdmins(), admins);
  } finally {
    db.query = originalQuery;
  }
});

test('deletes other admins but protects the major admin account', async () => {
  const originalQuery = db.query;
  const queries = [];
  db.query = async (sql, params = []) => {
    queries.push({ sql, params });
    if (sql.startsWith('DELETE FROM users')) {
      return { rows: [], rowCount: params[0] === 2 ? 1 : 0 };
    }
    if (sql.startsWith('SELECT email FROM users')) {
      return {
        rows: params[0] === 1 ? [{ email: 'gokulravi89254@gmail.com' }] : [],
        rowCount: params[0] === 1 ? 1 : 0
      };
    }
    throw new Error(`Unexpected query: ${sql}`);
  };

  try {
    await adminService.deleteAdmin(2);
    assert.match(queries[0].sql, /LOWER\(email\) <> \?/);
    assert.equal(queries[0].params[1], 'gokulravi89254@gmail.com');

    await assert.rejects(adminService.deleteAdmin(1), {
      status: 403,
      message: 'The major administrator account cannot be deleted'
    });
    await assert.rejects(adminService.deleteAdmin(3), {
      status: 404,
      message: 'Admin account not found'
    });
  } finally {
    db.query = originalQuery;
  }
});

test('updates other admin details but protects the major admin account', async () => {
  const originalQuery = db.query;
  const queries = [];
  db.query = async (sql, params = []) => {
    queries.push({ sql, params });
    if (sql.startsWith('SELECT email FROM users WHERE id')) {
      return {
        rows: params[0] === 1
          ? [{ email: 'gokulravi89254@gmail.com' }]
          : [{ email: 'other.admin@example.com' }],
        rowCount: 1
      };
    }
    if (sql.startsWith('SELECT id FROM users WHERE email')) return { rows: [], rowCount: 0 };
    if (sql.startsWith('UPDATE users SET name')) return { rows: [], rowCount: 1 };
    if (sql.startsWith('SELECT id, name, email, created_at')) {
      return {
        rows: [{ id: 2, name: 'Updated Admin', email: 'updated@example.com', created_at: '2026-01-01' }],
        rowCount: 1
      };
    }
    throw new Error(`Unexpected query: ${sql}`);
  };

  try {
    assert.deepEqual(
      await adminService.updateAdmin(2, { name: ' Updated Admin ', email: ' Updated@Example.com ' }),
      { id: 2, name: 'Updated Admin', email: 'updated@example.com', created_at: '2026-01-01' }
    );
    assert.deepEqual(queries[2].params, [
      'Updated Admin',
      'updated@example.com',
      2,
      'gokulravi89254@gmail.com'
    ]);

    await assert.rejects(
      adminService.updateAdmin(1, { name: 'Changed Major', email: 'changed@example.com' }),
      { status: 403, message: 'The major administrator account cannot be changed' }
    );
  } finally {
    db.query = originalQuery;
  }
});

test('only the configured major admin can access admin management actions', () => {
  const invoke = user => {
    const result = { nextCalled: false, statusCode: null, body: null };
    const res = {
      status(statusCode) {
        result.statusCode = statusCode;
        return this;
      },
      json(body) {
        result.body = body;
        return this;
      }
    };
    requireMajorAdmin({ user }, res, () => { result.nextCalled = true; });
    return result;
  };

  assert.equal(invoke({ role: 'admin', email: 'GokulRavi89254@gmail.com' }).nextCalled, true);
  const denied = invoke({ role: 'admin', email: 'other.admin@example.com' });
  assert.equal(denied.statusCode, 403);
  assert.deepEqual(denied.body.errors, ['MAJOR_ADMIN_REQUIRED']);
});

test('public registration cannot create admin accounts', async () => {
  await assert.rejects(
    authService.register({
      name: 'Unauthorized Admin',
      email: 'unauthorized@example.com',
      password: 'secure-password-123',
      role: 'admin'
    }),
    { status: 400, message: 'Only student and recruiter accounts can register' }
  );
});
