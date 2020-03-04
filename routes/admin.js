const express = require("express");
const router = express.Router();
const adminContoller = require("../controllers/admin");

router.get("/admin/dashboard", adminContoller.getDashboard);

router.get("/admin/profile", adminContoller.getProfile);
router.post("/admin/profile", adminContoller.createProfile);

router.get("/admin/blog", adminContoller.getCreateBlog);
router.post("/admin/blog", adminContoller.createBlog);

router.get("/blog", adminContoller.getAllBlog);
router.get("/blog/:id", adminContoller.getDetailBlog);

module.exports = router;
