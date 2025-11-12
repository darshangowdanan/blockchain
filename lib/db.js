import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'holoticket',
  password: 'Darshan',
  port: 5432,
});
export default pool;