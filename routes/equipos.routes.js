const express = require("express");
const router = express.Router();
const equiposController = require("../controllers/equipos.controller");
const multer = require("multer");
const path = require("path");

// Configurar multer para guardar los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "imgFile") {
      cb(null, "uploads/img/");
    } else if (file.fieldname === "pdfFile") {
      cb(null, "uploads/pdf/");
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/", equiposController.getAllEquipos);
router.get("/:id", equiposController.getEquipoById);
router.post(
  "/",
  upload.fields([
    { name: "imgFile", maxCount: 1 },
    { name: "pdfFile", maxCount: 1 },
  ]),
  equiposController.createEquipo
);
router.put(
  "/:id",
  upload.fields([
    { name: "imgFile", maxCount: 1 },
    { name: "pdfFile", maxCount: 1 },
  ]),
  equiposController.updateEquipo
);
router.delete("/:id", equiposController.deleteEquipo);

module.exports = router;
