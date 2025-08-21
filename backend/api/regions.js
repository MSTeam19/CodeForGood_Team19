const express = require('express');
const router = express.Router();
const regions = require("../model/regions");

router.get("/", async (req, res) => {

    try {

        res.status(200).json('Health Check For Regions: Success!');

    } catch (error) {
        res.status(500).json({ error: error.message })
    }

});

router.get("/all", async (req, res) => {

    try {
        
        const allRegion = await regions.getAllRegions();

        res.status(200).json(allRegion);

    } catch (error) {
        res.status(500).json({ error: error.message })
    }

});

module.exports = router;
