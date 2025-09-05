const pool = require("../config/db");
const fs = require("fs").promises;
const path = require("path");

const UPLOADS_PATH = "/home/enaviacl/public_html/mmedical/uploads";

// =======================
// Crear un equipo
// =======================
const createEquipo = async (req, res) => {
  const { titulo, detalle, tipo } = req.body;
  let img = req.files?.img?.[0]?.filename || null;
  let pdf = req.files?.pdf?.[0]?.filename || null;

  try {
    const [result] = await pool.query(
      `INSERT INTO equipos (img, titulo, detalle, pdf, tipo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [img, titulo, detalle, pdf, tipo]
    );

    const [rows] = await pool.query("SELECT * FROM equipos WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creando equipo:", error);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// Actualizar un equipo
// =======================
const updateEquipo = async (req, res) => {
  const { id } = req.params;
  const data = { ...req.body };

  try {
    const [rows] = await pool.query("SELECT * FROM equipos WHERE id = ?", [id]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Equipo no encontrado" });
    const equipoActual = rows[0];

    // Manejo imagen
    if (req.files?.img?.[0]) {
      data.img = req.files.img[0].filename;
      if (equipoActual.img) {
        try {
          await fs.unlink(path.join(UPLOADS_PATH, equipoActual.img));
        } catch (err) {
          if (err.code !== "ENOENT") console.error(err);
        }
      }
    }

    // Manejo PDF
    if (req.files?.pdf?.[0]) {
      data.pdf = req.files.pdf[0].filename;
      if (equipoActual.pdf) {
        try {
          await fs.unlink(path.join(UPLOADS_PATH, equipoActual.pdf));
        } catch (err) {
          if (err.code !== "ENOENT") console.error(err);
        }
      }
    }

    await pool.query("UPDATE equipos SET ?, updated_at = NOW() WHERE id = ?", [
      { ...data, tipo: data.tipo },
      id,
    ]);

    const [updatedRows] = await pool.query(
      "SELECT * FROM equipos WHERE id = ?",
      [id]
    );
    res.json(updatedRows[0]);
  } catch (error) {
    console.error("Error actualizando equipo:", error);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// Eliminar un equipo
// =======================
const deleteEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM equipos WHERE id = ?", [id]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Equipo no encontrado" });
    const equipo = rows[0];

    if (equipo.img) {
      try {
        await fs.unlink(path.join(UPLOADS_PATH, equipo.img));
      } catch (err) {
        if (err.code !== "ENOENT") console.error(err);
      }
    }
    if (equipo.pdf) {
      try {
        await fs.unlink(path.join(UPLOADS_PATH, equipo.pdf));
      } catch (err) {
        if (err.code !== "ENOENT") console.error(err);
      }
    }

    await pool.query("DELETE FROM equipos WHERE id = ?", [id]);
    res.json({ message: "Equipo y archivos eliminados correctamente" });
  } catch (error) {
    console.error("Error eliminando equipo:", error);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// Obtener todos los equipos
// =======================
const getAllEquipos = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM equipos");
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo equipos:", error);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// Obtener equipo por ID
// =======================
const getEquipoById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM equipos WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Equipo no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error obteniendo equipo:", error);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// Exportar todas las funciones
// =======================
module.exports = {
  createEquipo,
  updateEquipo,
  deleteEquipo,
  getAllEquipos,
  getEquipoById,
};
