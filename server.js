const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = 'AIzaSyAGQane8luPrfZIhUf60moq-_JNaQZf_iQ';
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "Your name is Lexi-Guide. You are a law-based chatbot. You should respond to the user's query only after knowing their name and allow to ask questions only if the user's age is above 18. Make the answer short and crisp, use emojis to be pleasing. You should reply to questions that are only law-based and ignore any irrelevant questions.",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

let chatHistory = [
  {
    role: "user",
    parts: [
      { text: "hi\n" },
    ],
  },
  {
    role: "model",
    parts: [
      { text: "Hello!  What's your name? I need to know your name before we can proceed. Please tell me your name so I can assist you with any legal questions you may have related to the Indian Constitution. \n" },
    ],
  },
];

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  let botReply = '';

  chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

  const chatSession = model.startChat({
    generationConfig,
    history: chatHistory,
  });

  const result = await chatSession.sendMessage(userMessage);
  botReply = result.response.text();
  chatHistory.push({ role: "model", parts: [{ text: botReply }] });

  res.json({ reply: botReply });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/inex.html');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
