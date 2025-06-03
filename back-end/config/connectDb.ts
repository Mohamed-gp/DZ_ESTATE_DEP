import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Database configuration for Neon PostgreSQL
const getDatabaseConfig = () => {
  // Use the Neon database connection string
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_sSg9b4iUczCL@ep-withered-sunset-a2gbl153-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require";

  return {
    connectionString,
    ssl: {
      rejectUnauthorized: false, // Required for Neon
    },
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
  };
};

const pool = new Pool(getDatabaseConfig());

// Enhanced database connection with retry logic
const connectToDB = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log(`✅ Connected successfully to Neon PostgreSQL Database`);
      client.release();
      return;
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, error);

      if (i === retries - 1) {
        console.error("🔥 All database connection attempts failed");
        process.exit(1);
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, i))
      );
    }
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🔄 Closing database connections...");
  await pool.end();
  console.log("✅ Database connections closed");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🔄 Closing database connections...");
  await pool.end();
  console.log("✅ Database connections closed");
  process.exit(0);
});

export default pool;
export { connectToDB };
