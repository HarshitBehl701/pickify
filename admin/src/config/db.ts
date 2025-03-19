import mysql from "mysql2/promise";
import dotenv from  "dotenv";
dotenv.config();

const dbName = process.env.DB_DBNAME || "pickify";

async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT  ? parseInt(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });

    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' ensured to exist.`);

    await connection.end();

    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT  ? parseInt(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log("Database connection successful!");
    return pool;
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

const dbConnection = initializeDatabase();

export default dbConnection;