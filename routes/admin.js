const express = require("express");
const router = express.Router();
const adminContoller = require("../controllers/admin");

router.get("/admin/dashboard", adminContoller.getDashboard);
router.get("/admin/profile", adminContoller.getProfile);

router.post("/admin/profile", adminContoller.createProfile);

module.exports = router;
