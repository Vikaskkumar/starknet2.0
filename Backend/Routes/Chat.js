const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const requireLogin = require('../middlewares/requireLogin');

// 1. Get messages between logged in user and another user
router.get('/messages/:chatWith', requireLogin, async (req, res) => {
    try {
        const myId = req.user._id;
        const chatWithId = req.params.chatWith;

        // Fetch messages where either:
        // - I am the sender and they are the receiver
        // - They are the sender and I am the receiver
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
