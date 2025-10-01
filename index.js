const express = require("express");
const cors = require("cors");
const pool = require("./db/pool.js");
const QRCode = require("qrcode");

const app = express();
app.use(cors());
app.use(express.json());
// Ruta para guardar vehículo y generar QR
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

    // 1. Inserción (Usa pool.query() y placeholders ?)
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

    // Obtener el ID de la fila insertada (insertId es específico de MySQL)
    const insertedId = insertResult[0].insertId;

    // 2. Selección con formato de fechas (DATE_FORMAT es específico de MySQL)
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

    // Obtener el resultado
    const vehiculo = selectResult[0][0];

    res.status(201).json({
      ...vehiculo,
    });
  } catch (err) {
    console.error("Error en /api/vehiculos:", err);
    res.status(500).json({ error: "Error al guardar vehículo" });
  }
});

// Ruta para obtener vehículo por ID
app.get("/api/:id", async (req, res) => {
  try {
    const { id } = req.params;
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

    const vehiculo = result[0];

    if (vehiculo.length === 0)
      return res.status(404).json({ error: "Vehículo no encontrado" });
    res.json(vehiculo[0]);
  } catch (err) {
    console.error("Error en /api/:id:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.listen(4000, () => console.log("✅ Backend en http://localhost:4000"));
