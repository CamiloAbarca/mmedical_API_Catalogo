const pool = require("../config/db");

const { comparePassword, generateToken } = require("../middleware/auth");

exports.getAllUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const bcrypt = require('bcrypt');
exports.createUsuario = async (req, res) => {
  const { nombre, apellido, email, password } = req.body;
  try {
    // Encriptar la contraseña antes de guardar
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, apellido, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
      [nombre, apellido, email, hashedPassword]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login de usuario
exports.loginUsuario = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Buscar usuario por email
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
    const usuario = rows[0];
    // Comparar contraseña
    const match = await comparePassword(password, usuario.password);
    if (!match) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
    // Generar token JWT
    const token = generateToken({ id: usuario.id, email: usuario.email });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
