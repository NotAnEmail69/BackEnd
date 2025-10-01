const express = require("express");
const cors = require("cors");
const pool = require("./db/pool.js"); // Ahora exporta el Pool de Promesas completo
const QRCode = require("qrcode");

const app = express();
app.use(cors());
app.use(express.json());

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

    // Usando pool.query() y sintaxis MySQL (sin RETURNING)
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

    // Obtener el ID de la fila insertada
    const insertedId = insertResult[0].insertId;

    // Usar pool.query() para SELECT y DATE_FORMAT (MySQL)
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

    // La data está en el índice [0] del array, y el vehículo es el primer elemento de esa data.
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
    const { id } = req.params; // Usar pool.query() para SELECT y DATE_FORMAT (MySQL)
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

    if (vehiculo.length === 0)
      return res.status(404).json({ error: "Vehículo no encontrado" });
    res.json(vehiculo[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});
app.listen(4000, () => console.log("✅ Backend en http://localhost:4000"));
