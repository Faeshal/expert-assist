const express = require("express");
const router = express.Router();
const adminContoller = require("../controllers/admin");

router.get("/admin/dashboard", adminContoller.getDashboard);

module.exports = router;
