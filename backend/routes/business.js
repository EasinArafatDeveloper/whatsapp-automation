const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const authMiddleware = require('../middleware/auth');

// GET /api/business - Fetch user's business profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    let business = await Business.findOne({ user: req.user.id });
    if (!business) {
      business = await Business.create({ user: req.user.id });
    }
    res.json({ business });
  } catch (error) {
    console.error('Fetch business error:', error);
    res.status(500).json({ message: 'Error fetching business profile', error: error.message });
  }
});

// Helper function to update business profile fields
const updateBusinessFields = (business, data) => {
  const { businessName, description, products, faq, policies, tone, accountType, toneMode, customInstructions, aiEnabled } = data;
  if (businessName !== undefined) business.businessName = businessName;
  if (description !== undefined) business.description = description;
  if (products !== undefined) business.products = products;
  if (faq !== undefined) business.faq = faq;
  if (policies !== undefined) business.policies = policies;
  if (tone !== undefined) business.tone = tone;
  if (accountType !== undefined) business.accountType = accountType;
  if (toneMode !== undefined) business.toneMode = toneMode;
  if (customInstructions !== undefined) business.customInstructions = customInstructions;
  if (aiEnabled !== undefined) business.aiEnabled = aiEnabled;
};

// PUT /api/business - Update business profile atomically
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { agentName, businessName, description, products, faq, policies, tone, accountType, toneMode, customInstructions, aiEnabled } = req.body;
    
    const updateData = {};
    if (agentName !== undefined) updateData.agentName = agentName;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (description !== undefined) updateData.description = description;
    if (products !== undefined) updateData.products = products;
    if (faq !== undefined) updateData.faq = faq;
    if (policies !== undefined) updateData.policies = policies;
    if (tone !== undefined) updateData.tone = tone;
    if (accountType !== undefined) updateData.accountType = accountType;
    if (toneMode !== undefined) updateData.toneMode = toneMode;
    if (customInstructions !== undefined) updateData.customInstructions = customInstructions;
    if (aiEnabled !== undefined) updateData.aiEnabled = aiEnabled;

    const business = await Business.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'Business profile updated successfully', business });
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({ message: 'Error updating business profile', error: error.message });
  }
});

// POST /api/business/profile - Alternative update route
router.post('/profile', authMiddleware, async (req, res) => {
  try {
    const { agentName, businessName, description, products, faq, policies, tone, accountType, toneMode, customInstructions, aiEnabled } = req.body;
    
    const updateData = {};
    if (agentName !== undefined) updateData.agentName = agentName;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (description !== undefined) updateData.description = description;
    if (products !== undefined) updateData.products = products;
    if (faq !== undefined) updateData.faq = faq;
    if (policies !== undefined) updateData.policies = policies;
    if (tone !== undefined) updateData.tone = tone;
    if (accountType !== undefined) updateData.accountType = accountType;
    if (toneMode !== undefined) updateData.toneMode = toneMode;
    if (customInstructions !== undefined) updateData.customInstructions = customInstructions;
    if (aiEnabled !== undefined) updateData.aiEnabled = aiEnabled;

    const business = await Business.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'Business profile updated successfully', business });
  } catch (error) {
    console.error('Update business profile error:', error);
    res.status(500).json({ message: 'Error updating business profile', error: error.message });
  }
});

// POST /api/business/templates - Add or update template
router.post('/templates', authMiddleware, async (req, res) => {
  try {
    const { keyword, reply } = req.body;

    if (!keyword || !reply) {
      return res.status(400).json({ message: 'Keyword and reply are required' });
    }

    let business = await Business.findOne({ user: req.user.id });
    if (!business) {
      business = await Business.create({ user: req.user.id });
    }

    const cleanKeyword = keyword.trim().toLowerCase();
    const existingIndex = business.templates.findIndex(
      (t) => t.keyword.toLowerCase() === cleanKeyword
    );

    if (existingIndex > -1) {
      business.templates[existingIndex].reply = reply;
    } else {
      business.templates.push({ keyword: cleanKeyword, reply });
    }

    await business.save();
    res.json({ message: 'Template saved successfully', templates: business.templates });
  } catch (error) {
    console.error('Save template error:', error);
    res.status(500).json({ message: 'Error saving template', error: error.message });
  }
});

// DELETE /api/business/templates/:keyword - Delete template
router.delete('/templates/:keyword', authMiddleware, async (req, res) => {
  try {
    const targetKeyword = req.params.keyword.trim().toLowerCase();

    let business = await Business.findOne({ user: req.user.id });
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    business.templates = business.templates.filter(
      (t) => t.keyword.toLowerCase() !== targetKeyword
    );

    await business.save();
    res.json({ message: 'Template deleted successfully', templates: business.templates });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ message: 'Error deleting template', error: error.message });
  }
});

module.exports = router;
