const express = require('express');
const scrapeControllers = require('../scrape.js')
const { search, getSitesConfig } = scrapeControllers;

const router = express.Router();

router.post('/', search)
router.get('/sites', getSitesConfig)

module.exports = router;