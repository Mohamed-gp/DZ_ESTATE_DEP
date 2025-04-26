import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_PROD_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const connectToDB = async () => {
  try {
    pool.connect();
    console.log("connected successfully to Database ");
  } catch (error) {
    console.log("connection failed to DB", error);
  }
};

export default pool;
export { connectToDB };
