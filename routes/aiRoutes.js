// routes/aiRoutes.js
const express = require('express');
const Groq = require('groq-sdk');
const router = express.Router();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Current Groq models
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const CHAT_MODEL = 'llama-3.1-8b-instant'; // Faster model for chat

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

        console.log('Sending request to Groq...');

        const completion = await groq.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ],
            max_tokens: 200,
            temperature: 0.7
        });

        console.log('Groq response received');

        res.json({
            success: true,
            response: completion.choices[0].message.content,
            usage: completion.usage,
            model_used: DEFAULT_MODEL
        });

    } catch (error) {
        console.error('AI Test Error:', error.message);
        
        let errorMessage = 'Failed to process request';
        
        if (error.status === 401) {
            errorMessage = 'Invalid API key. Check your Groq API key.';
        } else if (error.status === 429) {
            errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (error.message?.includes('decommissioned')) {
            errorMessage = 'Model is no longer available. Please check available models.';
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage,
            details: error.message
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

        // Call Groq API - using faster model for chat
        const completion = await groq.chat.completions.create({
            model: CHAT_MODEL,
            messages: session.messages,
            max_tokens: 500,
            temperature: 0.7
        });

        const aiResponse = completion.choices[0].message.content;

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
            usage: completion.usage,
            model_used: CHAT_MODEL
        });

    } catch (error) {
        console.error('Chat Error:', error.message);
        
        // Try with alternative model if first fails
        if (error.message?.includes('decommissioned') || error.message?.includes('not found')) {
            try {
                // Fallback to a different model
                const session = getChatSession(req.body.sessionId || 'default');
                const completion = await groq.chat.completions.create({
                    model: 'mixtral-8x7b-32768', // Alternative model
                    messages: session.messages,
                    max_tokens: 500,
                    temperature: 0.7
                });
                
                const aiResponse = completion.choices[0].message.content;
                
                res.json({
                    success: true,
                    response: aiResponse,
                    sessionId: req.body.sessionId || 'default',
                    usage: completion.usage,
                    model_used: 'mixtral-8x7b-32768',
                    note: 'Used fallback model'
                });
                return;
            } catch (fallbackError) {
                console.error('Fallback model also failed:', fallbackError.message);
            }
        }
        
        res.status(500).json({
            success: false,
            response: "I'm having technical difficulties. Please try again.",
            sessionId: req.body.sessionId || 'default',
            error: error.message
        });
    }
});

// Get chat history (UNCHANGED)
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

// List available models
router.get('/models', async (req, res) => {
    try {
        const models = await groq.models.list();
        const availableModels = models.data.map(m => ({
            id: m.id,
            object: m.object,
            created: m.created
        }));
        
        res.json({
            success: true,
            models: availableModels,
            count: availableModels.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
router.get('/health', async (req, res) => {
    try {
        // Test if Groq is working
        const completion = await groq.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [{ role: 'user', content: 'Say hello in one word' }],
            max_tokens: 10
        });

        res.json({
            success: true,
            message: 'AI API is running with Groq',
            groq_status: 'working',
            model_used: DEFAULT_MODEL,
            test_response: completion.choices[0].message.content,
            timestamp: new Date().toISOString(),
            activeSessions: chatSessions.size
        });
    } catch (error) {
        res.json({
            success: false,
            message: 'AI API is running but Groq test failed',
            error: error.message,
            timestamp: new Date().toISOString(),
            activeSessions: chatSessions.size
        });
    }
});

module.exports = router;