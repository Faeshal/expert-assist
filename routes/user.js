const express = require("express");
const router = express.Router();
const multer = require("multer");
const userController = require("../controllers/user");
const isAuth = require("../middleware/is-auth");

// * Inisialisasi Multer
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

router.get("/user/dashboard", isAuth, userController.getDashboard);

// * Profile
router.get("/user/profile", isAuth, userController.getProfile);
router.post(
  "/user/profile/update",
  isAuth,
  upload.single("profilepicture"),
  userController.updateProfile
);

router.get("/user/checkout/:id", isAuth, userController.getCheckout);
// router.post("/user/checkout", isAuth, userController.postCheckout);
// router.get("/checkout/success", userController.postCheckoutSuccess);
// router.get("/user/checkout/cancel", isAuth, userController.getCheckout);

module.exports = router;
