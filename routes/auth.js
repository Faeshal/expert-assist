const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/auth");

// * Auth User & Mentor
router.get("/register", authController.getRegister);
router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Please Enter a Valid Email"),
    body("username", "Please Give some username")
      .not()
      .isEmpty(),
    body("password", "Please enter a password at least 3 character")
      .isLength({ min: 3 })
      .isAlphanumeric(),
    body("level", "Please Select a Role")
      .not()
      .isEmpty(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords Not Match!");
      }
      return true;
    })
  ],
  authController.postRegister
);
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
