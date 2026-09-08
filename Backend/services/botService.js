const BotConversation = require("../models/BotConversation");
const { generateChatResponse } = require("./llmService");

const handleBotChat = async (userId, content, socket) => {
  try {
    const userMessage = {
      user: userId,
      role: "user",
      content: content
    };
    await BotConversation.create(userMessage);

    const pastInteractions = await BotConversation.find({ user: userId })
      .sort({ _id: -1 })
      .limit(10);

    pastInteractions.reverse();

    const formattedMessages = pastInteractions.map((msg) => {
      return {
        role: msg.role,
        content: msg.content
      };
    });

    const systemPrompt = {
      role: "system",
      content: "You are StarkBot, a friendly AI on StarkNet. Keep answers short and witty."
    };

    const conversationHistory = [systemPrompt, ...formattedMessages];

    const botReply = await generateChatResponse(conversationHistory);

    const botMessage = {
      user: userId,
      role: "assistant",
      content: botReply
    };
    const botResponse = await BotConversation.create(botMessage);

    const formattedBotResponse = {
      _id: botResponse._id,
      sender: {
        _id: "universal_ai_bot",
        name: "StarkBot AI",
        email: "bot@starknet.ai"
      },
      receiver: userId,
      content: botReply,
      createdAt: botResponse.createdAt
    };

    socket.emit("receive_message", formattedBotResponse);

  } catch (error) {
    console.error("Bot Chat Error:", error);
  }
};

module.exports = { handleBotChat };
