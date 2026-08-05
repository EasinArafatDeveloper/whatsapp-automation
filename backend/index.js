require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/business');
const whatsappRoutes = require('./routes/whatsapp');
const leadRoutes = require('./routes/lead');
const adminRoutes = require('./routes/admin');
const superAdminRoutes = require('./routes/superAdmin');
const { restoreSessionsOnStartup } = require('./services/whatsappManager');

const app = express();

// CORS — allow live frontend + localhost
const allowedOrigins = [
  'https://whatsapp-automation.scaleupweb.xyz',
  'http://localhost:3000',
  'http://localhost:3001',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now — can be restricted later
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

// ── Rate Limiting ─────────────────────────────────────────────────────────
// General API: 200 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

// Auth endpoints: 15 attempts per 15 minutes (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please wait 15 minutes.' },
});

// Super Admin login: very strict — 5 attempts per 15 minutes
const superAdminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many super admin login attempts. Please wait 15 minutes.' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/super-admin/login', superAdminLimiter);

// ── Connect Database & Restore Active WhatsApp Sessions ──────────────────
connectDB().then(() => {
  restoreSessionsOnStartup();
});

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);

// ── Health & Root ─────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'active', message: 'WhatsApp Business AI SaaS Backend API is Live!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
