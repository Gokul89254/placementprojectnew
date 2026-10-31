const mysql = require('mysql2/promise');
require('dotenv').config();

const dbUrl = (process.env.DATABASE_URL || '').trim();
const pool = mysql.createPool(dbUrl || {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'placement_db',
  port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

function normalizeResult([result]) {
  if (Array.isArray(result)) {
    const rows = result.map(row => {
      for (const column of ['skills', 'required_skills', 'student_skills', 'interviews', 'placement_result']) {
        if (typeof row[column] === 'string') {
          row[column] = JSON.parse(row[column]).filter(value => value !== null);
        } else if (Array.isArray(row[column])) {
          row[column] = row[column].filter(value => value !== null);
        }
      }
      return row;
    });
    return { rows, rowCount: rows.length };
  }

  return {
    rows: [],
    rowCount: result.affectedRows,
    insertId: result.insertId
  };
}

function createConnectionAdapter(connection) {
  return {
    query: async (sql, params = []) => normalizeResult(await connection.query(sql, params)),
    release: () => connection.release()
  };
}

pool.on('error', (err) => {
  console.error('Unexpected error on idle MySQL connection:', err.message);
});

module.exports = {
  query: async (sql, params = []) => normalizeResult(await pool.query(sql, params)),
  pool: {
    connect: async () => createConnectionAdapter(await pool.getConnection()),
    end: () => pool.end()
  }
};
