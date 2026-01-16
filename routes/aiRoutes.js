// routes/aiRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Your OpenRouter API Key
// const OPENROUTER_API_KEY = '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';
// const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL;

// console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY);
// console.log("OPENROUTER_API_URL:", process.env.OPENROUTER_API_URL);



// Store conversation history
const chatSessions = new Map();

// System prompt for ATS
const SYSTEM_PROMPT = `You are CareerBot, an AI assistant for ATS-AI Job Portal. Help users with:
- Resume building and optimization
- Cover letter writing
- Interview preparation
- Job search strategies
- Career advice
- Technical questions about the platform

Be professional, helpful, and concise.`;

// Get or create session
const getChatSession = (sessionId) => {
    if (!chatSessions.has(sessionId)) {
        chatSessions.set(sessionId, {
            messages: [
                { role: 'system', content: SYSTEM_PROMPT }
            ],
            createdAt: new Date(),
            lastActive: new Date()
        });
    }
    return chatSessions.get(sessionId);
};

// Test AI endpoint
router.post('/test-ai', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Prepare request to OpenRouter
        const requestData = {
            model: 'openai/gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ],
            max_tokens: 200,
            temperature: 0.7
        };

        console.log('Sending request to OpenRouter...');

        const response = await axios.post(OPENROUTER_API_URL, requestData, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'ATS-AI Portal'
            },
            timeout: 30000
        });

        console.log('OpenRouter response received');

        res.json({
            success: true,
            response: response.data.choices[0].message.content,
            usage: response.data.usage
        });

    } catch (error) {
        console.error('AI Test Error:', error.response?.data || error.message);
        
        let errorMessage = 'Failed to process request';
        
        if (error.response?.status === 401) {
            errorMessage = 'Invalid API key. Check your OpenRouter API key.';
        } else if (error.response?.status === 429) {
            errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timeout. Please try again.';
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage,
            details: error.response?.data
        });
    }
});

// Chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message, sessionId = 'default', context } = req.body;
        
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        const session = getChatSession(sessionId);
        session.lastActive = new Date();

        // Add user message
        session.messages.push({
            role: 'user',
            content: `${context?.role ? context.role + ': ' : ''}${message}`
        });

        // Prepare request
        const requestData = {
            model: 'openai/gpt-3.5-turbo',
            messages: session.messages,
            max_tokens: 500,
            temperature: 0.7
        };

        const response = await axios.post(OPENROUTER_API_URL, requestData, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'ATS-AI Chatbot'
            },
            timeout: 30000
        });

        const aiResponse = response.data.choices[0].message.content;

        // Add AI response
        session.messages.push({
            role: 'assistant',
            content: aiResponse
        });

        // Keep only last 20 messages
        if (session.messages.length > 20) {
            session.messages = [
                session.messages[0], // Keep system prompt
                ...session.messages.slice(-19)
            ];
        }

        res.json({
            success: true,
            response: aiResponse,
            sessionId,
            usage: response.data.usage
        });

    } catch (error) {
        console.error('Chat Error:', error.message);
        
        res.status(500).json({
            success: false,
            response: "I'm having technical difficulties. Please try again.",
            sessionId: req.body.sessionId || 'default'
        });
    }
});

// Get chat history
router.get('/history/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = chatSessions.get(sessionId);

        if (!session) {
            return res.json({
                success: true,
                messages: [],
                sessionId
            });
        }

        res.json({
            success: true,
            messages: session.messages.filter(msg => msg.role !== 'system'),
            sessionId,
            lastActive: session.lastActive
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'AI API is running',
        timestamp: new Date().toISOString(),
        activeSessions: chatSessions.size
    });
});

module.exports = router;