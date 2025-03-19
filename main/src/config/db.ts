import mysql from "mysql2/promise";

const dbName = process.env.DB_DBNAME || "pickify";

async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT  ? parseInt(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: dbName,
    });


    ("Database connection successful!");
    return connection;
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

const dbConnection = initializeDatabase();

export default dbConnection;