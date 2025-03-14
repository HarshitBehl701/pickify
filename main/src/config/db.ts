import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.DB_DBNAME || "pickify";

async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: dbName,
    });


    console.log("Database connection successful!");
    return connection;
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

const dbConnection = initializeDatabase();

export default dbConnection;