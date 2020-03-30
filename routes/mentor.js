const express = require("express");
const router = express.Router();
const mentorController = require("../controllers/mentor");
const multer = require("multer");
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
      maxCount: 1
    },
    {
      name: "coverpicture",
      maxCount: 1
    }
  ]),
  mentorController.updateProfile
);

// * Exam
router.get("/mentor/exam", isAuth, mentorController.getExam);
router.post("/mentor/exam", isAuth, mentorController.postExam);
router.get("/mentor/exam/begin", isAuth, mentorController.getBeginExam);
router.post("/mentor/exam/begin", isAuth, mentorController.postBeginExam);

// * Schedule
router.get("/mentor/schedule", isAuth, mentorController.getSchedule);
router.post(
  "/mentor/schedule/delete",
  isAuth,
  mentorController.postDeleteSchedule
);
router.post(
  "/mentor/schedule/update",
  isAuth,
  mentorController.postUpdateSchedule
);

// * Mentoring
router.get("/mentor/mentoring", isAuth, mentorController.getMentoring);
router.get("/mentor/mentoring/live", isAuth, mentorController.getLive);

// * Review
router.get("/mentor/review", isAuth, mentorController.getReview);
router.get("/mentor/review", isAuth, mentorController.getReview);

// * withdraw
router.get("/mentor/withdraw", isAuth, mentorController.getWithdraw);
router.post("/mentor/withdraw", isAuth, mentorController.postWithdraw);

module.exports = router;
