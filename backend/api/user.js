const express = require('express');
const router = express.Router();
const user = require("../model/user");
const { hashPassword, comparePassword, signUserToken } = require('../lib/utils');

router.get("/", async (req, res) => {

    try {

        res.status(200).json('Health Check For User: Success!');

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

router.post("/register", async (req, res) => {
    try {
        const { email, name, password } = req.body;

        // Check if email already exists
        const existingUser = await user.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered." });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await user.createUser(email, name, hashedPassword);

        const { payload, token } = signUserToken(newUser);
        res.status(201).json({ user: payload, token });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const userData = await user.getUserByEmail(email);
        if (!userData) {
            return res.status(404).json({ error: "User not found." });
        }

        const isPasswordValid = await comparePassword(password, userData.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password." });
        }

        const { payload, token } = signUserToken(userData);
        res.status(200).json({ user: payload, token });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
});

module.exports = router;
