const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const authMiddleware = require('../middleware/auth');

// GET /api/leads - Fetch all customer leads for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Delete old garbage lead entries created from internal WhatsApp IDs (groups @g.us, LIDs @lid, etc.)
    await Lead.deleteMany({
      user: req.user.id,
      $or: [
        { customerNumber: { $regex: /120363/ } },
        { customerNumber: { $regex: /128363/ } },
        { customerNumber: { $regex: /@/ } },
      ],
    });

    const leads = await Lead.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json({ leads });
  } catch (error) {
    console.error('Fetch leads error:', error);
    res.status(500).json({ message: 'Error fetching customer leads', error: error.message });
  }
});

// PUT /api/leads/:id - Update lead status
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, summary, location, details } = req.body;
    const lead = await Lead.findOne({ _id: req.params.id, user: req.user.id });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (status !== undefined) lead.status = status;
    if (summary !== undefined) lead.summary = summary;
    if (location !== undefined) lead.location = location;
    if (details !== undefined) lead.details = details;

    await lead.save();
    res.json({ message: 'Lead updated successfully', lead });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Error updating lead', error: error.message });
  }
});

// DELETE /api/leads/:id - Delete lead
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ message: 'Error deleting lead', error: error.message });
  }
});

module.exports = router;
