#!/usr/bin/env node
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const sourceDb = process.env.OLD_DB_NAME || 'camptime';
const targetDb = process.env.DB_NAME || 'razowild_db';

async function migrate() {
  const conn = await mysql.createConnection({ host, user, password, multipleStatements: true });
  try {
    console.log(`Source DB: ${sourceDb} -> Target DB: ${targetDb}`);

    const [tables] = await conn.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE='BASE TABLE'`,
      [sourceDb]
    );

    if (!tables.length) {
      console.log(`No tables found in source DB '${sourceDb}'.`);
      return;
    }

    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const row of tables) {
      const table = row.TABLE_NAME;

      const [srcColsRows] = await conn.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
        [sourceDb, table]
      );

      const [tgtColsRows] = await conn.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
        [targetDb, table]
      );

      const srcCols = srcColsRows.map(r => r.COLUMN_NAME);
      const tgtCols = tgtColsRows.map(r => r.COLUMN_NAME);

      const common = srcCols.filter(c => tgtCols.includes(c));
      if (!common.length) {
        console.log(`Skipping table ${table}: no matching columns in target.`);
        continue;
      }

      const colsCsv = common.map(c => `\`` + c + `\``).join(', ');

      const sql = `INSERT IGNORE INTO \`${targetDb}\`.\`${table}\` (${colsCsv}) SELECT ${colsCsv} FROM \`${sourceDb}\`.\`${table}\``;

      try {
        const [res] = await conn.query(sql);
        console.log(`Table ${table}: inserted ${res.affectedRows} rows (ignored duplicates).`);
      } catch (err) {
        console.error(`Failed migrating table ${table}:`, err.message || err);
      }
    }

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Migration complete.');
  } finally {
    await conn.end();
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err && err.message ? err.message : err);
  process.exit(1);
});
