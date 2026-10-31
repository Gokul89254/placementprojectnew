const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runMigrations() {
  try {
    await db.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         migration_name VARCHAR(255) PRIMARY KEY,
         applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`
    );

    const migrationsDirectory = path.join(__dirname, 'migrations');
    const migrations = fs.readdirSync(migrationsDirectory)
      .filter(file => file.endsWith('.sql'))
      .sort();

    const client = await db.pool.connect();
    try {
      for (const migrationName of migrations) {
        const existing = await client.query(
          'SELECT migration_name FROM schema_migrations WHERE migration_name = ?',
          [migrationName]
        );
        if (existing.rowCount > 0) continue;

        const migrationPath = path.join(migrationsDirectory, migrationName);
        const statements = fs.readFileSync(migrationPath, 'utf8')
          .split(/;\s*(?:\r?\n|$)/)
          .map(statement => statement.trim())
          .filter(Boolean);

        for (const statement of statements) {
          if (/ADD CONSTRAINT uq_companies_recruiter UNIQUE/i.test(statement)) {
            const index = await client.query(
              `SELECT index_name FROM information_schema.statistics
               WHERE table_schema = DATABASE()
                 AND table_name = 'companies'
                 AND index_name = 'uq_companies_recruiter'`
            );
            if (index.rowCount > 0) continue;
          }
          await client.query(statement);
        }
        await client.query('INSERT INTO schema_migrations (migration_name) VALUES (?)', [migrationName]);
        console.log(`✅ Applied database migration ${migrationName}.`);
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Database migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

runMigrations();
