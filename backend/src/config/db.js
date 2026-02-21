const { Pool } = require("pg");

const pool = new Pool({
  user: "pranitkolhe",
  host: "localhost",
  database: "gdpr_db",
  password: "pranit4311e@",   
  port: 5432
});

module.exports = pool;
