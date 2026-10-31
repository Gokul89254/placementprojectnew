
require('dotenv').config();

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'placement_db',
    port: Number(process.env.DB_PORT) || 3306,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true,

    ssl: process.env.DB_SSL === 'true'
        ? { minVersion: 'TLSv1.2' }
        : undefined
});

function normalizeResult([result]) {
    if (Array.isArray(result)) {
        const rows = result.map(row => {
            for (const column of [
                'skills',
                'required_skills',
                'student_skills',
                'interviews',
                'placement_result'
            ]) {
                if (typeof row[column] === 'string') {
                    try {
                        row[column] = JSON.parse(row[column])
                            .filter(value => value !== null);
                    } catch (error) {
                        console.error(`Could not parse ${column}:`, error.message);
                    }
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
        query: async (sql, params = []) =>
            normalizeResult(await connection.query(sql, params)),

        release: () => connection.release()
    };
}

pool.on('error', (err) => {
    console.error('Unexpected error on idle MySQL connection:', err.message);
});

module.exports = {
    query: async (sql, params = []) =>
        normalizeResult(await pool.query(sql, params)),

    pool: {
        connect: async () =>
            createConnectionAdapter(await pool.getConnection()),

        end: () => pool.end()
    }
};
