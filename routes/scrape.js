const express = require('express');
const scrapeControllers = require('../scrape.js')
const { search, getSites } = scrapeControllers;

const router = express.Router();

router.get('/', search)
router.get('/sites', getSites)

module.exports = router;