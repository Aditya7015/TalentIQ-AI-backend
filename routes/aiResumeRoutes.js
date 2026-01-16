// routes/aiResumeRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Your OpenRouter API Key (same as chatbot)
// const OPENROUTER_API_KEY = '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';
// const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL;


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
        7. Keep each section focused and impactful`;

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
        
        Please generate the resume sections in JSON format with the following structure:
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

        // Prepare the API request
        const requestData = {
            model: 'openai/gpt-3.5-turbo',
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
            max_tokens: 1500
        };

        // Make API call
        const response = await axios.post(OPENROUTER_API_URL, requestData, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'ATS-AI Resume Builder'
            },
            timeout: 45000 // 45 seconds for resume generation
        });

        // Parse the response
        const aiResponse = response.data.choices[0].message.content;
        
        // Try to parse JSON from response
        let parsedResume;
        try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                             aiResponse.match(/{[\s\S]*}/);
            
            if (jsonMatch) {
                parsedResume = JSON.parse(jsonMatch[1]);
            } else {
                parsedResume = JSON.parse(aiResponse);
            }
        } catch (parseError) {
            console.log('Could not parse JSON, using raw response');
            // If JSON parsing fails, return structured sections
            parsedResume = {
                summary: aiResponse,
                experience: userData.experience || '',
                skills: userData.skills || '',
                education: userData.education || ''
            };
        }

        res.json({
            success: true,
            resume: parsedResume,
            rawResponse: aiResponse,
            usage: response.data.usage,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Resume Generation Error:', error.response?.data || error.message);
        
        let errorMessage = 'Failed to generate resume';
        if (error.response?.status === 401) {
            errorMessage = 'AI service authentication failed';
        } else if (error.response?.status === 429) {
            errorMessage = 'Rate limit exceeded. Please try again in a few minutes.';
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timeout. The resume generation is taking too long.';
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage,
            details: error.response?.data
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

        const requestData = {
            model: 'openai/gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 800
        };

        const response = await axios.post(OPENROUTER_API_URL, requestData, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'ATS-AI Cover Letter'
            }
        });

        res.json({
            success: true,
            coverLetter: response.data.choices[0].message.content,
            usage: response.data.usage
        });

    } catch (error) {
        console.error('Cover Letter Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate cover letter'
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

        const requestData = {
            model: 'openai/gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        };

        const response = await axios.post(OPENROUTER_API_URL, requestData, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({
            success: true,
            improvedText: response.data.choices[0].message.content,
            usage: response.data.usage
        });

    } catch (error) {
        console.error('Improvement Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to improve text'
        });
    }
});

// Resume templates
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

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'AI Resume Builder API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;