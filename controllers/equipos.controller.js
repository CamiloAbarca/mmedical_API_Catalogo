const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

// Obtener todos los equipos
exports.getAllEquipos = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM equipos");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un equipo por ID
exports.getEquipoById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM equipos WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Equipo no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Función para eliminar archivos subidos si la base de datos falla
const deleteUploadedFiles = (files) => {
  if (files && files.imgFile && files.imgFile[0].path) {
    fs.unlink(files.imgFile[0].path, (err) => {
      if (err) console.error("Error al eliminar archivo de imagen:", err);
    });
  }
  if (files && files.pdfFile && files.pdfFile[0].path) {
    fs.unlink(files.pdfFile[0].path, (err) => {
      if (err) console.error("Error al eliminar archivo PDF:", err);
    });
  }
};

// Crear un equipo
exports.createEquipo = async (req, res) => {
  const { titulo, detalle, tipo } = req.body;
  const imgPath =
    req.files && req.files.imgFile && req.files.imgFile[0]
      ? req.files.imgFile[0].path.replace(/\\/g, "/")
      : "";
  const pdfPath =
    req.files && req.files.pdfFile && req.files.pdfFile[0]
      ? req.files.pdfFile[0].path.replace(/\\/g, "/")
      : "";

  try {
    const [result] = await pool.query(
      `INSERT INTO equipos 
   (img, titulo, detalle, pdf, tipo, create_at, update_at)
   VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [imgPath, titulo, detalle, pdfPath, tipo]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    deleteUploadedFiles(req.files);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un equipo
exports.updateEquipo = async (req, res) => {
  const { id } = req.params;
  const { titulo, detalle, tipo } = req.body;
  const imgPath =
    req.files && req.files.imgFile && req.files.imgFile[0]
      ? req.files.imgFile[0].path.replace(/\\/g, "/")
      : req.body.img;
  const pdfPath =
    req.files && req.files.pdfFile && req.files.pdfFile[0]
      ? req.files.pdfFile[0].path.replace(/\\/g, "/")
      : req.body.pdf;

  try {
    const [rows] = await pool.query(
      "SELECT img, pdf FROM equipos WHERE id = ?",
      [id]
    );
    const oldImgPath = rows[0].img;
    const oldPdfPath = rows[0].pdf;

    const data = {
      img: imgPath,
      titulo,
      detalle,
      pdf: pdfPath,
      tipo,
    };

    await pool.query("UPDATE equipos SET ?, update_at = NOW() WHERE id = ?", [
      data,
      id,
    ]);

    // Eliminar los archivos antiguos si se han subido nuevos
    if (req.files && req.files.imgFile && oldImgPath) {
      fs.unlink(path.join(__dirname, "..", oldImgPath), (err) => {
        if (err)
          console.error("Error al eliminar archivo de imagen antiguo:", err);
      });
    }
    if (req.files && req.files.pdfFile && oldPdfPath) {
      fs.unlink(path.join(__dirname, "..", oldPdfPath), (err) => {
        if (err) console.error("Error al eliminar archivo PDF antiguo:", err);
      });
    }

    res.json({ message: "Equipo actualizado correctamente" });
  } catch (error) {
    deleteUploadedFiles(req.files);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un equipo
exports.deleteEquipo = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT img, pdf FROM equipos WHERE id = ?",
      [req.params.id]
    );
    const oldImgPath = rows[0].img;
    const oldPdfPath = rows[0].pdf;

    await pool.query("DELETE FROM equipos WHERE id = ?", [req.params.id]);

    // Eliminar los archivos del servidor
    if (oldImgPath) {
      fs.unlink(path.join(__dirname, "..", oldImgPath), (err) => {
        if (err)
          console.error(
            "Error al eliminar archivo de imagen al eliminar equipo:",
            err
          );
      });
    }
    if (oldPdfPath) {
      fs.unlink(path.join(__dirname, "..", oldPdfPath), (err) => {
        if (err)
          console.error(
            "Error al eliminar archivo PDF al eliminar equipo:",
            err
          );
      });
    }

    res.json({ message: "Equipo eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
