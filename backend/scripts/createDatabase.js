#!/usr/bin/env node
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const path = require('path');

// Load env from project root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'razowild_db';

(async () => {
  try {
    console.log(`Connecting to MySQL at ${host} as ${user}...`);
    const conn = await mysql.createConnection({ host, user, password });

    const createSql = `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;
    await conn.query(createSql);
    console.log(`Database '${dbName}' created or already exists.`);

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Error creating database:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
