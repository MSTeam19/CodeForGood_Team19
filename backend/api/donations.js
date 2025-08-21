const express = require('express');
const router = express.Router();
const donations = require("../model/donations")

router.get("/", async (req, res) => {

    try {

        res.status(200).json('Health Check For Donations: Success!');

    } catch (error) {
        res.status(500).json({ error: error.message })
    }

});

router.get("/all", async (req, res) => {

    try {
        
        const allDonations = await donations.getAllDonations;

        res.status(200).json(allDonations);

    } catch (error) {
        res.status(500).json({ error: error.message })
    }

});

module.exports = router;
