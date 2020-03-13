const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const isAuth = require("../middleware/is-auth");

router.get("/user/dashboard", isAuth, userController.getDashboard);

// * Profile
router.get("/user/profile", isAuth, userController.getProfile);
router.post("/user/profile/update", isAuth, userController.updateProfile);

module.exports = router;
