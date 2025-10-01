const express = require("express");
const cors = require("cors");
const pool = require("./db/pool.js");
const QRCode = require("qrcode");

const app = express();
app.use(cors());
app.use(express.json());
// Ruta para guardar vehículo y generar QR
// Ruta para guardar vehículo y generar QR
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

    // CONSULTA INSERT EN UNA SOLA LÍNEA LÓGICA
    // Usamos comillas simples para la consulta, ya que a veces las template literals causan problemas.
    const sqlInsert = `INSERT INTO vehiculos (
        codigo, placa, tipo, marca, modelo, color, anio, chasis, expiracion, emision, 
        rnc_importador, nombre_importador, rnc_comprador, nombre_comprador
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const insertResult = await pool.query(sqlInsert, [
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
    ]);

    // Obtener el ID de la fila insertada
    const insertedId = insertResult[0].insertId;

    // CONSULTA SELECT (Usando template literal por limpieza de código)
    const selectResult = await pool.query(
      `
        SELECT 
            id, codigo, placa, tipo, marca, modelo, color, anio, chasis,
            DATE_FORMAT(expiracion, '%d/%m/%Y') as expiracion,
            DATE_FORMAT(emision, '%d/%m/%Y') as emision,
            rnc_importador, nombre_importador, rnc_comprador, nombre_comprador
         FROM vehiculos 
         WHERE id = ?
    `,
      [insertedId]
    );

    // Obtener el resultado y generar QR
    const vehiculo = selectResult[0][0];
    const url = `https://dgii-gov.net/${vehiculo.id}`;
    const qrCodeDataURL = await QRCode.toDataURL(url);

    res.status(201).json({
      ...vehiculo,
      qr: qrCodeDataURL,
      link: url,
    });
  } catch (err) {
    console.error("Error en /api/vehiculos:", err);
    res.status(500).json({ error: "Error al guardar vehículo" });
  }
});

// Ruta para obtener vehículo por ID
// Ruta para obtener vehículo por ID
app.get("/api/:id", async (req, res) => {
  try {
    const { id } = req.params; // CONSULTA SELECT DE MYSQL EN UNA SOLA LÍNEA LÓGICA
    const sqlSelect = `
      SELECT 
        id, codigo, placa, tipo, marca, modelo, color, anio, chasis,
        DATE_FORMAT(expiracion, '%d/%m/%Y') as expiracion,
        DATE_FORMAT(emision, '%d/%m/%Y') as emision,
        rnc_importador, nombre_importador, rnc_comprador, nombre_comprador
      FROM vehiculos 
      WHERE id = ?
    `;

    const result = await pool.query(sqlSelect, [id]); // MySQL/Promise devuelve los resultados en el índice [0] del array

    const vehiculo = result[0];

    if (vehiculo.length === 0)
      return res.status(404).json({ error: "Vehículo no encontrado" });
    // Devolvemos el primer elemento
    res.json(vehiculo[0]);
  } catch (err) {
    console.error("Error en /api/:id:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.listen(4000, () => console.log("✅ Backend en http://localhost:4000"));
