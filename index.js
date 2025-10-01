const express = require("express");
const cors = (require = require("cors"));
const pool = require("./db/pool.js"); // Ya está configurado para mysql2/promise
const QRCode = require("qrcode");

const app = express();
app.use(cors());
app.use(express.json());

const createTable = async () => {
  try {
    // CORRECCIÓN CLAVE: Usamos INT AUTO_INCREMENT PRIMARY KEY, que es sintaxis de MySQL,
    // en lugar de SERIAL PRIMARY KEY (que es de PostgreSQL).
    await pool.query(`
  CREATE TABLE IF NOT EXISTS vehiculos (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        codigo VARCHAR(50) NOT NULL,
        placa VARCHAR(20) NOT NULL,
        tipo VARCHAR(50),
        marca VARCHAR(50),
        modelo VARCHAR(50),
        color VARCHAR(30),
        anio INT,
        chasis VARCHAR(100),
        expiracion DATE,
        emision DATE,
        rnc_importador VARCHAR(50),
        nombre_importador VARCHAR(100),
        rnc_comprador VARCHAR(50),
        nombre_comprador VARCHAR(100)
      );
    `);
    console.log("✅ Tabla 'vehiculos' lista");
  } catch (err) {
    console.error("❌ Error creando tabla 'vehiculos':", err);
  }
};

createTable();

// Guardar vehículo y generar QR
app.post("/api/vehiculos", async (req, res) => {
  try {
    const {
      codigo,
      placa,
      tipo,
      marca,
      modelo,
      color,
      anio,
      chasis,
      expiracion,
      emision,
      rnc_importador,
      nombre_importador,
      rnc_comprador,
      nombre_comprador,
    } = req.body;

    // 1. Ejecutar INSERT (sin RETURNING y usando '?' para MySQL)
    const insertResult = await pool.query(
      `INSERT INTO vehiculos 
        (codigo, placa, tipo, marca, modelo, color, anio, chasis, expiracion, emision, 
         rnc_importador, nombre_importador, rnc_comprador, nombre_comprador)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo,
        placa,
        tipo,
        marca,
        modelo,
        color,
        anio,
        chasis,
        expiracion,
        emision,
        rnc_importador,
        nombre_importador,
        rnc_comprador,
        nombre_comprador,
      ]
    );

    // 2. Obtener el ID de la fila insertada (Propiedad estándar de mysql2)
    // Usamos el índice [0] porque mysql2/promise retorna [results, fields]
    const insertedId = insertResult[0].insertId;

    // 3. Ejecutar SELECT para obtener los datos recién insertados y formateados
    // NOTA: TO_CHAR es de PostgreSQL. Para MySQL, usamos DATE_FORMAT.
    const selectResult = await pool.query(
      `SELECT 
            id, codigo, placa, tipo, marca, modelo, color, anio, chasis,
            DATE_FORMAT(expiracion, '%d/%m/%Y') as expiracion,
            DATE_FORMAT(emision, '%d/%m/%Y') as emision,
            rnc_importador, nombre_importador, rnc_comprador, nombre_comprador
         FROM vehiculos 
         WHERE id = ?`,
      [insertedId]
    );

    // 4. Obtener el resultado de la consulta. La data está en el índice [0] del array,
    // y el vehículo es el primer elemento de esa data.
    const vehiculo = selectResult[0][0];

    const url = `https://dgii-gov.net/${vehiculo.id}`; // Generamos QR

    const qrCodeDataURL = await QRCode.toDataURL(url);

    res.status(201).json({
      ...vehiculo,
      qr: qrCodeDataURL,
      link: url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar vehículo" });
  }
});

app.get("/api/:id", async (req, res) => {
  try {
    const { id } = req.params; // CORRECCIÓN: Usamos DATE_FORMAT para MySQL en la consulta SELECT
    const result = await pool.query(
      `SELECT 
         id, codigo, placa, tipo, marca, modelo, color, anio, chasis,
         DATE_FORMAT(expiracion, '%d/%m/%Y') as expiracion,
         DATE_FORMAT(emision, '%d/%m/%Y') as emision,
         rnc_importador, nombre_importador, rnc_comprador, nombre_comprador
       FROM vehiculos 
       WHERE id = ?`,
      [id]
    );
    // Ajuste para el retorno de mysql2/promise
    const vehiculo = result[0];
    console.log(vehiculo[0]);

    if (vehiculo.length === 0)
      return res.status(404).json({ error: "Vehículo no encontrado" });
    res.json(vehiculo[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});
app.listen(4000, () => console.log("✅ Backend en http://localhost:4000"));
