require("pretty-error").start();
const express = require("express");
const router = express.Router();
const adminContoller = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const longpoll = require("express-longpoll")(router, { DEBUG: true });

// * Polling for Mentor
longpoll.create("/pollwithdraw");

// * Welcome Dashboard
router.get("/admin/dashboard", isAuth, adminContoller.getDashboard);

// * Profile
router.get("/admin/profile", isAuth, adminContoller.getProfile);
router.post("/admin/profile", isAuth, adminContoller.updateProfile);

// * Blog
router.get("/admin/blog", isAuth, adminContoller.getAllBlog);
router.get("/admin/blog/create", isAuth, adminContoller.getCreateBlog);
router.post("/admin/blog", isAuth, adminContoller.createBlog);
router.get("/admin/blog/:id", isAuth, adminContoller.getUpdateBlog);
router.post("/admin/blog/update", isAuth, adminContoller.updateBlog);
router.post("/admin/blog/delete", isAuth, adminContoller.deleteBlog);

// * Category
router.get("/admin/category", isAuth, adminContoller.getCategory);
router.post("/admin/category", isAuth, adminContoller.postCategory);
router.post("/admin/category/update", isAuth, adminContoller.updateCategory);
router.post("/admin/category/delete", isAuth, adminContoller.deleteCategory);

// * FAQ
router.get("/admin/faq", isAuth, adminContoller.getFaq);
router.post("/admin/faq", isAuth, adminContoller.postFaq);
router.post("/admin/faq/update", isAuth, adminContoller.updateFaq);
router.post("/admin/faq/delete", isAuth, adminContoller.deleteFaq);

// * Mentor
router.get("/admin/mentor/all", adminContoller.getMentorAll);
router.post("/admin/mentor/all", adminContoller.postMentorBlock);
router.get("/admin/mentor/exam", adminContoller.getMentorExam);
router.get("/api/admin/mentorexams", adminContoller.getMentorExamJson);
router.post("/admin/mentor/exam/update", adminContoller.postScore);
router.post("/admin/mentor/exam/reset", adminContoller.resetExam);
router.get("/admin/mentor/block", adminContoller.getBlockMentor);

// ** User
router.get("/admin/user/all", adminContoller.getUserAll);
router.post("/admin/user/all", adminContoller.postUserBlock);
router.get("/admin/user/block", adminContoller.getBlockUser);

// * Payment
router.get("/admin/payment", isAuth, adminContoller.getPayment);
router.get("/api/admin/payments", isAuth, adminContoller.getPaymentJson);

// * Mentoring
router.get("/admin/mentoring", adminContoller.getMentoring);

// *Withdraw
router.get("/admin/withdraw", adminContoller.getwithdraw);
router.get("/api/admin/withdraws", adminContoller.getwithdrawJson);
router.post("/admin/withdraw/update", adminContoller.postUpdateWithdraw);

module.exports = router;
