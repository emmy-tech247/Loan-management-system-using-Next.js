import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  password: "1234",
  database: "pluwkiho_loan_system",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;