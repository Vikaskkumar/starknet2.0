const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const requireLogin = require('../middlewares/requireLogin');

router.get('/messages/:chatWith', requireLogin, async (req, res) => {
    try {
        const myId = req.user._id;
        const chatWithId = req.params.chatWith;

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: chatWithId },
                { sender: chatWithId, receiver: myId }
            ]
        })
            .populate("sender", "_id name")
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Could not fetch messages" });
    }
});

module.exports = router;
