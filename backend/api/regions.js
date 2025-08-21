const express = require('express');
const router = express.Router();
const user = require("../model/regions")

router.get("/", async (req, res) => {

    try {

        res.status(200).json('Health Check For Regions: Success!');

    } catch (error) {
        res.status(500).json({ error: error.message })
    }

});

router.get("/all", async (req, res) => {

    try {
        
        const allUsers = await user.getAllUsers();

        res.status(200).json(allUsers);

    } catch (error) {
        res.status(500).json({ error: error.message })
    }

});

module.exports = router;
