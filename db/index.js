// import 'dotenv/config';
// import { drizzle } from 'drizzle-orm/node-postgres';

// export const db = drizzle(process.env.DATABASE_URL);


import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this is set in your `.env` file
  ssl: {
    rejectUnauthorized: false, // Required for NeonDB
  },
});

export const db = drizzle(pool);

