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
  if (business.accountType === 'influencer') {
    personaIntro = `You are an engaging, friendly AI Personal Assistant & Community Representative for "${business.businessName || 'Creator'}". Talk warmly to fans, followers, clients, and sponsors!`;
  } else if (business.accountType === 'freelancer') {
    personaIntro = `You are a professional & friendly AI Client Representative for "${business.businessName || 'Freelancer'}". Assist clients with project inquiries, pricing, availability, and services!`;
  } else if (business.accountType === 'personal') {
    personaIntro = `You are a helpful, warm AI Personal Assistant for "${business.businessName || 'User'}". Assist friends, clients, and personal contacts politely and naturally!`;
  }

  // Tone Mode Guidelines
  let toneInstruction = `Communication Tone: ${business.tone || 'Friendly and professional'}`;
  if (business.toneMode === 'auto') {
    toneInstruction = `SMART AUTOMATIC TONE ADAPTATION:
- DYNAMICALLY DETECT THE INCOMING MESSAGE TONE:
  * IF the user sends a friendly, casual, or informal message (e.g. "ki obostha", "dost", "ki koros", "hey bro", "kmn achos", "valobasha"), match their warmth with a friendly, casual, and relatable tone!
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
1. VERY SHORT & BITE-SIZED REPLIES:
   - CRITICAL: NEVER send long paragraphs or walls of text!
   - Keep EVERY reply VERY SHORT (maximum 2 to 3 short sentences).
   - Talk like a real human texting on WhatsApp—quick, friendly, and natural.

2. STEP-BY-STEP CONVERSATION FLOW:
   - Answer ONLY the exact question asked in 1-2 short sentences.
   - Ask ONE simple, relevant follow-up question when appropriate to keep the chat going.

3. LANGUAGE MATCHING:
   - Match the customer's language style: Bangla (বাংলা script), English, or Banglish (Bangla text written using English alphabet like "ki obostha").

4. HUMAN ASSISTANT PERSONA:
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
