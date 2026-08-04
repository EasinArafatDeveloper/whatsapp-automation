require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/business');
const whatsappRoutes = require('./routes/whatsapp');
const leadRoutes = require('./routes/lead');
const { restoreSessionsOnStartup } = require('./services/whatsappManager');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Connect Database & Restore Active WhatsApp Sessions
connectDB().then(() => {
  restoreSessionsOnStartup();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/leads', leadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
