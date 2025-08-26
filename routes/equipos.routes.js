const express = require("express");
const router = express.Router();
const equiposController = require("../controllers/equipos.controller");
const upload = require("../middleware/upload");

router.get("/", equiposController.getAllEquipos);
router.get("/:id", equiposController.getEquipoById);
router.post("/", upload.fields([{ name: 'img', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), equiposController.createEquipo);
router.put("/:id", upload.fields([{ name: 'img', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), equiposController.updateEquipo);
router.delete("/:id", equiposController.deleteEquipo);

module.exports = router;
