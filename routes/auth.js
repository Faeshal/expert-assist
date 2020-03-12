const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// * Auth User
router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

// * Auth Admin
router.get("/registerAdmin", authController.getRegisterAdmin);
router.post("/registerAdmin", authController.postRegisterAdmin);
router.get("/loginAdmin", authController.getLoginAdmin);
router.post("/loginAdmin", authController.postLoginAdmin);

router.post("/logout", authController.postLogout);

// * Reset Password
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);
router.post("/newpassword", authController.postNewPassword);

module.exports = router;
