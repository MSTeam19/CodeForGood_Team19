const express = require('express');

const user = require("./user")
const regions = require("./regions")
const donations = require("./donations")

const router = express.Router();

router.use('/user', user)
router.use('/regions', regions)
router.use('/donations', donations)

module.exports = router;

