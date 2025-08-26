const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.fieldname + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'img') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes en el campo img'), false);
    }
  } else if (file.fieldname === 'pdf') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten PDFs en el campo pdf'), false);
    }
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
