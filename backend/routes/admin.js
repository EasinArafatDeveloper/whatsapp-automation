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
    const [totalUsers, activeWhatsappSessions, totalLeads, totalBusinesses] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ whatsappConnected: true }),
      Lead.countDocuments(),
      Business.countDocuments(),
    ]);

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
// Uses MongoDB aggregation to avoid N+1 queries (scalable for 1000+ users)
router.get('/users', async (req, res) => {
  try {
    const usersWithDetails = await User.aggregate([
      { $sort: { createdAt: -1 } },
      { $project: { password: 0 } }, // Never expose passwords
      {
        $lookup: {
          from: 'businesses',
          localField: '_id',
          foreignField: 'user',
          as: 'business',
        },
      },
      {
        $lookup: {
          from: 'leads',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user', '$$userId'] } } },
            { $count: 'total' },
          ],
          as: 'leadCountArr',
        },
      },
      {
        $addFields: {
          businessData: { $arrayElemAt: ['$business', 0] },
          leadCount: { $ifNull: [{ $arrayElemAt: ['$leadCountArr.total', 0] }, 0] },
        },
      },
      {
        $project: {
          business: 0,
          leadCountArr: 0,
          businessData: 0,
          'businessData.customInstructions': 0,
          // Keep these
          id: '$_id',
          name: 1,
          email: 1,
          role: 1,
          isActive: 1,
          whatsappConnected: 1,
          whatsappNumber: 1,
          createdAt: 1,
          leadCount: 1,
          businessName: { $ifNull: ['$businessData.businessName', ''] },
          accountType: { $ifNull: ['$businessData.accountType', 'business'] },
          toneMode: { $ifNull: ['$businessData.toneMode', 'auto'] },
        },
      },
    ]);

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

// DELETE /api/admin/users/:id - Delete tenant user and all data
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

    // Delete user + all associated tenant data atomically
    await Promise.all([
      User.findByIdAndDelete(userId),
      Business.deleteMany({ user: userId }),
      Lead.deleteMany({ user: userId }),
    ]);

    res.json({ message: 'User and all associated tenant data deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

module.exports = router;
