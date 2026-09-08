const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const BotConversation = require('../models/BotConversation');
const requireLogin = require('../middlewares/requireLogin');

router.get('/messages/:chatWith', requireLogin, async (req, res) => {
    try {
        const myId = req.user._id;
        const chatWithId = req.params.chatWith;

        // Universal AI Bot Interception
        if (chatWithId === "universal_ai_bot") {
            const botConversations = await BotConversation.find({ user: myId })
                .sort({ createdAt: 1 });

            // Format them to look exactly like standard Messages for the frontend
            const formattedBotMessages = botConversations.map(msg => {
                if (msg.role === "user") {
                    return {
                        _id: msg._id,
                        sender: { _id: myId, name: req.user.name },
                        receiver: "universal_ai_bot",
                        content: msg.content,
                        createdAt: msg.createdAt
                    };
                } else {
                    return {
                        _id: msg._id,
                        sender: { _id: "universal_ai_bot", name: "StarkBot AI" },
                        receiver: myId,
                        content: msg.content,
                        createdAt: msg.createdAt
                    };
                }
            });

            return res.json(formattedBotMessages);
        }

        // Standard User-to-User Flow
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
