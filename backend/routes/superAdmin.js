/**
 * Super Admin Routes — /api/super-admin/*
 * Dedicated for SaaS Founder only. Uses separate env-based credentials.
 * Does NOT use regular user JWT — uses its own signed token.
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');
const Lead = require('../models/Lead');

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@sohojreply.com';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@2026!';
const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_SECRET || process.env.JWT_SECRET + '_superadmin';

/**
 * Super Admin Auth Middleware — validates super admin token
 */
const superAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('SuperAdmin ')) {
    return res.status(401).json({ message: 'Super Admin authorization required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SUPER_ADMIN_SECRET);
    if (decoded.role !== 'superadmin') {
      return res.status(403).json({ message: 'Forbidden: Not a super admin token' });
    }
    req.superAdmin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired super admin token' });
  }
};

// POST /api/super-admin/login — Super Admin Login (env-based credentials)
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (
    email.toLowerCase().trim() !== SUPER_ADMIN_EMAIL.toLowerCase() ||
    password !== SUPER_ADMIN_PASSWORD
  ) {
    // Intentional delay to prevent brute force
    return setTimeout(() => {
      res.status(401).json({ message: 'Invalid super admin credentials' });
    }, 1500);
  }

  const token = jwt.sign(
    { role: 'superadmin', email: SUPER_ADMIN_EMAIL },
    SUPER_ADMIN_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    message: 'Super Admin login successful',
    token,
    admin: { email: SUPER_ADMIN_EMAIL, role: 'superadmin' },
  });
});

// GET /api/super-admin/stats — Platform-wide analytics
router.get('/stats', superAdminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      disabledUsers,
      adminUsers,
      connectedWA,
      totalLeads,
      hotLeads,
      totalBusinesses,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ whatsappConnected: true }),
      Lead.countDocuments(),
      Lead.countDocuments({ priority: 'Hot Lead' }),
      Business.countDocuments(),
    ]);

    // Recent signups (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSignups = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        disabledUsers,
        adminUsers,
        connectedWA,
        totalLeads,
        hotLeads,
        totalBusinesses,
        recentSignups,
      },
    });
  } catch (error) {
    console.error('Super Admin stats error:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// GET /api/super-admin/users — All users with full tenant details (Aggregation)
router.get('/users', superAdminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const matchQuery = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const [users, total] = await Promise.all([
      User.aggregate([
        { $match: matchQuery },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { password: 0 } },
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
            let: { uid: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$user', '$$uid'] } } },
              { $count: 'count' },
            ],
            as: 'leadsArr',
          },
        },
        {
          $addFields: {
            businessData: { $arrayElemAt: ['$business', 0] },
            leadCount: { $ifNull: [{ $arrayElemAt: ['$leadsArr.count', 0] }, 0] },
          },
        },
        {
          $project: {
            business: 0,
            leadsArr: 0,
            'businessData.customInstructions': 0,
          },
        },
      ]),
      User.countDocuments(matchQuery),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Super Admin users error:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// PUT /api/super-admin/users/:id — Edit any user (name, email, role, isActive)
router.put('/users/:id', superAdminAuth, async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Super Admin update user error:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// DELETE /api/super-admin/users/:id — Delete user + all their data
router.delete('/users/:id', superAdminAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Promise.all([
      User.findByIdAndDelete(userId),
      Business.deleteMany({ user: userId }),
      Lead.deleteMany({ user: userId }),
    ]);

    res.json({ message: `User "${user.email}" and all their data deleted successfully` });
  } catch (error) {
    console.error('Super Admin delete user error:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// GET /api/super-admin/verify — Verify super admin token is valid
router.get('/verify', superAdminAuth, (req, res) => {
  res.json({ valid: true, admin: { email: SUPER_ADMIN_EMAIL, role: 'superadmin' } });
});

module.exports = router;
