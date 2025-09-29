const express = require("express");
const cors = require("cors");
const pool = require("./db/pool.js");
const QRCode = require("qrcode");

const app = express();
app.use(cors());
app.use(express.json());

const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehiculos (
        id SERIAL PRIMARY KEY,
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

// Guardar vehículo y generar QR,
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

    const result = await pool.query(
      `INSERT INTO vehiculos 
        (codigo, placa, tipo, marca, modelo, color, anio, chasis, expiracion, emision, 
         rnc_importador, nombre_importador, rnc_comprador, nombre_comprador)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING 
         id, codigo, placa, tipo, marca, modelo, color, anio, chasis,
         TO_CHAR(expiracion, 'DD/MM/YYYY') as expiracion,
         TO_CHAR(emision, 'DD/MM/YYYY') as emision,
         rnc_importador, nombre_importador, rnc_comprador, nombre_comprador`,
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
    const vehiculo = result.rows[0];
    const url = `https://dgii-gov.net/${vehiculo.id}`;

    // Generamos QR
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
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
         id, codigo, placa, tipo, marca, modelo, color, anio, chasis,
         TO_CHAR(expiracion, 'DD/MM/YYYY') as expiracion,
         TO_CHAR(emision, 'DD/MM/YYYY') as emision,
         rnc_importador, nombre_importador, rnc_comprador, nombre_comprador
       FROM vehiculos 
       WHERE id = $1`,
      [id]
    );
    console.log(result.rows[0]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Vehículo no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});
app.listen(4000, () => console.log("✅ Backend en http://localhost:4000"));
