const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Business = require('../models/Business');
const { generateResponse } = require('./aiService');
const { updateCustomerLead } = require('./leadService');

// Map to hold active sessions: userId -> { sock, status, qr, pairingCode, number, businessCache, businessCacheTime }
const activeSessions = new Map();

// Reconnect attempt counters: userId -> attempt count
const reconnectAttempts = new Map();

const SESSIONS_DIR = path.join(__dirname, '../sessions');
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

const BUSINESS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get business profile with in-memory cache (avoids DB hit per message)
 */
const getBusinessCached = async (userId, session) => {
  const now = Date.now();
  if (session.businessCache && session.businessCacheTime && (now - session.businessCacheTime < BUSINESS_CACHE_TTL)) {
    return session.businessCache;
  }
  const business = await Business.findOne({ user: userId }).lean();
  session.businessCache = business;
  session.businessCacheTime = now;
  return business;
};

/**
 * Initialize or retrieve WhatsApp Baileys Session for a User
 */
const connectSession = async (userId, phoneNumber = null) => {
  const strUserId = userId.toString();
  const userSessionPath = path.join(SESSIONS_DIR, `session_${userId}`);

  const existing = activeSessions.get(strUserId);

  // 1. If already connected, return connected session status
  if (existing && existing.status === 'connected') {
    return {
      status: existing.status,
      qr: existing.qr,
      pairingCode: existing.pairingCode,
      number: existing.number,
    };
  }

  // 2. If already pairing ready and no new phone number provided, return existing session info
  if (existing && existing.pairingCode && !phoneNumber && existing.status === 'pairing_ready') {
    return {
      status: existing.status,
      qr: existing.qr,
      pairingCode: existing.pairingCode,
      number: existing.number,
    };
  }

  // 3. Reset session folder if a new request is initiated with phone number OR clean restart requested
  if (phoneNumber || (existing && existing.status === 'disconnected')) {
    if (existing && existing.sock) {
      try {
        existing.sock.ev.removeAllListeners('connection.update');
        existing.sock.ev.removeAllListeners('creds.update');
        existing.sock.end();
      } catch (e) {}
    }
    activeSessions.delete(strUserId);
    reconnectAttempts.delete(strUserId); // Reset reconnect counter on fresh connect

    if (fs.existsSync(userSessionPath)) {
      try {
        fs.rmSync(userSessionPath, { recursive: true, force: true });
      } catch (e) {}
    }
  }

  // Set initial session state in map
  const sessionData = activeSessions.get(strUserId) || {
    status: 'connecting',
    qr: null,
    pairingCode: null,
    number: null,
    sock: null,
    businessCache: null,
    businessCacheTime: null,
  };
  if (sessionData.status !== 'pairing_ready' && sessionData.status !== 'qr_ready') {
    sessionData.status = 'connecting';
  }
  activeSessions.set(strUserId, sessionData);

  try {
    const { state, saveCreds } = await useMultiFileAuthState(userSessionPath);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: ['Ubuntu', 'Chrome', '20.0.04'],
      markOnlineOnConnect: false,
    });

    sessionData.sock = sock;

    // Immediately attach credentials saver
    sock.ev.on('creds.update', saveCreds);

    // Attach connection listener
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      const session = activeSessions.get(strUserId);

      if (qr) {
        try {
          const qrBase64 = await QRCode.toDataURL(qr);
          if (session) {
            session.qr = qrBase64;
            if (session.status !== 'pairing_ready') {
              session.status = 'qr_ready';
            }
          }
        } catch (err) {
          console.error(`QR Code conversion error for User ${userId}:`, err);
        }
      }

      if (connection === 'open') {
        console.log(`WhatsApp socket connection OPEN for User ID: ${userId}`);
        const userJid = sock.user?.id || '';
        const whatsappNum = userJid.split(':')[0] || userJid.split('@')[0];

        if (session) {
          session.status = 'connected';
          session.qr = null;
          session.pairingCode = null;
          session.number = whatsappNum;
          // Reset reconnect counter on successful connection
          reconnectAttempts.delete(strUserId);
        }

        await User.findByIdAndUpdate(userId, {
          whatsappConnected: true,
          whatsappNumber: whatsappNum,
        });
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;
        console.log(
          `Connection closed for User ${userId}. Reason: ${
            lastDisconnect?.error?.message || 'Unknown'
          } (code: ${statusCode}). LoggedOut: ${isLoggedOut}`
        );

        if (isLoggedOut) {
          await User.findByIdAndUpdate(userId, { whatsappConnected: false });
          logoutSession(userId);
        } else {
          // Exponential backoff reconnect (max 5 attempts)
          const attempts = (reconnectAttempts.get(strUserId) || 0) + 1;

          if (attempts <= 5) {
            reconnectAttempts.set(strUserId, attempts);
            const delayMs = 3000 * attempts; // 3s, 6s, 9s, 12s, 15s
            console.log(`[Reconnect] User ${userId} — attempt ${attempts}/5, retrying in ${delayMs / 1000}s...`);
            setTimeout(() => {
              connectSession(userId);
            }, delayMs);
          } else {
            console.log(`[Reconnect] Max attempts (5) reached for User ${userId}. Stopping auto-reconnect.`);
            reconnectAttempts.delete(strUserId);
            if (session) {
              session.status = 'disconnected';
            }
            await User.findByIdAndUpdate(userId, { whatsappConnected: false });
          }
        }
      }
    });

    // Request pairing code IMMEDIATELY after 1 second delay
    if (phoneNumber && !sock.authState.creds.registered) {
      setTimeout(async () => {
        try {
          const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
          console.log(`Requesting pairing code for number: ${cleanPhone}`);
          const code = await sock.requestPairingCode(cleanPhone);
          console.log(`Pairing code generated for User ${userId}: ${code}`);
          const session = activeSessions.get(strUserId);
          if (session) {
            session.pairingCode = code;
            session.status = 'pairing_ready';
          }
        } catch (err) {
          console.error(`Pairing code request error for User ${userId}:`, err);
        }
      }, 1000);
    }

    // Handle Incoming Messages
    sock.ev.on('messages.upsert', async (m) => {
      try {
        if (m.type !== 'notify') return;

        for (const msg of m.messages) {
          if (!msg.message || msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') {
            continue;
          }

          const isGroup = msg.key.remoteJid.endsWith('@g.us');
          if (isGroup) continue;

          const textMessage =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.ephemeralMessage?.message?.conversation ||
            msg.message.ephemeralMessage?.message?.extendedTextMessage?.text ||
            '';

          if (!textMessage.trim()) continue;

          const senderJid = msg.key.remoteJid;
          console.log(`[User ${userId}] Incoming WA msg from ${senderJid}: "${textMessage}"`);

          // Use cached business profile (no DB hit per message)
          const currentSession = activeSessions.get(strUserId);
          const business = await getBusinessCached(userId, currentSession || {});

          const pushName = msg.pushName || '';

          const replyText = await generateResponse(userId, senderJid, textMessage, business, pushName);

          if (replyText) {
            await sock.sendMessage(senderJid, { text: replyText });
            console.log(`[User ${userId}] Auto-replied to ${senderJid}: "${replyText}"`);

            updateCustomerLead(userId, senderJid, pushName, textMessage, replyText);
          }
        }
      } catch (err) {
        console.error(`Error processing WhatsApp message for User ${userId}:`, err);
      }
    });

    const curSession = activeSessions.get(strUserId);
    return {
      status: curSession?.status || 'connecting',
      qr: curSession?.qr || null,
      pairingCode: curSession?.pairingCode || null,
      number: curSession?.number || null,
    };
  } catch (error) {
    console.error(`WhatsApp connection setup error for User ${userId}:`, error);
    activeSessions.set(strUserId, {
      status: 'disconnected',
      qr: null,
      pairingCode: null,
      number: null,
      sock: null,
      businessCache: null,
      businessCacheTime: null,
    });
    return { status: 'disconnected', qr: null, pairingCode: null, number: null };
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
  const strUserId = userId.toString();
  const session = activeSessions.get(strUserId);
  if (session && session.sock) {
    try {
      session.sock.ev.removeAllListeners('connection.update');
      session.sock.ev.removeAllListeners('creds.update');
      await session.sock.logout();
    } catch (err) {
      // Ignore logout errors
    }
  }

  activeSessions.delete(strUserId);
  reconnectAttempts.delete(strUserId);

  const userSessionPath = path.join(SESSIONS_DIR, `session_${userId}`);
  if (fs.existsSync(userSessionPath)) {
    try {
      fs.rmSync(userSessionPath, { recursive: true, force: true });
    } catch (e) {}
  }

  await User.findByIdAndUpdate(userId, {
    whatsappConnected: false,
    whatsappNumber: null,
  });

  return { status: 'disconnected', qr: null, pairingCode: null, number: null };
};

module.exports = {
  connectSession,
  getSessionStatus,
  logoutSession,
  restoreSessionsOnStartup,
};
