const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

router.get("/user/dashboard", userController.getDashboard);

router.get("/user/profile", userController.getProfile);
router.post("/user/profile", userController.createProfile);

module.exports = router;
