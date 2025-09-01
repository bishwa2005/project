import pg from 'pg';


const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'college_connect_db',
    password: '180905',
    port: 5432,
});

const db = {
  query: (text, params) => pool.query(text, params),
};

export default db;