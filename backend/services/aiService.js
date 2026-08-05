const axios = require('axios');

// In-memory conversation history store per customer: { [userId_senderJid]: [{ role, content }] }
const conversationHistory = new Map();

/**
 * Clean and format conversation history
 */
const getHistory = (key) => {
  if (!conversationHistory.has(key)) {
    return [];
  }
  return conversationHistory.get(key);
};

const updateHistory = (key, role, content) => {
  const history = getHistory(key);
  history.push({ role, content });
  // Keep last 10 messages for context
  if (history.length > 10) {
    history.shift();
  }
  conversationHistory.set(key, history);
};

/**
 * Generate AI Response with DeepSeek or fallback keyword template
 */
const generateResponse = async (userId, senderJid, userMessage, business, pushName = '') => {
  const key = `${userId}_${senderJid}`;

  // Step 1: Check Keyword Templates first if AI is disabled or as fallback check
  const checkTemplateMatch = () => {
    if (!business || !business.templates || business.templates.length === 0) {
      return null;
    }
    const cleanMsg = userMessage.toLowerCase().trim();
    for (const item of business.templates) {
      const kw = item.keyword.toLowerCase().trim();
      if (cleanMsg.includes(kw) || cleanMsg === kw) {
        return item.reply;
      }
    }
    return null;
  };

  // If AI is explicitly disabled by the business owner
  if (!business || business.aiEnabled === false) {
    const templateMatch = checkTemplateMatch();
    if (templateMatch) return templateMatch;
    return 'ধন্যবাদ! আপনার মেসেজের জন্য ধন্যবাদ। আমরা দ্রুত আপনার সাথে যোগাযোগ করব।';
  }

  // Step 2: Try DeepSeek API if AI is enabled
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';

  if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
    console.warn('DEEPSEEK_API_KEY is not configured. Falling back to templates/default message.');
    const templateMatch = checkTemplateMatch();
    if (templateMatch) return templateMatch;
    return 'ধন্যবাদ! আপনার মেসেজের জন্য ধন্যবাদ। আমরা দ্রুত আপনার সাথে যোগাযোগ করব।';
  }

  const customerName = pushName && pushName.trim() ? pushName.trim() : 'Customer';

  // Persona Adaptation based on accountType (business, influencer, freelancer, personal)
  let personaIntro = `You are a human-like, friendly, and smart AI assistant for "${business.businessName || 'Business'}".`;
  if (business.accountType === 'personal') {
    personaIntro = `You are a warm, natural, and smart Personal AI Assistant chatting on behalf of "${business.businessName || 'User'}".
- CASUAL & FRIEND CHAT: When friends or contacts send casual messages or greetings (e.g. "hi", "hello", "কেমন আছো", "কী খবর", "dost ki obostha"), DO NOT sound like a customer support bot or sales pitch! Reply naturally, warmly, and politely like a real human friend (e.g. "আমি ভালো আছি ভাই! আপনি কেমন আছেন? 😊").
- BUSINESS & SERVICE INQUIRIES: If the contact asks about products, services, pricing, or business, seamlessly provide the exact relevant details from the Knowledge Base below!`;
  } else if (business.accountType === 'influencer') {
    personaIntro = `You are an engaging, friendly AI Personal Representative for "${business.businessName || 'Creator'}". Chat warmly with fans and followers, and professionally with brand sponsors!`;
  } else if (business.accountType === 'freelancer') {
    personaIntro = `You are a professional & friendly AI Client Representative for "${business.businessName || 'Freelancer'}". Respond warmly to greetings and provide project rates & availability for business inquiries!`;
  }

  // Tone Mode Guidelines
  let toneInstruction = `Communication Tone: ${business.tone || 'Friendly and professional'}`;
  if (business.toneMode === 'auto') {
    toneInstruction = `SMART AUTOMATIC TONE ADAPTATION:
- DYNAMICALLY DETECT THE INCOMING MESSAGE TONE:
  * IF the user sends a friendly, casual, or informal message (e.g. "ki obostha", "dost", "ki koros", "hey bro", "kmn achos", "valobasha", "hi bro"), match their warmth with a friendly, casual, and relatable tone!
  * IF the user sends a formal, business, or official inquiry, respond in a polite, professional, and structured tone!`;
  } else if (business.toneMode === 'friendly') {
    toneInstruction = `Tone: Warm, friendly, cheerful, and approachable!`;
  } else if (business.toneMode === 'professional') {
    toneInstruction = `Tone: Highly professional, polite, formal, and precise.`;
  } else if (business.toneMode === 'casual_fun') {
    toneInstruction = `Tone: Casual, fun, energetic, with light emojis!`;
  }

  // Dynamic Training & Daily Memory Updates
  const customMemory = business.customInstructions && business.customInstructions.trim()
    ? `\nDYNAMIC REAL-TIME MEMORY & DAILY UPDATES:\n${business.customInstructions.trim()}\n`
    : '';

  const systemPrompt = `${personaIntro}
Customer WhatsApp Name: "${customerName}".

PROFILE & KNOWLEDGE BASE:
- Name/Identity: ${business.businessName || 'Not specified'}
- Account Type: ${business.accountType || 'business'}
- About: ${business.description || 'Not specified'}
- Products, Services & Pricing: ${business.products || 'Not specified'}
- Frequently Asked Questions (FAQ): ${business.faq || 'Not specified'}
- Policies: ${business.policies || 'Not specified'}
${customMemory}
${toneInstruction}

STRICT CONVERSATIONAL RULES:
1. VERY SHORT & NATURAL REPLIES:
   - CRITICAL: NEVER send long paragraphs or walls of text!
   - Keep EVERY reply VERY SHORT (maximum 2 to 3 short sentences).
   - Text like a real human on WhatsApp—quick, warm, and natural.

2. UNCLEAR / AMBIGUOUS MESSAGES HANDLING (NO HALLUCINATION):
   - IF the user's message is ambiguous, incomplete, gibberish, or hard to understand (e.g. random letters or confusing words), DO NOT make up nonsense or give a generic support pitch!
   - Politely ask for clarification: "আমি ঠিক বুঝতে পারলাম না, আপনি একটু পরিষ্কার করে বলবেন কি? 😊"

3. NO REPETITIVE ROBOTIC GREETINGS:
   - Never repeat "Welcome to Business Name! How can I help you today?" in ongoing chats or when talking to friends.

4. LANGUAGE MATCHING:
   - Match the customer's language style: Bangla (বাংলা script), English, or Banglish (Bangla text written using English alphabet like "ki obostha").

5. HUMAN ASSISTANT PERSONA:
   - Be helpful, smart, and interactive. Use knowledge base & dynamic memory accurately.`;

  const history = getHistory(key);
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 15000, // 15 seconds timeout
      }
    );

    const aiReply = response.data?.choices?.[0]?.message?.content;
    if (aiReply && aiReply.trim()) {
      updateHistory(key, 'user', userMessage);
      updateHistory(key, 'assistant', aiReply.trim());
      return aiReply.trim();
    }
  } catch (error) {
    console.error('DeepSeek AI API Error:', error.response?.data || error.message);
  }

  // Step 3: Fallback if DeepSeek API fails/times out
  const templateMatch = checkTemplateMatch();
  if (templateMatch) {
    return templateMatch;
  }

  return 'ধন্যবাদ! আপনার মেসেজটি আমরা পেয়েছি। আমাদের প্রতিনিধ খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে।';
};

module.exports = {
  generateResponse,
};
