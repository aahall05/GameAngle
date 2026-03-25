import pool from './db.js';

async function washDB() {
  try {
    console.log('Deleting tables...');

    await pool.query(`
      DROP TABLE IF EXISTS Videos CASCADE;
      DROP TABLE IF EXISTS Collages CASCADE;
      DROP TABLE IF EXISTS Users CASCADE;
    `);

    console.log('✅ Tables deleted successfully');
  } catch (err) {
    console.error('❌ Error deleting tables:', err);
  } finally {
    await pool.end();
  }
}

washDB();