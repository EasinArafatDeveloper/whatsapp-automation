'use client';

import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Sparkles,
  Zap,
  HelpCircle,
  Mail,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ChatMsg {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

const KNOWLEDGE_BASE_RESPONSES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ['কানেক্ট', 'connect', 'qr', 'code', 'কিভাবে', 'how'],
    reply: 'Sohoj Reply তে আপনার হোয়াটসঅ্যাপ কানেক্ট করা একদম সহজ! 🚀\n\n১. ড্যাশবোর্ডে গিয়ে "Connect WhatsApp" অপশনে যান।\n২. আপনি আপনার ফোনের WhatsApp > Linked Devices এ গিয়ে QR Code স্ক্যান করে অথবা ৮-ডিজিটের পেয়ারিং কোড টাইপ করে মুহূর্তেই ফ্রিতে কানেক্ট করতে পারবেন। কোনো paid Meta API লাগবে না!',
  },
  {
    keywords: ['দাম', 'প্রাইস', 'price', 'fee', 'charge', 'কোর্স', 'ফ্রি', 'free'],
    reply: 'আমাদের Sohoj Reply প্লাটফর্মে Baileys Socket এর মাধ্যমে হোয়াটসঅ্যাপ কানেক্ট করা এবং বোট ব্যবহার করা একদম ফ্রি! 🌸 কোনো মেটা এপিআই ভেরিফিকেশন ফি বা প্রতি মেসেজে চার্জ কাটবে না।',
  },
  {
    keywords: ['deepseek', 'ai', 'কাজের', 'কাজ', 'work', 'বোট'],
    reply: 'Sohoj Reply ব্যবহার করে শক্তিশালী DeepSeek V3 AI মডেল। 🤖 আপনি ড্যাশবোর্ডে আপনার প্রডাক্ট, প্রাইস, FAQ ও বিজনেস রুলস লিখে দিলে, কাস্টমারদের প্রশ্নের ঠিক সেই অনুযায়ী মানুষের মতো নিখুঁত বাংলায় উত্তর দেবে।',
  },
  {
    keywords: ['সাপোর্ট', 'support', 'help', 'ইমেইল', 'email', 'যোগাযোগ', 'contact'],
    reply: 'যেকোনো কারিগরি সহায়তা বা কাস্টম সেটআপের জন্য আমাদের সাপোর্ট টিমে ইমেইল করতে পারেন:\n\n📧 Email: contact.scaleupweb@gmail.com\nআমাদের সাপোর্ট টিম আপনাকে দ্রুত সাহায্য করবে।',
  },
];

const DEFAULT_WELCOME_MSG: ChatMsg = {
  id: 'welcome-1',
  sender: 'ai',
  text: 'আসসালামু আলাইকুম! 👋 Sohoj Reply AI সাপোর্টে আপনাকে স্বাগতম। আমাদের প্লাটফর্ম, হোয়াটসঅ্যাপ কানেকশন বা AI ফিচার সম্পর্কে যেকোনো প্রশ্ন করতে পারেন!',
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export default function LiveSupportWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMsg[]>([DEFAULT_WELCOME_MSG]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    const userMsg: ChatMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    // Generate Intelligent Response
    setTimeout(() => {
      let matchedReply = '';
      const lowerText = text.toLowerCase();

      for (const item of KNOWLEDGE_BASE_RESPONSES) {
        if (item.keywords.some((kw) => lowerText.includes(kw))) {
          matchedReply = item.reply;
          break;
        }
      }

      if (!matchedReply) {
        matchedReply = `ধন্যবাদ আপনার মেসেজের জন্য! 😊 Sohoj Reply সম্পূর্ণ ফ্রি-তে আপনার হোয়াটসঅ্যাপে DeepSeek AI অটো রিপ্লাই সেটআপ করে দেয়।\n\nআরও বিস্তারিত জানতে বা কাস্টম সেটআপের জন্য আমাদের মেইল করুন:\n📧 contact.scaleupweb@gmail.com`;
      }

      const aiMsg: ChatMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: matchedReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const quickQuestions = [
    'কীভাবে কানেক্ট করব?',
    'কোনো ফি লাগবে কি?',
    'DeepSeek AI কীভাবে কাজ করে?',
    'সাপোর্ট ইমেইল কী?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none font-sans">
      {/* Floating Widget Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:scale-105 transition-all duration-300 text-white p-4 rounded-full shadow-[0_12px_35px_rgba(37,99,235,0.35)] active:scale-95 flex items-center justify-center border border-white/30"
          title="Chat with AI Support"
        >
          <Bot className="w-7 h-7 text-white animate-bounce-slow" />
          
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5.5 h-5.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-md animate-pulse">
              {unreadCount}
            </span>
          )}

          {/* Floating Tooltip */}
          <span className="absolute right-full mr-3.5 whitespace-nowrap bg-slate-900 text-white text-xs px-3.5 py-2 rounded-2xl font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl pointer-events-none flex items-center gap-1.5 border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Have questions? Ask AI Support!
          </span>
        </button>
      )}

      {/* Live AI Chat Drawer Box */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-[390px] max-w-[390px] h-[530px] bg-white text-slate-900 rounded-[28px] border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          
          {/* Vibrant Gradient Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-indigo-700" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  Sohoj Reply Assistant <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                </h3>
                <p className="text-[10px] text-blue-100 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online • Powered by DeepSeek V3
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 hover:text-white transition-all active:scale-95"
              title="Close Support Window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Clean Light-Theme Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/80 text-xs">
            {messages.map((msg) =>
              msg.sender === 'user' ? (
                /* Customer Bubble (Right) */
                <div key={msg.id} className="flex justify-end animate-fade-in">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm space-y-1">
                    <p className="leading-relaxed font-medium text-xs">{msg.text}</p>
                    <span className="text-[9px] text-blue-100/80 block text-right font-medium">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ) : (
                /* AI Agent Bubble (Left) */
                <div key={msg.id} className="flex justify-start animate-fade-in">
                  <div className="bg-white text-slate-800 p-3.5 rounded-2xl rounded-tl-none max-w-[88%] border border-slate-200/90 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-blue-600 pb-1 border-b border-slate-100">
                      <span className="flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5 text-blue-600" /> Sohoj Reply Support
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">{msg.time}</span>
                    </div>
                    <p className="leading-relaxed font-medium text-xs text-slate-700 whitespace-pre-line">
                      {msg.text}
                    </p>
                  </div>
                </div>
              )
            )}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white px-3.5 py-2 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2 text-xs text-slate-600 font-semibold">
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                  <span>AI agent is thinking</span>
                  <div className="flex items-center gap-1 ml-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3.5 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="shrink-0 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200/80 text-[11px] font-bold transition-all shadow-2xs active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about Sohoj Reply..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-100/80 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputVal.trim()}
              className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center active:scale-95 shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
