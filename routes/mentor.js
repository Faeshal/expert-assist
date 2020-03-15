const express = require("express");
const router = express.Router();
const mentorController = require("../controllers/mentor");
const isAuth = require("../middleware/is-auth");

router.get("/mentor/dashboard", isAuth, mentorController.getDashboard);
router.get("/mentor/exam", isAuth, mentorController.getExam);

router.get("/mentor/profile", isAuth, mentorController.getProfile);
router.post("/mentor/profile/update", isAuth, mentorController.updateProfile);

module.exports = router;
