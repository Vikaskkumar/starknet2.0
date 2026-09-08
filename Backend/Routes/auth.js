const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const USER = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Jwt_secret = process.env.JWT_SECRET;
const requireLogin = require('../middlewares/requireLogin.js');

router.post('/signup', async (req, res) => {
    try {
        const { name, userName, email, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();
        const normalizedUserName = userName?.trim();

        if (!name || !email || !userName || !password) {
            return res.status(422).json({ error: "please add all fields" });
        }

        const savedUser = await USER.findOne({
            $or: [{ email: normalizedEmail }, { userName: normalizedUserName }]
        });

        if (savedUser) {
            return res.status(422).json({ error: "User already exist with email or username" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new USER({
            name,
            email: normalizedEmail,
            userName: normalizedUserName,
            password: hashedPassword
        });

        await user.save();

        res.json({ message: "Registered successfully" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
});


router.post("/signin", async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({
            error: "please add email and password"
        });
    }

    try {
        const savedUser = await USER.findOne({ email: email.trim().toLowerCase() });

        if (!savedUser) {
            return res.status(422).json({ error: "invalid email" });
        }

        const match = await bcrypt.compare(password, savedUser.password);

        if (!match) {
            return res.status(422).json({ error: "invalid password" });
        }

        const token = jwt.sign({ _id: savedUser._id }, Jwt_secret);

        res.status(200).json({
            token,
            user: {
                _id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                userName: savedUser.userName
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "something went wrong" });
    }

});

router.post("/direct-reset-password", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(422).json({ error: "Please provide both email and new password" });
        }

        const user = await USER.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(422).json({ error: "No user found with this email" });
        }

        const hashedpassword = await bcrypt.hash(password, 12);
        user.password = hashedpassword;

        await user.save();
        res.json({ message: "Password updated successfully!" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
