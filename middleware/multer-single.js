const multer = require("multer");
function upload(req, res, next) {
  const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "images");
    },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
      cb(null, Date.now() + "_" + file.originalname);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

  const upload = multer({ storage: fileStorage, fileFilter: fileFilter });
  return upload;
}

module.exports = upload;
