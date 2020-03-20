const express = require("express");
const router = express.Router();
const mentorController = require("../controllers/mentor");
const multer = require("multer");
const isAuth = require("../middleware/is-auth");
const isExam = require("../middleware/is-exam");

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

router.get("/mentor/dashboard", isAuth, mentorController.getDashboard);
router.post(
  "/mentor/update/mentorstatus",
  isAuth,
  mentorController.postMentorStatus
);
router.get("/mentor/profile", isAuth, mentorController.getProfile);
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

router.get("/mentor/exam", isAuth, mentorController.getExam);

router.post("/mentor/exam", isAuth, mentorController.postExam);

router.get("/mentor/exam/begin", isAuth, mentorController.getBeginExam);

router.post("/mentor/exam/begin", isAuth, mentorController.postBeginExam);

module.exports = router;
