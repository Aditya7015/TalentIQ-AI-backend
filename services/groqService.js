// // services/groqService.js
// const Groq = require('groq-sdk');

// // Initialize Groq client
// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// // Available Groq models (update as needed)
// const AVAILABLE_MODELS = {
//   'llama3-8b-8192': 'llama3-8b-8192',
//   'llama3-70b-8192': 'llama3-70b-8192',
//   'mixtral-8x7b-32768': 'mixtral-8x7b-32768',
//   'gemma2-9b-it': 'gemma2-9b-it',
//   // Add more models as needed
// };

// // Default model
// const DEFAULT_MODEL = 'llama3-8b-8192';

// /**
//  * Send a chat completion request to Groq
//  * @param {Array} messages - Array of message objects with role and content
//  * @param {Object} options - Additional options
//  * @returns {Promise<Object>} - Response from Groq API
//  */
// exports.chatCompletion = async (messages, options = {}) => {
//   try {
//     const {
//       model = DEFAULT_MODEL,
//       temperature = 0.7,
//       max_tokens = 1000,
//       stream = false,
//       ...otherOptions
//     } = options;

//     const completion = await groq.chat.completions.create({
//       model: AVAILABLE_MODELS[model] || model,
//       messages,
//       temperature,
//       max_tokens,
//       stream,
//       ...otherOptions
//     });

//     return completion;
//   } catch (error) {
//     console.error('Groq API Error:', error);
//     throw error;
//   }
// };

// /**
//  * Test the Groq connection
//  * @returns {Promise<Object>} - Test result
//  */
// exports.testConnection = async () => {
//   try {
//     const completion = await groq.chat.completions.create({
//       model: DEFAULT_MODEL,
//       messages: [
//         { role: 'user', content: 'Hello, are you working?' }
//       ],
//       max_tokens: 20
//     });

//     return {
//       success: true,
//       message: 'Groq API is working',
//       response: completion.choices[0].message.content
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: error.message
//     };
//   }
// };

// /**
//  * List available models
//  * @returns {Promise<Array>} - List of available models
//  */
// exports.listModels = async () => {
//   try {
//     const models = await groq.models.list();
//     return models.data;
//   } catch (error) {
//     console.error('Failed to fetch models:', error);
//     return [];
//   }
// };

// module.exports = exports;

// services/groqService.js
const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Current Groq models
const AVAILABLE_MODELS = {
  'gpt-oss-20b': 'openai/gpt-oss-20b',
  'gpt-oss-120b': 'openai/gpt-oss-120b',
};

// Default model
const DEFAULT_MODEL = 'openai/gpt-oss-20b';

/**
 * Send a chat completion request to Groq
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Response from Groq API
 */
exports.chatCompletion = async (messages, options = {}) => {
  try {
    const {
      model = DEFAULT_MODEL,
      temperature = 0.7,
      max_tokens = 1000,
      stream = false,
      ...otherOptions
    } = options;

    // Convert friendly model name to actual Groq model ID
    const selectedModel = AVAILABLE_MODELS[model] || model;

    console.log(`🤖 Groq model: ${selectedModel}`);

    const completion = await groq.chat.completions.create({
      model: selectedModel,
      messages,
      temperature,
      max_tokens,
      stream,
      ...otherOptions
    });

    return completion;

  } catch (error) {
    console.error('❌ Groq API Error:', error.message);

    if (error.status) {
      console.error('Status:', error.status);
    }

    throw error;
  }
};

/**
 * Test the Groq connection
 * @returns {Promise<Object>} - Test result
 */
exports.testConnection = async () => {
  try {
    const completion = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'user',
          content: 'Hello, are you working? Reply with: Groq is working.'
        }
      ],
      max_tokens: 20
    });

    return {
      success: true,
      model: DEFAULT_MODEL,
      message: 'Groq API is working',
      response: completion.choices[0].message.content
    };

  } catch (error) {
    console.error('❌ Groq connection test failed:', error.message);

    return {
      success: false,
      model: DEFAULT_MODEL,
      error: error.message
    };
  }
};

/**
 * List available models
 * @returns {Promise<Array>} - List of available models
 */
exports.listModels = async () => {
  try {
    const models = await groq.models.list();

    return models.data;

  } catch (error) {
    console.error('❌ Failed to fetch Groq models:', error.message);
    return [];
  }
};

module.exports = exports;