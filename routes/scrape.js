const express = require('express');
const scrapeControllers = require('../scrape.js')
const { search } = scrapeControllers;

const router = express.Router();

router.post('/', search)

module.exports = router;