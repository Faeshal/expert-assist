const express = require("express");
const router = express.Router();
const adminContoller = require("../controllers/admin");

// * Welcome Dashboard
router.get("/admin/dashboard", adminContoller.getDashboard);

// * Profile
router.get("/admin/profile", adminContoller.getProfile);
router.post("/admin/profile", adminContoller.createProfile);

// * Blog
router.get("/admin/bloglist", adminContoller.getAllBlog);

router.get("/admin/blog", adminContoller.getCreateBlog);
router.post("/admin/blog", adminContoller.createBlog);

router.get("/admin/blog/:id", adminContoller.getUpdateBlog);
router.post("/admin/blog/update", adminContoller.updateBlog);

router.post("/admin/blog/delete", adminContoller.deleteBlog);

// * Category
router.get("/admin/category", adminContoller.getCategory);
router.post("/admin/category", adminContoller.postCategory);
router.post("/admin/category/delete", adminContoller.deleteCategory);

module.exports = router;
