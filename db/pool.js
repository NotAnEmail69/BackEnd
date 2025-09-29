// db/pool.js - ¡Versión para MySQL!
// Cambiamos 'pg' por 'mysql2'
const mysql = require("mysql2");

// Crea el pool de conexiones usando la sintaxis de mysql2/promise
const pool = mysql.createPool({
  host: "localhost", // Ahora apunta a tu servidor MySQL
  user: "linux",
  password: "unnuevopw4321**",
  database: "QRAPP",
  port: 3306, // Puerto predeterminado de MySQL
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Para que se comporte de forma similar a 'pg', exportamos la promesa del pool
// Esto asume que el resto de tu código usa `await pool.query(...)`
module.exports = pool.promise();
