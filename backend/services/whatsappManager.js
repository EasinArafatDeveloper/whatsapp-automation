const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Business = require('../models/Business');
const { generateResponse } = require('./aiService');
const { updateCustomerLead } = require('./leadService');

// Map to hold active sessions: userId -> { sock, status, qr, number }
const activeSessions = new Map();

const SESSIONS_DIR = path.join(__dirname, '../sessions');
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

/**
 * Initialize or retrieve WhatsApp Baileys Session for a User
 */
const connectSession = async (userId, phoneNumber = null) => {
  const userSessionPath = path.join(SESSIONS_DIR, `session_${userId}`);

  // If already connected or connecting, return current status
  const existing = activeSessions.get(userId.toString());
  if (existing && (existing.status === 'connected' || existing.status === 'qr_ready' || existing.status === 'pairing_ready')) {
    return { status: existing.status, qr: existing.qr, pairingCode: existing.pairingCode, number: existing.number };
  }

  activeSessions.set(userId.toString(), {
    status: 'connecting',
    qr: null,
    pairingCode: null,
    number: null,
    sock: null,
  });

  try {
    const { state, saveCreds } = await useMultiFileAuthState(userSessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: ['WhatsApp AI SaaS', 'Chrome', '1.0.0'],
    });

    activeSessions.get(userId.toString()).sock = sock;

    // Handle pairing code request for mobile single-phone users
    if (phoneNumber && !sock.authState.creds.registered) {
      setTimeout(async () => {
        try {
          const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
          const code = await sock.requestPairingCode(cleanPhone);
          console.log(`Pairing Code generated for User ${userId}: ${code}`);
          const session = activeSessions.get(userId.toString());
          if (session) {
            session.pairingCode = code;
            session.status = 'pairing_ready';
          }
        } catch (err) {
          console.error(`Pairing Code Error for User ${userId}:`, err);
        }
      }, 3000);
    }

    // Handle Auth Credential Updates
    sock.ev.on('creds.update', saveCreds);

    // Handle Connection Updates (QR code, open, close)
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      const session = activeSessions.get(userId.toString());

      if (qr) {
        try {
          const qrBase64 = await QRCode.toDataURL(qr);
          if (session) {
            session.qr = qrBase64;
            session.status = 'qr_ready';
          }
        } catch (err) {
          console.error(`QR Code generation error for user ${userId}:`, err);
        }
      }

      if (connection === 'connecting') {
        if (session && session.status !== 'qr_ready') {
          session.status = 'connecting';
        }
      }

      if (connection === 'open') {
        console.log(`WhatsApp connection opened for User ID: ${userId}`);
        const userJid = sock.user?.id || '';
        const whatsappNum = userJid.split(':')[0] || userJid.split('@')[0];

        if (session) {
          session.status = 'connected';
          session.qr = null;
          session.number = whatsappNum;
        }

        // Update database status
        await User.findByIdAndUpdate(userId, {
          whatsappConnected: true,
          whatsappNumber: whatsappNum,
        });
      }

      if (connection === 'close') {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log(
          `Connection closed for User ${userId}. Reason: ${
            lastDisconnect?.error?.message || 'Unknown'
          }. Reconnecting: ${shouldReconnect}`
        );

        if (session) {
          session.status = 'disconnected';
          session.qr = null;
        }

        await User.findByIdAndUpdate(userId, {
          whatsappConnected: false,
        });

        if (shouldReconnect) {
          setTimeout(() => connectSession(userId), 3000);
        } else {
          // Logged out clean up
          logoutSession(userId);
        }
      }
    });

    // Handle Incoming Messages
    sock.ev.on('messages.upsert', async (m) => {
      try {
        if (m.type !== 'notify') return;

        for (const msg of m.messages) {
          // Ignore self messages or status broadcasts
          if (!msg.message || msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') {
            continue;
          }

          // Ignore group chats in MVP
          const isGroup = msg.key.remoteJid.endsWith('@g.us');
          if (isGroup) continue;

          // Extract plain text message
          const textMessage =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.ephemeralMessage?.message?.conversation ||
            msg.message.ephemeralMessage?.message?.extendedTextMessage?.text ||
            '';

          if (!textMessage.trim()) continue;

          const senderJid = msg.key.remoteJid;
          console.log(`[User ${userId}] Incoming WhatsApp Msg from ${senderJid}: "${textMessage}"`);

          // Fetch business settings for user
          const business = await Business.findOne({ user: userId });

          const pushName = msg.pushName || '';

          // Generate AI or Fallback response
          const replyText = await generateResponse(userId, senderJid, textMessage, business, pushName);

          if (replyText) {
            await sock.sendMessage(senderJid, { text: replyText });
            console.log(`[User ${userId}] Auto-Replied to ${senderJid}: "${replyText}"`);

            // Auto-Save / Update Customer Lead in DB
            updateCustomerLead(userId, senderJid, pushName, textMessage, replyText);
          }
        }
      } catch (err) {
        console.error(`Error processing WhatsApp message for User ${userId}:`, err);
      }
    });

    return { status: 'connecting', qr: null, number: null };
  } catch (error) {
    console.error(`WhatsApp connection setup error for User ${userId}:`, error);
    activeSessions.set(userId.toString(), {
      status: 'disconnected',
      qr: null,
      number: null,
      sock: null,
    });
    return { status: 'disconnected', qr: null, number: null };
  }
};

/**
 * Restore existing sessions on server startup
 */
const restoreSessionsOnStartup = async () => {
  try {
    if (!fs.existsSync(SESSIONS_DIR)) return;
    const files = fs.readdirSync(SESSIONS_DIR);
    for (const file of files) {
      if (file.startsWith('session_')) {
        const userId = file.replace('session_', '');
        console.log(`Auto-restoring WhatsApp session for User ID: ${userId}`);
        connectSession(userId);
      }
    }
  } catch (err) {
    console.error('Error auto-restoring sessions on startup:', err);
  }
};

/**
 * Get Connection Status for User
 */
const getSessionStatus = (userId) => {
  const session = activeSessions.get(userId.toString());
  if (!session) {
    return { status: 'disconnected', qr: null, pairingCode: null, number: null };
  }
  return {
    status: session.status,
    qr: session.qr,
    pairingCode: session.pairingCode,
    number: session.number,
  };
};

/**
 * Logout and Clean Up Session
 */
const logoutSession = async (userId) => {
  const session = activeSessions.get(userId.toString());
  if (session && session.sock) {
    try {
      await session.sock.logout();
    } catch (err) {
      // Ignore logout errors
    }
  }

  activeSessions.delete(userId.toString());

  // Remove stored session directory
  const userSessionPath = path.join(SESSIONS_DIR, `session_${userId}`);
  if (fs.existsSync(userSessionPath)) {
    fs.rmSync(userSessionPath, { recursive: true, force: true });
  }

  await User.findByIdAndUpdate(userId, {
    whatsappConnected: false,
    whatsappNumber: null,
  });

  return { status: 'disconnected', qr: null, number: null };
};

module.exports = {
  connectSession,
  getSessionStatus,
  logoutSession,
  restoreSessionsOnStartup,
};

