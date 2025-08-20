const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuarios.controller");

router.get("/", usuariosController.getAllUsuarios);
router.post("/", usuariosController.createUsuario);
router.post("/login", usuariosController.loginUsuario);

module.exports = router;
