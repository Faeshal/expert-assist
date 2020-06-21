require("pretty-error").start();
const express = require("express");
const router = express.Router();
const frontController = require("../controllers/front");
const routeCache = require("route-cache");

router.get("/", routeCache.cacheSeconds(900), frontController.getIndex);
router.get("/search", frontController.getSearch);

router.get("/blog", routeCache.cacheSeconds(600), frontController.getAllBlog);
router.get(
  "/blog/:id",
  routeCache.cacheSeconds(600),
  frontController.getDetailBlog
);

// ! THIS IS THE BUG
// router.get("/mentor/:id", frontController.getDetailMentor);

router.get("/mdetail/:id", frontController.getDetailMentor);

router.get(
  "/mlist",
  routeCache.cacheSeconds(300),
  frontController.getMentorList
);
router.get("/api/mlists", frontController.getMentorListJson);
router.get("/filter", frontController.getFilter);
router.get("/sort", frontController.getSort);

// FAQ
router.get("/faq", routeCache.cacheSeconds(600), frontController.getFaq);

module.exports = router;
