#!/usr/bin/env node
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'razowild_db';

(async () => {
  try {
    console.log(`Connecting to MySQL at ${host} as ${user} to import schema into ${dbName}...`);
    const conn = await mysql.createConnection({ host, user, password, database: dbName, multipleStatements: true });

    const sqlPath = path.resolve(__dirname, '../../database/schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Run each statement individually to allow idempotent re-runs.
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      try {
        await conn.query(stmt);
      } catch (err) {
        console.warn('Warning executing statement (continuing):', err && err.message ? err.message : err);
      }
    }
    console.log(`Schema import attempted into '${dbName}' (see warnings for non-fatal errors).`);

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Error importing schema:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
