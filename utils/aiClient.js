// aiClient.js - UPDATED WITH CURRENT GROQ MODELS
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Current Groq models (as of 2024)
const AVAILABLE_MODELS = [
  'llama-3.3-70b-versatile',  // Latest Llama 3.3 model
  'llama-3.2-1b-preview',
  'llama-3.2-3b-preview',
  'llama-3.2-11b-vision-preview',
  'llama-3.2-90b-vision-preview',
  'llama-3.1-8b-instant',
  'llama-3.1-70b-versatile',
  'llama-3.1-405b-reasoning',  // Large model for complex tasks
  'mixtral-8x7b-32768',
  'gemma2-9b-it'
];

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

const aiClient = async (prompt) => {
  try {
    const completion = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
};

module.exports = aiClient;