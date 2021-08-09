const express = require('express');
const {
  search, 
  getSites
} = require('../controllers/searchController')

const router = express.Router();

router.get('/', search)
router.get('/sites', getSites)

module.exports = router;