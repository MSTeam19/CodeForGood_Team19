const express = require("express");

const user = require("./user");
const regions = require("./regions");
const donations = require("./donations");
const posts = require("./posts");
const upload = require('./upload');

const router = express.Router();

router.use("/user", user);
router.use("/regions", regions);
router.use("/donations", donations);
router.use("/posts", posts);
router.use("/upload", upload);

module.exports = router;
