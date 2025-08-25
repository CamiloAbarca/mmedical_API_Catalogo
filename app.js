const express = require("express");
const cors = require("cors");
const multer = require("multer"); // Importar multer
const path = require("path");

const usuariosRoutes = require("./routes/usuarios.routes");
const equiposRoutes = require("./routes/equipos.routes");

const app = express();

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

app.use(cors());
app.use(express.json());

app.use('/apiCatalogo/usuarios', usuariosRoutes);
app.use('/apiCatalogo/equipos', equiposRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
