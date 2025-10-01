// db/pool.js - ¡Versión FINAL para MySQL!
const mysql = require("mysql2");

// Crea el pool de conexiones usando la sintaxis de mysql2/promise
const pool = mysql
  .createPool({
    host: "localhost", // Ahora apunta a tu servidor MySQL
    user: "root",
    password: "rootpw321**",
    database: "QRAPP",
    port: 3306, // Puerto predeterminado de MySQL
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise(); // ¡IMPORTANTE! Llama a .promise() aquí.

// Exporta el Pool de Promesas COMPLETO
module.exports = pool;
