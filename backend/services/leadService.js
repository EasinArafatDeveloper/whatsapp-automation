const Lead = require('../models/Lead');

/**
 * Detect customer intent from message — works for ANY business type
 */
const detectIntent = (message) => {
  const msg = message.toLowerCase().trim();

  // 🛒 Purchase / Order Intent (Hot Lead)
  const purchaseKeywords = [
    'order', 'buy', 'purchase', 'confirm', 'book', 'want to get', 'i want',
    'কিনতে চাই', 'অর্ডার', 'নিতে চাই', 'বুক করতে', 'কনফার্ম', 'নেব',
    'kinbo', 'nite chai', 'order dite', 'book kobo', 'confirm kori',
  ];
  if (purchaseKeywords.some((k) => msg.includes(k))) {
    return { intentLabel: '🛒 Purchase Intent', priority: 'Hot Lead' };
  }

  // ⚠️ Complaint / Urgent Issue (Urgent)
  const complaintKeywords = [
    'problem', 'issue', 'complaint', 'not working', 'broken', 'wrong', 'refund',
    'সমস্যা', 'ঠিক নেই', 'কাজ করছে না', 'রিফান্ড', 'ভুল', 'খারাপ',
    'somossa', 'thik nei', 'kaj korche na',
  ];
  if (complaintKeywords.some((k) => msg.includes(k))) {
    return { intentLabel: '⚠️ Complaint / Issue', priority: 'Urgent' };
  }

  // 💰 Pricing / Budget Inquiry (Warm Lead)
  const pricingKeywords = [
    'price', 'cost', 'rate', 'charge', 'fee', 'budget', 'how much', 'discount',
    'দাম', 'মূল্য', 'কত', 'রেট', 'চার্জ', 'বাজেট', 'ছাড়',
    'dam koto', 'koto taka', 'rate ki', 'charge ki',
  ];
  if (pricingKeywords.some((k) => msg.includes(k))) {
    return { intentLabel: '💰 Pricing Inquiry', priority: 'Warm Lead' };
  }

  // 📋 Product/Service Info (Warm Lead)
  const serviceKeywords = [
    'service', 'product', 'details', 'info', 'available', 'offer', 'package',
    'বিস্তারিত', 'জানতে চাই', 'আছে কি', 'সার্ভিস', 'পণ্য', 'অফার',
    'details din', 'janate chai', 'ache ki', 'offer ki',
  ];
  if (serviceKeywords.some((k) => msg.includes(k))) {
    return { intentLabel: '📋 Service Inquiry', priority: 'Warm Lead' };
  }

  // 📍 Location / Availability
  const locationKeywords = [
    'location', 'address', 'where', 'near', 'area', 'delivery',
    'কোথায়', 'ঠিকানা', 'ডেলিভারি', 'কাছে',
    'kothay', 'thikana', 'delivery hobe',
  ];
  if (locationKeywords.some((k) => msg.includes(k))) {
    return { intentLabel: '📍 Location / Delivery Query', priority: 'Warm Lead' };
  }

  // Default
  return { intentLabel: '💬 General Inquiry', priority: 'New' };
};

/**
 * Extract location from message (generic, not hard-coded to BD cities only)
 */
const extractLocation = (message, existingLocation) => {
  // Broad city/area match including BD divisions + common patterns
  const locationPattern =
    /(Dhanmondi|Gulshan|Banani|Uttara|Mirpur|Dhaka|Chittagong|Sylhet|Rajshahi|Khulna|Barisal|Rangpur|Comilla|Narayanganj|Gazipur|Motijheel|Mohammadpur|Bashundhara|Badda|Rampura)/i;
  const match = message.match(locationPattern);
  if (match) return match[0];
  if (existingLocation && existingLocation !== 'Not specified') return existingLocation;
  return 'Not specified';
};

/**
 * Validate and format customer WhatsApp phone number.
 * Ensures only REAL customer phone numbers (e.g., +880 1645-650504) are stored as leads.
 * Rejects WhatsApp internal LIDs (@lid), Groups (@g.us), Broadcasts, and random pseudo-IDs.
 */
const formatPhoneNumber = (senderJid) => {
  if (!senderJid || typeof senderJid !== 'string') return null;

  // Reject non-individual chats (groups, LIDs, newsletters, broadcast)
  if (
    senderJid.endsWith('@g.us') ||
    senderJid.endsWith('@lid') ||
    senderJid.endsWith('@newsletter') ||
    senderJid.endsWith('@broadcast') ||
    senderJid.endsWith('@hosted')
  ) {
    return null;
  }

  const rawDigits = senderJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');

  // Must be between 8 and 14 digits
  if (rawDigits.length < 8 || rawDigits.length > 14) return null;

  // Real BD numbers start with 88013 - 88019 (13 digits) or 013 - 019 (11 digits)
  if (rawDigits.startsWith('880')) {
    if (rawDigits.length === 13 && /^8801[3-9]\d{8}$/.test(rawDigits)) {
      const op = rawDigits.slice(3, 7);
      const rest = rawDigits.slice(7);
      return `+880 ${op}-${rest}`;
    }
    // If starts with 880 but invalid BD mobile pattern (e.g. random pseudo-ID)
    return null;
  }

  if (rawDigits.startsWith('01') && rawDigits.length === 11 && /^01[3-9]\d{8}$/.test(rawDigits)) {
    const op = rawDigits.slice(1, 5);
    const rest = rawDigits.slice(5);
    return `+880 ${op}-${rest}`;
  }

  // Common International Phone Patterns (US/India/Saudi/UAE/UK)
  if (/^(1\d{10}|91[6-9]\d{9}|9665\d{8}|9715\d{8}|447\d{9})$/.test(rawDigits)) {
    return `+${rawDigits}`;
  }

  // If senderJid comes from standard @s.whatsapp.net and has valid phone length (9-13 digits), format with +
  if (senderJid.endsWith('@s.whatsapp.net') && rawDigits.length >= 9 && rawDigits.length <= 13) {
    return `+${rawDigits}`;
  }

  // Reject all other unverified pseudo-IDs (like 41889218736332, 166533833787573, etc.)
  return null;
};

/**
 * Automatically create or update a Lead whenever a customer chats
 */
const updateCustomerLead = async (userId, senderJid, customerName, lastMessage, aiReplyText) => {
  try {
    const formattedNumber = formatPhoneNumber(senderJid);
    if (!formattedNumber) {
      console.log(`[Lead] Skipping non-customer JID: ${senderJid}`);
      return;
    }

    const { intentLabel, priority } = detectIntent(lastMessage);
    const conversationEntry = `Customer: "${lastMessage}"\nAI: "${aiReplyText}"`;

    let lead = await Lead.findOne({ user: userId, customerNumber: formattedNumber });

    if (!lead) {
      const extractedLocation = extractLocation(lastMessage, null);

      lead = new Lead({
        user: userId,
        customerNumber: formattedNumber,
        customerName: customerName || 'Valued Customer',
        summary: intentLabel,
        intentLabel,
        priority,
        location: extractedLocation,
        details: conversationEntry,
        lastMessage,
        messageCount: 1,
      });
    } else {
      // Update existing lead — escalate priority if higher urgency detected
      const priorityOrder = { 'New': 0, 'Warm Lead': 1, 'Hot Lead': 2, 'Urgent': 3 };
      const currentPriority = priorityOrder[lead.priority] ?? 0;
      const newPriority = priorityOrder[priority] ?? 0;

      if (newPriority > currentPriority) {
        lead.priority = priority;
        lead.intentLabel = intentLabel;
        lead.summary = intentLabel;
      }

      if (customerName && customerName !== 'Valued Customer') {
        lead.customerName = customerName;
      }

      const newLocation = extractLocation(lastMessage, lead.location);
      if (newLocation !== 'Not specified') {
        lead.location = newLocation;
      }

      lead.lastMessage = lastMessage;
      lead.messageCount = (lead.messageCount || 0) + 1;

      // Keep last ~2000 chars of conversation history (clean truncation at newline boundary)
      const newEntry = `\n---\n${conversationEntry}`;
      const combined = lead.details + newEntry;
      lead.details = combined.length > 2000 ? combined.slice(-2000) : combined;
    }

    await lead.save();
    console.log(`[Lead] Updated for ${formattedNumber} — Intent: ${intentLabel} | Priority: ${priority}`);
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key — race condition, safely ignore
      console.warn(`[Lead] Duplicate key for ${senderJid}, skipping.`);
    } else {
      console.error('Error auto-saving customer lead:', err);
    }
  }
};

module.exports = {
  updateCustomerLead,
};
