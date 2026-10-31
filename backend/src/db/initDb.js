const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config();

function createConnectionConfig(database) {
    const dbUrl = (process.env.DATABASE_URL || '').trim();

    let config;

    if (dbUrl) {
        const url = new URL(dbUrl);

        config = {
            host: url.hostname,
            port: url.port ? parseInt(url.port, 10) : 3306,
            user: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password)
        };

        const databaseName = database === null
            ? undefined
            : database === undefined
                ? decodeURIComponent(url.pathname.slice(1))
                : database;

        if (databaseName) {
            config.database = databaseName;
        }
    } else {
        config = {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        };

        if (database) {
            config.database = database;
        }
    }

    if (process.env.DB_SSL === 'true') {
        config.ssl = {
            minVersion: 'TLSv1.2'
        };
    }

    return config;
}

async function executeScript(connection, script) {
    const statements = script
        .split(/;\s*(?:\r?\n|$)/)
        .map(statement => statement.trim())
        .filter(Boolean);

    for (const statement of statements) {
        await connection.query(statement);
    }
}

async function initializeDatabase() {
    let connection;

    try {
        const dbName = process.env.DB_NAME || 'placement_db';

        console.log('🔌 Connecting to TiDB...');

        const systemConnection = await mysql.createConnection(
            createConnectionConfig(null)
        );

        try {
            await systemConnection.query(
                `CREATE DATABASE IF NOT EXISTS \`${dbName.replace(/`/g, '``')}\``
            );

            console.log(`✅ Database ${dbName} is ready.`);
        } finally {
            await systemConnection.end();
        }

        connection = await mysql.createConnection(
            createConnectionConfig(dbName)
        );

        console.log('📄 Reading schema.sql...');

        const schemaPath = path.join(__dirname, 'schema.sql');

        await executeScript(
            connection,
            fs.readFileSync(schemaPath, 'utf8')
        );

        console.log('✅ Tables and constraints created successfully.');

        console.log('🌱 Reading seed.sql...');

        const seedPath = path.join(__dirname, 'seed.sql');

        await executeScript(
            connection,
            fs.readFileSync(seedPath, 'utf8')
        );

        console.log('✅ Demo data inserted successfully.');
        console.log('🎉 Database initialization complete!');

    } catch (err) {
        console.error('❌ Database initialization failed:', err.message);
        process.exitCode = 1;

    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initializeDatabase();