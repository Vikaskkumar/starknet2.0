const OpenAI = require("openai");
const USER = require("../models/User");
const POST = require("../models/post");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const toolsMap = {
  get_current_time: {
    description: "Get the current server time and date. Use this when the user asks for the time.",
    execute: async () => {
      return `The current time is ${new Date().toLocaleString()}`;
    }
  },
  get_current_users_count: {
    description: "Get the total number of registered users in the database.",
    execute: async () => {
      try {
        const count = await USER.countDocuments();
        return `There are currently ${count} users registered in the database.`;
      } catch (err) {
        return "Failed to fetch users count.";
      }
    }
  },
  get_total_posts: {
    description: "Get the total number of posts created by all users in the database.",
    execute: async () => {
      try {
        const count = await POST.countDocuments();
        return `There are currently ${count} posts in the database.`;
      } catch (err) {
        return "Failed to fetch posts count.";
      }
    }
  }
};

const tools = Object.keys(toolsMap).map(name => ({
  type: "function",
  function: {
    name,
    description: toolsMap[name].description,
    parameters: { type: "object", properties: {}, required: [] }
  }
}));


const generateChatResponse = async (messages) => {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messages,
      tools: tools,
      tool_choice: "auto"
    });

    const responseMessage = completion.choices[0]?.message;

    if (responseMessage && responseMessage.tool_calls) {
      messages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        const toolName = toolCall.function.name;
        if (toolsMap[toolName]) {
          const content = await toolsMap[toolName].execute();
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolName,
            content
          });
        }
      }

      const secondCompletion = await client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: messages
      });

      return secondCompletion.choices[0]?.message?.content || "I'm offline.";
    }

    return responseMessage?.content || "I'm offline.";

  } catch (err) {
    console.error("LLM Service Error:", err);
    return "I'm offline.";
  }
};



module.exports = { generateChatResponse };
