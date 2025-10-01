// db/pool.js - ¡Versión FINAL para MySQL!
const mysql = require("mysql2");

// Crea el pool de conexiones y llama a .promise() inmediatamente.
const pool = mysql
  .createPool({
    host: "localhost",
    user: "root",
    password: "rootpw321**",
    database: "QRAPP",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise(); // Esto crea el objeto Promise Pool.

// Exporta el Pool de Promesas COMPLETO
module.exports = pool;
