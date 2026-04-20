import 'dotenv/config'; // automatically loads .env
import pg from 'pg';

const { Pool } = pg;

// Create a pool with environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false 
  }
});

export default pool;