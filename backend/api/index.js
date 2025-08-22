const express = require('express');

const user = require("./user")
const campaigns = require("./campaigns")
const donations = require("./donations")
const regions = require("./regions")

const router = express.Router();

router.use('/user', user)
router.use('/campaigns', campaigns)
router.use('/donations', donations)
router.use('/regions', regions)

module.exports = router;

