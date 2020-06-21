require("pretty-error").start();
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/auth");
const routeCache = require("route-cache");

// * Auth User & Mentor
router.get(
  "/register",
  routeCache.cacheSeconds(900),
  authController.getRegister
);
router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Please Enter a Valid Email")
      .normalizeEmail(),
    body("username", "Please Give some username").not().isEmpty().trim(),
    body("password", "Please enter a password at least 3 character")
      .isLength({ min: 3 })
      .isAlphanumeric()
      .trim(),
    body("level", "Please Select a Role").not().isEmpty(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords Not Match!");
      }
      return true;
    }),
  ],
  authController.postRegister
);

router.get("/login", routeCache.cacheSeconds(900), authController.getLogin);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body("password", "Password has to be valid.")
      .isLength({ min: 3 })
      .isAlphanumeric()
      .trim(),
    body("level", "Please, Select a Role").not().isEmpty(),
  ],
  authController.postLogin
);

// * Auth Admin
router.get(
  "/registerAdmin",
  routeCache.cacheSeconds(900),
  authController.getRegisterAdmin
);
router.post("/registerAdmin", authController.postRegisterAdmin);
router.get(
  "/loginAdmin",
  routeCache.cacheSeconds(900),
  authController.getLoginAdmin
);
router.post("/loginAdmin", authController.postLoginAdmin);

router.post("/logout", authController.postLogout);

// * Reset Password
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);
router.post("/newpassword", authController.postNewPassword);

module.exports = router;
