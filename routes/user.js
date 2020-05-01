const express = require("express");
const router = express.Router();
const multer = require("multer");
const userController = require("../controllers/user");
const isAuth = require("../middleware/is-auth");
const { body } = require("express-validator");

// * Inisialisasi Multer
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    cb(null, Date.now() + "_" + file.originalname);
  },
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

// * Dashboard
router.get("/user/dashboard", isAuth, userController.getDashboard);

// * Profile
router.get("/user/profile", isAuth, userController.getProfile);
router.post(
  "/user/profile/update",
  isAuth,
  upload.single("profilepicture"),
  userController.updateProfile
);

router.post(
  "/user/profile/changepassword",
  [
    body("password", "Password wajib di isi").not().isEmpty().trim(),
    body("newPassword", "Password baru wajib di isi").not().isEmpty().trim(),
  ],
  isAuth,
  userController.postChangePassword
);

// * Payment
router.get("/user/checkout/:id", isAuth, userController.getCheckout);
router.get("/checkout/success/:mentorId", userController.postCheckoutSuccess);
router.get("/user/payment", isAuth, userController.getPayment);

router.post("/pay", userController.postPayment);

// * Scheduling
router.get("/user/schedule", isAuth, userController.getSchedule);
router.post("/user/schedule", isAuth, userController.postSchedule);
router.post("/user/schedule/delete", isAuth, userController.postDeleteSchedule);

// * mentoring
router.get("/user/mentoring", isAuth, userController.getMentoring);
router.get("/user/mentoring/live", userController.getLive);

// * Review
router.get("/user/review", isAuth, userController.getReview);
router.post("/user/review", userController.postReview);
router.post("/user/review/update", userController.postUpdateReview);
router.post("/user/review/delete", isAuth, userController.deleteReview);

module.exports = router;
