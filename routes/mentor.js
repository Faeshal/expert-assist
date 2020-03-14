const express = require("express");
const router = express.Router();
const mentorController = require("../controllers/mentor");
const isAuth = require("../middleware/is-auth");

router.get("/mentor/dashboard", isAuth, mentorController.getDashboard);
router.get("/mentor/profile", isAuth, mentorController.getProfile);

module.exports = router;
