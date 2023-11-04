// userRoutes.js
const express = require('express');
const { generateToken, verifyToken } = require('../others/jwtUtils');
const { generateUserId, authenticateToken } = require('../others/utils');
const GameServer = require('../models/GameServer');
const User = require('../models/User');
const router = express.Router();


router.post('/registerUser', async (req, res) => {
    const { userName } = req.body;

    try {
        const userId = generateUserId();  // Utilisez votre fonction de génération d'userId ici
        const user = new User({ userId, userName });
        await user.save();

        const token = generateToken({ userId: userId });  // Générez un JWT pour cet utilisateur
        res.json({ success: true, token, userId });
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.get('/authenticate', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: "No token provided." });
    console.log("token : " + token)
    try {
        const data = verifyToken(token);
        console.log(data);
        const user = await User.findOne({ userId: data.userId });
        console.log(user)
        if (user) {
            res.json({ success: true, userId: data.userId });
        } else {
            res.status(403).json({ success: false, message: "Utilisateur introuvable." });
        }
    } catch (err) {
        res.status(403).json({ success: false, message: "Token invalide." });
    }
});



router.use(authenticateToken);
router.post('/setUserName', async (req, res) => {
    try {
        const { userId, userName } = req.body;

        // Essayez de trouver l'utilisateur et de mettre à jour son nom. S'il n'existe pas, créez-en un nouveau.
        const user = await User.findOneAndUpdate(
            { userId: userId },  // Critères de recherche
            { $set: { userName: userName } },  // Mise à jour
            { upsert: true, new: true, setDefaultsOnInsert: true }  // Options
        );

        if (!user) {
            return res.status(500).json({ success: false, message: "Failed to update or create user" });
        }

        res.json({ success: true, message: "Username updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.get('/user-servers', async (req, res) => {
    try {
        const userId = req.headers.userid;

        // Recherchez tous les serveurs où l'utilisateur est un joueur
        const servers = await GameServer.find({ 'players.userId': userId });

        res.json(servers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


module.exports = router;
