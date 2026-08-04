const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  connectSession,
  getSessionStatus,
  logoutSession,
} = require('../services/whatsappManager');

// POST /api/whatsapp/connect - Start session
router.post('/connect', authMiddleware, async (req, res) => {
  try {
    const { phoneNumber } = req.body || {};
    const sessionData = await connectSession(req.user.id, phoneNumber);
    res.json({ message: 'WhatsApp session connection initiated', ...sessionData });
  } catch (error) {
    console.error('WhatsApp Connect Route Error:', error);
    res.status(500).json({ message: 'Failed to initiate WhatsApp connection', error: error.message });
  }
});

// GET /api/whatsapp/status - Check status & QR
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const statusData = getSessionStatus(req.user.id);
    res.json(statusData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to check status', error: error.message });
  }
});

// POST /api/whatsapp/logout - Logout & disconnect session
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const statusData = await logoutSession(req.user.id);
    res.json({ message: 'WhatsApp disconnected successfully', ...statusData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to logout session', error: error.message });
  }
});

module.exports = router;
