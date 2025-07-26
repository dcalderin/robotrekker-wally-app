const { app } = require('@azure/functions');

// Simple content filter for truly inappropriate content
function containsInappropriateContent(text) {
    const blockedWords = [
        'violence', 'weapon', 'hate', 'kill', 'hurt', 'bomb', 'gun', 
        'inappropriate', 'sexual', 'drug', 'alcohol', 'suicide'
    ];
    const lowerText = text.toLowerCase();
    return blockedWords.some(word => lowerText.includes(word));
}

function generateSafeResponse(prompt, userName) {
    return `Hi ${userName}! 🛡️ I noticed your message might not be appropriate for our family-friendly chat. Let's talk about something positive and educational instead! What would you like to learn about today?`;
}

async function callOpenAI(prompt, userName, conversationHistory, context) {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
        throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are Wally, the AI companion for team RobotTrekker! 🚀🤖 Just like your namesake from the movie, you're curious, helpful, and love exploring new ideas. You're here to mentor the RobotTrekker team with FIRST Lego League and academics.

Your mission:
- Support FIRST Lego League 2025 challenge preparation  
- Guide coding and robot design thinking (EV3, Spike Prime, etc.)
- Help with math and school subjects through guided learning
- Promote academic integrity and honest learning

Your personality (like WALL-E):
- Curious and enthusiastic about discovery
- Patient and supportive mentor
- Clever problem-solver who thinks step-by-step
- Celebrates small wins and learning moments
- Remember and build on previous conversation topics

Your approach:
- NEVER give direct answers to homework/test questions
- If you detect a screenshot of homework/tests, say: "Whoa! I notice this looks like schoolwork! Just like how I can't do the work for you on our robot, I can't solve your homework directly. But I'd love to teach you the concepts and work through a similar example together! Learning the process is way more fun than just getting an answer! 🛠️📚"
- For math: Explain concepts, show methods, create similar practice problems
- For FLL: Discuss strategy, coding concepts, engineering principles
- Always ask guiding questions to help them think through problems
- Reference previous parts of the conversation when relevant

Guidelines:
- Ages 6-16 appropriate language
- Use FIRST core values: Discovery, Innovation, Impact, Inclusion, Teamwork, Fun
- Make learning feel like exploration and building together
- Celebrate mistakes as learning opportunities
- Reference building and engineering when helpful

The user's name is ${userName} from team RobotTrekker. Be their supportive AI teammate! 🏆`;

    // Build messages array with conversation history
    const messages = [{ role: 'system', content: systemPrompt }];
    
    // Add conversation history (last 6 messages to stay within token limits)
    if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-6);
        messages.push(...recentHistory);
    }
    
    // Add current user message
    messages.push({ role: 'user', content: prompt });

    const requestBody = JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 300,
        temperature: 0.7
    });

    try {
        // Use the built-in fetch from Node.js 18+
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: requestBody
        });

        context.log(`OpenAI API response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            context.log(`OpenAI API error: ${response.status} - ${errorText}`);
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        context.log(`Error calling OpenAI: ${error.message}`);
        throw error;
    }
}

app.http('ChatProxy', {
    methods: ['GET', 'POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Chat proxy function triggered');

        const headers = {
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-ms-request-id',
            'Access-Control-Max-Age': '86400'
        };

        if (request.method === 'OPTIONS') {
            return { status: 200, headers, body: '' };
        }

        if (request.method === 'GET') {
            return {
                status: 200,
                headers,
                jsonBody: { 
                    message: 'Wally is ready to help team RobotTrekker! 🚀🤖',
                    timestamp: new Date().toISOString(),
                    version: '1.4-wally'
                }
            };
        }

        try {
            const body = await request.json();
            const { prompt, childId, userName, conversationHistory } = body;

            context.log(`Received request from ${userName}: ${prompt}`);
            context.log(`Conversation history length: ${conversationHistory ? conversationHistory.length : 0}`);

            if (!prompt || !childId) {
                context.log('Missing prompt or childId');
                return {
                    status: 400,
                    headers,
                    jsonBody: { error: 'Missing prompt or childId' }
                };
            }

            // Safety check for inappropriate content
            if (containsInappropriateContent(prompt)) {
                context.log(`⚠️ SAFETY: Blocked inappropriate content from ${userName}: ${prompt}`);
                return {
                    status: 200,
                    headers,
                    jsonBody: {
                        response: generateSafeResponse(prompt, userName),
                        timestamp: new Date().toISOString(),
                        childId: childId,
                        userName: userName,
                        safety_flagged: true
                    }
                };
            }

            // Call OpenAI for educational content with conversation history
            context.log(`📝 CALLING OPENAI: ${userName} (${childId}) asked: "${prompt}"`);
            
            const aiResponse = await callOpenAI(prompt, userName, conversationHistory, context);

            context.log(`🤖 OPENAI SUCCESS: Response length: ${aiResponse.length}`);

            return {
                status: 200,
                headers,
                jsonBody: {
                    response: aiResponse,
                    timestamp: new Date().toISOString(),
                    childId: childId,
                    userName: userName,
                    safety_checked: true,
                    openai_used: true
                }
            };

        } catch (error) {
            context.log('❌ ERROR:', error.message);
            context.log('Error stack:', error.stack);
            
            // Fallback response if OpenAI fails
            const fallbackResponse = `Hi ${request.body?.userName || 'there'}! I'm having a little trouble right now, but I still want to help! Your question about "${request.body?.prompt || 'that topic'}" is great. Try asking me again in a moment! 🤖`;
            
            return {
                status: 200,
                headers,
                jsonBody: { 
                    response: fallbackResponse,
                    timestamp: new Date().toISOString(),
                    childId: request.body?.childId,
                    userName: request.body?.userName,
                    error_fallback: true,
                    error_message: error.message
                }
            };
        }
    }
});