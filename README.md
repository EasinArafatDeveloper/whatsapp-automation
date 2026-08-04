# WhatsApp Business AI Auto-Reply Platform (Multi-tenant SaaS)

A full-stack multi-tenant SaaS application allowing business owners to connect their WhatsApp Business account via QR code scan (powered by `@whiskeysockets/baileys`), enter product & FAQ context, and automate AI customer support replies using **DeepSeek API** with fallback keyword templates.

---

## 🚀 Features

- 📱 **Free WhatsApp Integration**: Connects via Baileys multi-session socket — no paid Meta API verification required.
- 🤖 **DeepSeek AI Support Engine**: Uses business context (products, FAQs, policies, communication tone) to deliver human-like, accurate customer replies.
- ⚡ **Fallback Keyword Templates**: Define custom keyword rules to handle inquiries if AI is disabled or unavailable.
- 🔐 **Multi-tenant SaaS Isolation**: Secure authentication with JWT & bcrypt password hashing; each user has separate session credentials and business profile.
- 🎨 **Modern Sleek UI**: Next.js App Router, Tailwind CSS, Lucide icons, glassmorphism aesthetics, responsive dark mode layout.

---

## 📁 Repository Structure

```
S Whatsapp Automation/
├── backend/                           # Persistent Express + Baileys Socket Service
│   ├── config/db.js                   # MongoDB Atlas Connection
│   ├── models/                        # User & Business Mongoose Schemas
│   ├── middleware/auth.js             # JWT Bearer Token Middleware
│   ├── routes/                        # Auth, Business, WhatsApp API Routes
│   ├── services/
│   │   ├── whatsappManager.js         # Baileys Multi-Session Socket Manager
│   │   └── aiService.js               # DeepSeek AI + Keyword Fallback Logic
│   ├── sessions/                      # Local Auth Sessions directory
│   ├── index.js                       # Express Server Entry Point
│   └── package.json
│
├── frontend/                          # Next.js App Router Client App
│   ├── app/
│   │   ├── (auth)/                    # Login & Signup Pages
│   │   ├── dashboard/                 # Overview, QR Connect, Business Info, Fallback Templates
│   │   ├── globals.css                # Custom Glassmorphism & Color Variables
│   │   └── page.tsx                   # Modern SaaS Landing Page
│   ├── components/                    # Sidebar, Navbar, QRDisplay, BusinessForm, TemplateManager
│   ├── lib/                           # API fetch wrapper & Auth helpers
│   └── package.json
└── README.md
```

---

## 🛠️ Environment Setup

### 1. Backend Configuration (`backend/.env`)
Create `backend/.env` with your MongoDB connection string and API key:

```env
MONGO_URI=mongodb+srv://wp-ai-automation:a0OafTvUWQAHns9s@cluster0.qqfwr0y.mongodb.net/whatsapp-ai-saas?retryWrites=true&w=majority
JWT_SECRET=super_secret_whatsapp_ai_saas_jwt_key_2026_x89q
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
PORT=5000
```

### 2. Frontend Configuration (`frontend/.env.local`)
Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🚦 How to Run Locally

### Start Backend Service (Port 5000)
```bash
cd backend
npm install
npm run dev
```

### Start Frontend Application (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🌐 Production Deployment

- **Frontend**: Deploy `frontend/` to **Vercel**. Set `NEXT_PUBLIC_API_URL` to your backend production URL.
- **Backend**: Deploy `backend/` to **Railway.app** or **Render.com** (as a persistent Node Web Service to preserve persistent WebSocket & Baileys connections). Set `.env` variables accordingly.
- **Database**: MongoDB Atlas Free Cluster.
