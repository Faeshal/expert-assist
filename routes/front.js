require('pretty-error').start()
const express = require('express')
const router = express.Router()
const frontController = require('../controllers/front')
const routeCache = require('route-cache')

router.get('/', routeCache.cacheSeconds(400), frontController.getIndex)
router.get('/search', frontController.getSearch)

router.get('/blog', routeCache.cacheSeconds(400), frontController.getAllBlog)
router.get(
  '/blog/:id',
  routeCache.cacheSeconds(400),
  frontController.getDetailBlog
)

router.get(
  '/mdetail/:id',
  routeCache.cacheSeconds(1),
  frontController.getDetailMentor
)

router.get('/mlist', routeCache.cacheSeconds(1), frontController.getMentorList)
router.get('/api/mlists', frontController.getMentorListJson)
router.get('/filter', frontController.getFilter)
router.get('/sort', frontController.getSort)

router.get('/faq', routeCache.cacheSeconds(400), frontController.getFaq)

module.exports = router
