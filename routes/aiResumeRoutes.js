// routes/aiResumeRoutes.js
const express = require('express');
const Groq = require('groq-sdk');
const router = express.Router();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Use the model that's working for chatbot
const DEFAULT_MODEL = 'openai/gpt-oss-20b'; // Or use whichever model your chatbot is using successfully

// Generate resume sections
router.post('/generate', async (req, res) => {
    try {
        const { 
            userData, 
            jobDescription, 
            template = 'modern',
            sections = ['summary', 'experience', 'skills', 'education'] 
        } = req.body;

        // Validate input
        if (!userData || !userData.name) {
            return res.status(400).json({
                success: false,
                error: 'User data with name is required'
            });
        }

        console.log('Generating AI resume for:', userData.name);

        // Prepare the system prompt for resume generation
        const systemPrompt = `You are a professional resume builder AI. Generate high-quality resume content based on the user's information and target job description.

        INSTRUCTIONS:
        1. Use professional, concise language
        2. Focus on achievements and results
        3. Use action verbs (developed, managed, implemented, etc.)
        4. Quantify achievements where possible (increased by 30%, reduced time by 20%, etc.)
        5. Tailor content specifically to the target job
        6. Use industry-standard terminology
        7. Keep each section focused and impactful
        8. IMPORTANT: Your response MUST be valid JSON format only, no other text`;

        // Prepare user prompt
        const userPrompt = `Generate a professional resume with the following information:

        CANDIDATE INFORMATION:
        - Name: ${userData.name}
        - Email: ${userData.email || 'Not provided'}
        - Phone: ${userData.phone || 'Not provided'}
        - Location: ${userData.location || 'Not provided'}
        
        ${userData.experience ? `EXPERIENCE:\n${userData.experience}` : 'No experience provided'}
        
        ${userData.education ? `EDUCATION:\n${userData.education}` : 'No education provided'}
        
        ${userData.skills ? `SKILLS:\n${userData.skills}` : 'No skills provided'}
        
        ${userData.projects ? `PROJECTS:\n${userData.projects}` : ''}
        
        ${userData.certifications ? `CERTIFICATIONS:\n${userData.certifications}` : ''}
        
        ${userData.achievements ? `ACHIEVEMENTS:\n${userData.achievements}` : ''}
        
        TARGET JOB DESCRIPTION:
        ${jobDescription || 'General professional resume'}
        
        REQUESTED SECTIONS: ${sections.join(', ')}
        
        TEMPLATE STYLE: ${template}
        
        Please generate ONLY valid JSON with the following structure:
        {
          "summary": "Professional summary here...",
          "experience": "Experience section here...",
          "skills": "Skills section here...",
          "education": "Education section here...",
          "projects": "Projects section here...",
          "certifications": "Certifications section here...",
          "achievements": "Achievements section here..."
        }
        
        Only include the sections that were requested and for which data was provided.`;

        // Make API call to Groq
        const completion = await groq.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: "json_object" } // Force JSON response
        });

        // Parse the response
        const aiResponse = completion.choices[0].message.content;
        
        console.log('Raw AI Response:', aiResponse.substring(0, 200) + '...');
        
        // Try to parse JSON from response
        let parsedResume;
        try {
            // Try direct JSON parse first
            parsedResume = JSON.parse(aiResponse);
        } catch (parseError) {
            console.log('Direct JSON parse failed, trying to extract JSON...');
            try {
                // Extract JSON from markdown code blocks if present
                const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                                 aiResponse.match(/{\s*"summary"[\s\S]*}/);
                
                if (jsonMatch) {
                    parsedResume = JSON.parse(jsonMatch[1].trim());
                } else {
                    throw new Error('No JSON found in response');
                }
            } catch (secondError) {
                console.log('JSON extraction failed, creating structured response from raw text');
                // If JSON parsing fails, create a structured response
                parsedResume = {
                    summary: aiResponse.split('\n')[0] || "Professional summary",
                    experience: userData.experience || '',
                    skills: userData.skills || '',
                    education: userData.education || '',
                    note: "AI response was not valid JSON, using structured format"
                };
            }
        }

        res.json({
            success: true,
            resume: parsedResume,
            rawResponse: aiResponse.substring(0, 500) + '...',
            usage: completion.usage,
            model_used: DEFAULT_MODEL,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Resume Generation Error:', error.message);
        
        let errorMessage = 'Failed to generate resume';
        if (error.status === 401) {
            errorMessage = 'AI service authentication failed';
        } else if (error.status === 429) {
            errorMessage = 'Rate limit exceeded. Please try again in a few minutes.';
        } else if (error.message?.includes('model_not_found')) {
            errorMessage = 'AI model not available. Please try a different model.';
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage,
            details: error.message,
            model_attempted: DEFAULT_MODEL
        });
    }
});

// Generate cover letter
router.post('/generate-cover-letter', async (req, res) => {
    try {
        const { userData, jobDescription, companyName, hiringManager } = req.body;

        const prompt = `Write a professional cover letter for ${userData.name} applying for a position at ${companyName || 'a company'}.
        
        Candidate Info:
        - Experience: ${userData.experience || 'Not provided'}
        - Skills: ${userData.skills || 'Not provided'}
        - Education: ${userData.education || 'Not provided'}
        
        Job Description: ${jobDescription}
        
        ${hiringManager ? `Hiring Manager: ${hiringManager}` : ''}
        
        Requirements:
        1. Professional tone
        2. Highlight relevant skills and experience
        3. Show enthusiasm for the role
        4. Keep it to 3-4 paragraphs
        5. Include appropriate salutation and closing`;

        const completion = await groq.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 800
        });

        res.json({
            success: true,
            coverLetter: completion.choices[0].message.content,
            usage: completion.usage,
            model_used: DEFAULT_MODEL
        });

    } catch (error) {
        console.error('Cover Letter Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate cover letter',
            details: error.message
        });
    }
});

// Improve existing resume text
router.post('/improve', async (req, res) => {
    try {
        const { text, purpose, tone = 'professional' } = req.body;

        const prompt = `Improve the following resume text. Make it more ${tone} and effective for ${purpose}.

        Original text: ${text}
        
        Provide the improved version with a brief explanation of the changes.`;

        const completion = await groq.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        res.json({
            success: true,
            improvedText: completion.choices[0].message.content,
            usage: completion.usage,
            model_used: DEFAULT_MODEL
        });

    } catch (error) {
        console.error('Improvement Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to improve text',
            details: error.message
        });
    }
});

// Resume templates (UNCHANGED)
router.get('/templates', (req, res) => {
    const templates = [
        {
            id: 'modern',
            name: 'Modern Professional',
            description: 'Clean, contemporary design with emphasis on skills and achievements',
            color: 'from-blue-600 to-purple-600',
            icon: '💼'
        },
        {
            id: 'creative',
            name: 'Creative',
            description: 'For designers, artists, and creative professionals',
            color: 'from-pink-500 to-rose-500',
            icon: '🎨'
        },
        {
            id: 'executive',
            name: 'Executive',
            description: 'Formal layout for senior-level positions',
            color: 'from-gray-700 to-gray-900',
            icon: '👔'
        },
        {
            id: 'technical',
            name: 'Technical',
            description: 'Focus on projects, technologies, and technical skills',
            color: 'from-green-500 to-teal-500',
            icon: '⚙️'
        },
        {
            id: 'minimal',
            name: 'Minimal',
            description: 'Simple, clean, and highly readable',
            color: 'from-indigo-500 to-blue-500',
            icon: '📄'
        }
    ];

    res.json({
        success: true,
        templates
    });
});

// Health check with model test
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
            message: 'AI Resume Builder API is running with Groq',
            groq_status: 'working',
            model_used: DEFAULT_MODEL,
            test_response: completion.choices[0].message.content,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            success: false,
            message: 'AI Resume Builder API is running but Groq test failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Test different models
router.get('/test-models', async (req, res) => {
    try {
        const modelsToTest = [
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
            'mixtral-8x7b-32768',
            'gemma2-9b-it'
        ];
        
        const results = [];
        
        for (const model of modelsToTest) {
            try {
                const startTime = Date.now();
                const completion = await groq.chat.completions.create({
                    model: model,
                    messages: [{ role: 'user', content: 'Say "test" in one word' }],
                    max_tokens: 5,
                    temperature: 0.1
                });
                
                const endTime = Date.now();
                
                results.push({
                    model: model,
                    status: 'working',
                    response: completion.choices[0].message.content.trim(),
                    response_time: endTime - startTime + 'ms'
                });
            } catch (error) {
                results.push({
                    model: model,
                    status: 'failed',
                    error: error.message
                });
            }
        }
        
        res.json({
            success: true,
            models_tested: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;