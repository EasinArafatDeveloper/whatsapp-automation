const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Business = require('../models/Business');
const Lead = require('../models/Lead');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Apply auth and admin middleware to all routes
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/stats - Overview Analytics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeWhatsappSessions = await User.countDocuments({ whatsappConnected: true });
    const totalLeads = await Lead.countDocuments();
    const totalBusinesses = await Business.countDocuments();

    res.json({
      stats: {
        totalUsers,
        activeWhatsappSessions,
        totalLeads,
        totalBusinesses,
      },
    });
  } catch (error) {
    console.error('Fetch admin stats error:', error);
    res.status(500).json({ message: 'Error fetching admin stats', error: error.message });
  }
});

// GET /api/admin/users - List all registered SaaS users with tenant details
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Fetch business profiles & lead counts for each user
    const usersWithDetails = await Promise.all(
      users.map(async (u) => {
        const business = await Business.findOne({ user: u._id });
        const leadCount = await Lead.countDocuments({ user: u._id });

        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role || 'user',
          isActive: u.isActive ?? true,
          whatsappConnected: u.whatsappConnected,
          whatsappNumber: u.whatsappNumber,
          createdAt: u.createdAt,
          businessName: business?.businessName || `${u.name}'s Business`,
          accountType: business?.accountType || 'business',
          toneMode: business?.toneMode || 'auto',
          leadCount,
        };
      })
    );

    res.json({ users: usersWithDetails });
  } catch (error) {
    console.error('Fetch admin users error:', error);
    res.status(500).json({ message: 'Error fetching users list', error: error.message });
  }
});

// PUT /api/admin/users/:id - Edit user profile, role, or active status
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.toLowerCase();
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// DELETE /api/admin/users/:id - Delete tenant user and data
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent self deletion
    if (userId.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account!' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user, business profile, and leads
    await User.findByIdAndDelete(userId);
    await Business.deleteMany({ user: userId });
    await Lead.deleteMany({ user: userId });

    res.json({ message: 'User and all associated tenant data deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

module.exports = router;
