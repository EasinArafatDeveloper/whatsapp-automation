const Lead = require('../models/Lead');

/**
 * Automatically create or update a Lead whenever a customer chats
 */
const updateCustomerLead = async (userId, senderJid, customerName, lastMessage, aiReplyText) => {
  try {
    const rawNumber = senderJid.split('@')[0].split(':')[0];
    const formattedNumber = rawNumber.startsWith('880') ? `+${rawNumber}` : rawNumber;

    let lead = await Lead.findOne({ user: userId, customerNumber: formattedNumber });

    // Clean summary extraction from user message & AI response
    let summaryText = lastMessage;
    if (lastMessage.toLowerCase().includes('flat') || lastMessage.toLowerCase().includes('sell')) {
      summaryText = 'Property / Flat Sale Inquiry';
    } else if (lastMessage.toLowerCase().includes('price') || lastMessage.toLowerCase().includes('cost')) {
      summaryText = 'Pricing & Package Inquiry';
    } else if (lastMessage.toLowerCase().includes('service')) {
      summaryText = 'Services & Consultation';
    }

    // Extract location if mentioned
    let extractedLocation = 'Not specified';
    const locMatches = lastMessage.match(/(Dhanmondi|Gulshan|Banani|Uttara|Mirpur|Dhaka|Chittagong|Sylhet)/i);
    if (locMatches) {
      extractedLocation = locMatches[0];
    } else if (lead && lead.location !== 'Not specified') {
      extractedLocation = lead.location;
    }

    if (!lead) {
      lead = new Lead({
        user: userId,
        customerNumber: formattedNumber,
        customerName: customerName || 'Valued Customer',
        summary: summaryText,
        location: extractedLocation,
        details: `Customer: "${lastMessage}"\nAI Response: "${aiReplyText}"`,
        lastMessage: lastMessage,
      });
    } else {
      if (customerName && customerName !== 'Valued Customer') {
        lead.customerName = customerName;
      }
      if (summaryText && summaryText !== 'Customer Inquiry') {
        lead.summary = summaryText;
      }
      if (extractedLocation !== 'Not specified') {
        lead.location = extractedLocation;
      }
      lead.lastMessage = lastMessage;
      lead.details = `${lead.details}\n---\nCustomer: "${lastMessage}"\nAI: "${aiReplyText}"`.slice(-1500); // keep recent history
    }

    await lead.save();
    console.log(`[Lead Auto-Saved] Customer Lead updated for ${formattedNumber}`);
  } catch (err) {
    console.error('Error auto-saving customer lead:', err);
  }
};

module.exports = {
  updateCustomerLead,
};
