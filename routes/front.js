const express = require("express");
const router = express.Router();
const frontController = require("../controllers/front");

router.get("/", frontController.getIndex);

router.get("/blog", frontController.getAllBlog);
router.get("/blog/:id", frontController.getDetailBlog);

router.get("/mentor/:id", frontController.getDetailMentor);

module.exports = router;
