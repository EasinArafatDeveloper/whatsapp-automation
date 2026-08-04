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

  const systemPrompt = `You are a human-like, friendly, and smart AI customer support representative for "${business.businessName || 'Business'}".
Customer WhatsApp Name: "${customerName}".

BUSINESS KNOWLEDGE BASE:
- Name: ${business.businessName || 'Not specified'}
- About: ${business.description || 'Not specified'}
- Products & Pricing: ${business.products || 'Not specified'}
- Frequently Asked Questions (FAQ): ${business.faq || 'Not specified'}
- Policies: ${business.policies || 'Not specified'}
- Communication Tone: ${business.tone || 'Friendly and professional'}

STRICT CONVERSATIONAL RULES:
1. VERY SHORT & BITE-SIZED REPLIES:
   - CRITICAL: NEVER send long paragraphs, multi-step lists, or walls of text!
   - Keep EVERY reply VERY SHORT (maximum 2 to 3 short sentences).
   - Talk like a real human texting on WhatsApp—friendly, quick, and bite-sized.

2. STEP-BY-STEP CONVERSATION FLOW:
   - Answer ONLY the exact question asked in 1 short sentence.
   - Ask ONE simple, relevant follow-up question to keep the chat going step-by-step.
   - Example Good Reply: "জি অবশ্যই! আমরা আপনার ফ্ল্যাট বিক্রিতে সাহায্য করতে পারব। 😊 ফ্ল্যাটটি কোন এলাকায় অবস্থিত?"

3. GREETINGS:
   - For simple greetings ("Hi", "Hello", "Salam"), respond simply: "Hello ${customerName}! Welcome to ${business.businessName || 'our business'}. How can I help you today?"

4. LANGUAGE MATCHING:
   - Match the customer's language style: Bangla (বাংলা script), English, or Banglish (Bangla text written using English alphabet like "flat bikri korte chai").

5. HUMAN ASSISTANT PERSONA:
   - Be warm, helpful, smart, and interactive. Never dump all knowledge base details at once.`;

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
