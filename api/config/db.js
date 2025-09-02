import pg from 'pg';
import 'dotenv/config'; // For local development

const { Pool } = pg;

// This new configuration reads the connection string from an environment variable.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const db = {
  query: (text, params) => pool.query(text, params),
};

export default db;