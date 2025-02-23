import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const query = async (text: string, params?: any[]) => {
  try {
    // Optionally add logging based on environment
    if (process.env.NODE_ENV === 'development') {
      console.log("Running Query:", text, "Params:", params);
    }

    const result = await pool.query(text, params);

    if (process.env.NODE_ENV === 'development') {
      console.log("Query Result:", result.rows);
    }

    return result;
  } catch (err: any) {
    console.error("Database Query Error:", err.message);
    throw new Error("Database query failed.");
  }
};

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database!");
});

export default pool;
