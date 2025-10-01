// db/pool.js
const mysql = require("mysql2");

// Crea el pool de conexiones y llama a .promise() inmediatamente.
// Esto permite que el backend use pool.query()
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
  .promise();

// Exporta el Pool de Promesas COMPLETO
module.exports = pool;
