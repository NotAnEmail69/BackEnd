// db/pool.js
const { Pool } = require("pg");

const pool = new Pool({
  user: "linux", // ej: postgres
  password: "unnuevopw4321**", // la clave que le pusiste
  host: "localhost", // porque es local
  port: 5432, // default
  database: "QRAPP", // el nombre de tu DB
});

module.exports = pool;
