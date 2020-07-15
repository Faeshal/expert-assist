require("pretty-error").start();
const express = require("express");
const router = express.Router();
const mentorController = require("../controllers/mentor");
const multer = require("multer");
const isAuth = require("../middleware/is-auth");
const { body } = require("express-validator");
const longpoll = require("express-longpoll")(router, { DEBUG: true });

// * Inisialisasi Multer
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
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

const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1000000, // 1 mb in bytes
  },
});

// * Polling For User
longpoll.create("/polluser");

// * Polling for Admin
longpoll.create("/polladmin");

// * Dashboard
router.get("/mentor/dashboard", isAuth, mentorController.getDashboard);

// * Profile
router.post(
  "/mentor/update/mentorstatus",
  isAuth,
  mentorController.postMentorStatus
);
router.get("/mentor/profile", isAuth, mentorController.getProfile);
router.get("/mentor/profile/update", isAuth, mentorController.getUpdateProfile);
router.post(
  "/mentor/profile/update",
  isAuth,
  upload.fields([
    {
      name: "profilepicture",
      maxCount: 1,
    },
    {
      name: "coverpicture",
      maxCount: 1,
    },
  ]),
  mentorController.updateProfile
);

router.post(
  "/mentor/profile/changepassword",
  [
    body("password", "Password wajib di isi").not().isEmpty().trim(),
    body("newPassword", "Password baru wajib di isi").not().isEmpty().trim(),
  ],
  isAuth,
  mentorController.postChangePassword
);

// * Payment
router.get("/mentor/payment", isAuth, mentorController.getPayment);
router.get("/api/mentor/payments", mentorController.getPaymentJson);

// * Exam
router.get("/mentor/exam", isAuth, mentorController.getExam);
router.post("/mentor/exam", isAuth, mentorController.postExam);
router.get("/mentor/exam/begin", isAuth, mentorController.getBeginExam);
router.post("/mentor/exam/begin", isAuth, mentorController.postBeginExam);

// * Schedule
router.get("/mentor/schedule", isAuth, mentorController.getSchedule);
router.post(
  "/mentor/schedule/update",
  isAuth,
  mentorController.postUpdateSchedule
);

// * Mentoring
router.get("/mentor/mentoring", isAuth, mentorController.getMentoring);
router.get("/mentor/mentoring/live", mentorController.getLive);
router.post("/mentor/mentoring/finish", mentorController.postFinishMentoring);

// * Review
router.get("/mentor/review", isAuth, mentorController.getReview);

// * withdraw
router.get("/mentor/withdraw", isAuth, mentorController.getWithdraw);
router.post("/mentor/withdraw", isAuth, mentorController.postWithdraw);
router.post("/mentor/withdraw/delete", isAuth, mentorController.deleteWithdraw);

module.exports = router;
