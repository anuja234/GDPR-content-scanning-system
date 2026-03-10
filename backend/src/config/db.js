const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "gdpr_project",
  password: "Malve@123",   
  port: 5432
});

module.exports = pool;
