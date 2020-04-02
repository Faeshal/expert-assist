const express = require("express");
const router = express.Router();
const frontController = require("../controllers/front");

router.get("/", frontController.getIndex);

router.get("/blog", frontController.getAllBlog);
router.get("/blog/:id", frontController.getDetailBlog);

// ! THIS IS THE BUG
// router.get("/mentor/:id", frontController.getDetailMentor);

router.get("/mdetail/:id", frontController.getDetailMentor);

router.get("/mlist", frontController.getMentorList);

module.exports = router;
