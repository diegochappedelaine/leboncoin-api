// Toutes les routes user
const express = require("express");
const router = express.Router();

// Import des packages d'encryptation
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

// Import des models
const User = require("../models/User");

// Route création d'utilisateur
router.post("/user/sign_up", async (req, res) => {
    console.log("route : /user/sign_up");
    try {
        // Check si user pas déjà enregistré avec cet email
        if (!req.fields.email || !req.fields.password || !req.fields.username) {
            res.status(401).json("Missing parameters.");
        } else {
            const userAlreadyInDb = await User.findOne({
                email: req.fields.email,
            });
            if (userAlreadyInDb) {
                res.status(401).json("User already signed in.");
            } else {
                // Gestion du mot de passe
                const password = req.fields.password;
                const salt = uid2(16);
                const hash = SHA256(password + salt).toString(encBase64);
                const token = uid2(16);
                newUser = new User({
                    email: req.fields.email,
                    token: token,
                    hash: hash,
                    salt: salt,
                    account: {
                        username: req.fields.username,
                        phone: req.fields.phone,
                    },
                });
                await newUser.save();
                res.status(200).json({
                    _id: newUser._id,
                    token: newUser.token,
                    account: newUser.account,
                });
            }
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route pour log-in
router.post("/user/log_in", async (req, res) => {
    console.log("route: /user/log_in");
    try {
        const userLoggingIn = await User.findOne({ email: req.fields.email });
        if (!userLoggingIn) {
            res.status(400).json("Email is not registered");
        } else {
            const hash = SHA256(
                req.fields.password + userLoggingIn.salt
            ).toString(encBase64);
            if (hash === userLoggingIn.hash) {
                res.status(200).json({
                    _id: userLoggingIn._id,
                    token: userLoggingIn.token,
                    account: {
                        username: userLoggingIn.account.username,
                        phone: userLoggingIn.account.phone,
                    },
                });
            } else {
                res.status(401).json("Wrong password");
            }
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Export des routes
module.exports = router;
