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

// Map to hold active sessions: userId -> { sock, status, qr, pairingCode, pairingCodeError, number, businessCache, businessCacheTime }
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
      pairingCodeError: existing.pairingCodeError || null,
      number: existing.number,
    };
  }

  // 2. If pairing code already generated and socket is still alive — DON'T create a new session.
  // The frontend polls every 3s which could otherwise keep triggering new sessions and
  // invalidating the active code (causing "couldn't link device" in WhatsApp).
  if (existing && existing.status === 'pairing_ready' && existing.pairingCode && existing.sock) {
    return {
      status: existing.status,
      qr: existing.qr,
      pairingCode: existing.pairingCode,
      pairingCodeError: existing.pairingCodeError || null,
      number: existing.number,
    };
  }

  // 3. If socket is still initializing (connecting) or QR code is already ready with active socket, wait/return existing.
  if (existing && (existing.status === 'connecting' || existing.status === 'qr_ready') && !phoneNumber && existing.sock) {
    return {
      status: existing.status,
      qr: existing.qr,
      pairingCode: existing.pairingCode,
      pairingCodeError: existing.pairingCodeError || null,
      number: existing.number,
    };
  }

  // 4. Reset session folder ONLY when a NEW phone number is explicitly requested for pairing,
  // or when an explicit clean disconnect is requested.
  // NEVER delete userSessionPath if existing saved credentials exist!
  if (existing && existing.sock) {
    try {
      existing.sock.ev.removeAllListeners('connection.update');
      existing.sock.ev.removeAllListeners('creds.update');
      existing.sock.end();
    } catch (e) {}
    existing.sock = null;
  }

  if (phoneNumber) {
    activeSessions.delete(strUserId);
    reconnectAttempts.delete(strUserId);

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
    pairingCodeError: null,
    phoneNumber: null,   // stored so we can reconnect during pairing
    number: null,
    sock: null,
    businessCache: null,
    businessCacheTime: null,
  };
  if (sessionData.status !== 'pairing_ready' && sessionData.status !== 'qr_ready' && sessionData.status !== 'connected') {
    sessionData.status = 'connecting';
    sessionData.pairingCodeError = null;
  }
  // Store phone number for potential reconnect during pairing
  if (phoneNumber) sessionData.phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
  activeSessions.set(strUserId, sessionData);

  // Ensure sessions folder exists
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
  if (!fs.existsSync(userSessionPath)) {
    fs.mkdirSync(userSessionPath, { recursive: true });
  }

  try {
    const { state, saveCreds } = await useMultiFileAuthState(userSessionPath);

    // If auth state already has registered credentials, mark as connected immediately
    if (state.creds?.me?.id || state.creds?.registered) {
      const userJid = state.creds?.me?.id || '';
      const whatsappNum = userJid.split(':')[0] || userJid.split('@')[0];
      sessionData.status = 'connected';
      sessionData.number = whatsappNum;
      sessionData.qr = null;
      sessionData.pairingCode = null;
    }

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: Browsers.macOS('Desktop'),
      markOnlineOnConnect: false,
      keepAliveIntervalMs: 10000, // send keepalive every 10s so WS stays alive during pairing
    });

    sessionData.sock = sock;

    // Immediately attach credentials saver safely
    sock.ev.on('creds.update', async () => {
      try {
        if (!fs.existsSync(userSessionPath)) {
          fs.mkdirSync(userSessionPath, { recursive: true });
        }
        await saveCreds();
      } catch (err) {
        console.error(`Error saving WhatsApp credentials for User ${userId}:`, err.message);
      }
    });

    // Attach connection listener
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      const session = activeSessions.get(strUserId);

      // Do not update QR if session is already connected
      if (qr && session?.status !== 'connected') {
        // If phoneNumber is set, request pairing code ON the QR event.
        if (sessionData.phoneNumber && !sock.authState.creds.registered && !sessionData.pairingCode) {
          const cleanPhone = sessionData.phoneNumber.replace(/[^0-9]/g, '');
          console.log(`[PairingCode] QR event fired — switching to pairing code mode for: +${cleanPhone}`);
          try {
            const code = await sock.requestPairingCode(cleanPhone);
            const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
            console.log(`[PairingCode] Code generated for User ${userId}: ${formattedCode}`);
            const sess = activeSessions.get(strUserId);
            if (sess) {
              sess.pairingCode = formattedCode;
              sess.pairingCodeError = null;
              sess.status = 'pairing_ready';
            }
          } catch (err) {
            console.error(`[PairingCode] Error for User ${userId}:`, err.message);
            const sess = activeSessions.get(strUserId);
            if (sess) {
              sess.pairingCodeError = err.message || 'Failed to generate pairing code. Please try again.';
              sess.status = 'disconnected';
            }
          }
          return; // Don't set QR — we're in pairing mode
        }

        // No phone number — show QR code as normal
        try {
          const qrBase64 = await QRCode.toDataURL(qr);
          if (session && session.status !== 'connected') {
            session.qr = qrBase64;
            session.status = 'qr_ready';
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
        const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
        console.log(
          `Connection closed for User ${userId}. Reason: ${
            lastDisconnect?.error?.message || 'Unknown'
          } (code: ${statusCode}). LoggedOut: ${isLoggedOut}`
        );

        if (isLoggedOut) {
          await User.findByIdAndUpdate(userId, { whatsappConnected: false });
          try {
            if (fs.existsSync(userSessionPath)) {
              fs.rmSync(userSessionPath, { recursive: true, force: true });
            }
          } catch (e) {}
          logoutSession(userId);
        } else {
          // Clear dead socket reference so guards work correctly
          const closedSession = activeSessions.get(strUserId);
          if (closedSession) closedSession.sock = null;

          // 515 = "Stream Errored (restart required)" is WhatsApp's normal signal
          // that the pairing handshake completed — client should reconnect with
          // new credentials. We let normal reconnect run so the OPEN event fires
          // and marks the session as connected.

          // Normal exponential backoff reconnect (max 5 attempts)
          const attempts = (reconnectAttempts.get(strUserId) || 0) + 1;
          if (attempts <= 5) {
            reconnectAttempts.set(strUserId, attempts);
            const delayMs = 3000 * attempts;
            console.log(`[Reconnect] User ${userId} — attempt ${attempts}/5, retrying in ${delayMs / 1000}s...`);
            setTimeout(() => {
              connectSession(userId);
            }, delayMs);
          } else {
            console.log(`[Reconnect] Max attempts (5) reached for User ${userId}. Stopping.`);
            reconnectAttempts.delete(strUserId);
            if (closedSession) closedSession.status = 'disconnected';
            await User.findByIdAndUpdate(userId, { whatsappConnected: false });
          }
        }
      }
    });

    // NOTE: Pairing code is now requested inside the 'qr' event handler above.
    // This ensures WhatsApp has completed its handshake and is in QR mode
    // before we switch it to pairing code mode — preventing the 408 timeout.

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
      pairingCodeError: curSession?.pairingCodeError || null,
      number: curSession?.number || null,
    };
  } catch (error) {
    console.error(`WhatsApp connection setup error for User ${userId}:`, error);
    activeSessions.set(strUserId, {
      status: 'disconnected',
      qr: null,
      pairingCode: null,
      pairingCodeError: error.message || 'Connection failed',
      number: null,
      sock: null,
      businessCache: null,
      businessCacheTime: null,
    });
    return { status: 'disconnected', qr: null, pairingCode: null, pairingCodeError: error.message, number: null };
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
        const sessionPath = path.join(SESSIONS_DIR, file);
        const credsPath = path.join(sessionPath, 'creds.json');

        // Only restore sessions with valid registered credentials.
        // Sessions from failed/incomplete pairing attempts won't have creds.json
        // or will have registered:false — skip & clean them up to avoid
        // zombie QR sockets that interfere with new pairing code requests.
        if (!fs.existsSync(credsPath)) {
          console.log(`[Startup] Skipping session for User ${userId} — no creds.json found. Cleaning up.`);
          try { fs.rmSync(sessionPath, { recursive: true, force: true }); } catch (e) {}
          continue;
        }

        try {
          const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
          if (!creds.me?.id) {
            console.log(`[Startup] Skipping session for User ${userId} — creds not registered. Cleaning up.`);
            try { fs.rmSync(sessionPath, { recursive: true, force: true }); } catch (e) {}
            continue;
          }
        } catch (e) {
          console.log(`[Startup] Skipping session for User ${userId} — creds.json unreadable. Cleaning up.`);
          try { fs.rmSync(sessionPath, { recursive: true, force: true }); } catch (e2) {}
          continue;
        }

        console.log(`[Startup] Auto-restoring WhatsApp session for User ID: ${userId}`);
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
  const strUserId = userId.toString();
  let session = activeSessions.get(strUserId);

  if (!session) {
    const userSessionPath = path.join(SESSIONS_DIR, `session_${userId}`);
    const credsPath = path.join(userSessionPath, 'creds.json');
    if (fs.existsSync(credsPath)) {
      try {
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        if (creds.me?.id || creds.registered) {
          const whatsappNum = (creds.me?.id || '').split(':')[0].split('@')[0];
          // Auto-resume session in background
          connectSession(userId);
          return { status: 'connected', qr: null, pairingCode: null, pairingCodeError: null, number: whatsappNum };
        }
      } catch (e) {}
    }
    return { status: 'disconnected', qr: null, pairingCode: null, pairingCodeError: null, number: null };
  }

  return {
    status: session.status,
    qr: session.status === 'connected' ? null : session.qr,
    pairingCode: session.status === 'connected' ? null : session.pairingCode,
    pairingCodeError: session.pairingCodeError || null,
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
