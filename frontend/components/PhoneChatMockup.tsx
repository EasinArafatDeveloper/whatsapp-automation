'use client';

import { useState, useEffect } from 'react';
import { Bot, CheckCheck, Send, Sparkles, ShieldCheck, Zap, Wifi, Signal, Battery, CheckCircle2 } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'customer' | 'ai';
  text: string;
  time: string;
}

const CONVERSATION_STEPS: ChatMessage[] = [
  {
    id: 1,
    sender: 'customer',
    text: 'আসসালামু আলাইকুম! আপনাদের সার্ভিস চার্জ কত এবং কীভাবে শুরু করব?',
    time: '10:42 AM',
  },
  {
    id: 2,
    sender: 'ai',
    text: 'ওয়ালাইকুম আসসালাম! 🌸 আমাদের AI WhatsApp অটোমেশন প্লাটফর্ম একদম ফ্রি-তে ব্যবহার করা যায়। কোনো মেটা এপিআই ফি লাগবে না! QR কোড স্ক্যান করেই কানেক্ট করতে পারবেন।',
    time: '10:42 AM',
  },
  {
    id: 3,
    sender: 'customer',
    text: 'অটো রিপ্লাই কি কাস্টমার মেসেজ পাওয়া মাত্রই চলে যাবে?',
    time: '10:43 AM',
  },
  {
    id: 4,
    sender: 'ai',
    text: 'জি অবশ্যই! ⚡ মাত্র ০.৮ সেকেন্ডে DeepSeek AI আপনার দেওয়া প্রডাক্ট ইনফো ও FAQ অনুযায়ী মানুষের মতো নিখুঁত উত্তর প্রদান করবে।',
    time: '10:43 AM',
  },
];

export default function PhoneChatMockup() {
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  useEffect(() => {
    let timeoutIds: NodeJS.Timeout[] = [];

    const runAnimationCycle = () => {
      setVisibleMessages([]);
      setIsTyping(false);

      // Step 1: Customer Msg 1
      timeoutIds.push(
        setTimeout(() => {
          setVisibleMessages([CONVERSATION_STEPS[0]]);
          setIsTyping(true);
        }, 800)
      );

      // Step 2: AI Msg 1
      timeoutIds.push(
        setTimeout(() => {
          setIsTyping(false);
          setVisibleMessages([CONVERSATION_STEPS[0], CONVERSATION_STEPS[1]]);
        }, 2400)
      );

      // Step 3: Customer Msg 2
      timeoutIds.push(
        setTimeout(() => {
          setVisibleMessages([CONVERSATION_STEPS[0], CONVERSATION_STEPS[1], CONVERSATION_STEPS[2]]);
          setIsTyping(true);
        }, 4200)
      );

      // Step 4: AI Msg 2
      timeoutIds.push(
        setTimeout(() => {
          setIsTyping(false);
          setVisibleMessages(CONVERSATION_STEPS);
        }, 6000)
      );

      // Loop after 11s
      timeoutIds.push(
        setTimeout(() => {
          runAnimationCycle();
        }, 11000)
      );
    };

    runAnimationCycle();

    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, []);

  return (
    <div className="relative mx-auto [perspective:1400px] select-none font-sans py-4">
      
      {/* 3D Tilted iPhone Wrapper with Interactive Smooth Hover */}
      <div className="relative w-[290px] sm:w-[350px] max-w-[calc(100vw-2.5rem)] h-[560px] sm:h-[630px] transition-all duration-700 ease-out [transform-style:preserve-3d] [transform:rotateY(-14deg)_rotateX(6deg)_rotateZ(2deg)] hover:[transform:rotateY(-4deg)_rotateX(2deg)_rotateZ(0deg)]">
        
        {/* 3D Soft Ambient Backlight Glow */}
        <div className="absolute -inset-6 bg-gradient-to-tr from-blue-600/35 via-indigo-500/30 to-cyan-400/35 rounded-[64px] blur-3xl opacity-85 animate-pulse pointer-events-none" />

        {/* 3D Realistic Ground Drop Shadow */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] h-12 bg-slate-950/50 rounded-full blur-2xl pointer-events-none" />

        {/* iPhone Titanium Metallic Frame */}
        <div className="relative w-full h-full bg-slate-950 rounded-[52px] p-3 shadow-[30px_35px_80px_-15px_rgba(15,23,42,0.6),0_0_50px_rgba(37,99,235,0.2)] border-[7px] border-slate-800 ring-1 ring-white/20 flex flex-col overflow-hidden">
          
          {/* Metallic Side Hardware Buttons */}
          <div className="absolute top-24 -left-2.5 w-1 h-10 bg-slate-800 rounded-l-md" /> {/* Vol Up */}
          <div className="absolute top-38 -left-2.5 w-1 h-10 bg-slate-800 rounded-l-md" /> {/* Vol Down */}
          <div className="absolute top-28 -right-2.5 w-1 h-14 bg-slate-800 rounded-r-md" /> {/* Power */}

          {/* iPhone Glass Screen Frame */}
          <div className="relative w-full h-full bg-[#EFEAE2] rounded-[42px] overflow-hidden flex flex-col border border-slate-900/10">
            
            {/* Glass Glare Highlight Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-[42px] pointer-events-none z-40" />

            {/* iOS Top Bar with Dynamic Island */}
            <div className="bg-[#075E54] pt-2.5 px-5 pb-1 flex items-center justify-between text-white text-[11px] font-bold z-30">
              <span>9:41</span>
              
              {/* Dynamic Island Notch */}
              <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-blue-900/80" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
              </div>

              <div className="flex items-center gap-1.5">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* WhatsApp Business Header */}
            <div className="bg-[#075E54] pb-3 px-3.5 text-white flex items-center justify-between shadow-md z-20">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-xs border border-white/40 shadow-inner">
                    AI
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#075E54]" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-extrabold text-white flex items-center gap-1">
                    Sohoj Reply Support <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300 fill-cyan-300/20" />
                  </h4>
                  <p className="text-[10px] text-emerald-100 font-semibold">online • 24/7 Bot Active</p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-95 text-[10px] bg-emerald-800/80 px-2.5 py-1 rounded-full border border-emerald-400/30">
                <ShieldCheck className="w-3 h-3 text-emerald-200" />
                <span className="font-bold text-white">Verified</span>
              </div>
            </div>

            {/* WhatsApp Chat Canvas Background */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 relative bg-[radial-gradient(#0000000c_1px,transparent_1px)] [background-size:12px_12px]">
              {visibleMessages.map((msg) =>
                msg.sender === 'customer' ? (
                  /* Customer Bubble (Left White) */
                  <div key={msg.id} className="flex justify-start animate-fade-in">
                    <div className="bg-white text-slate-900 text-[11px] p-2.5 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm border border-slate-200/70 space-y-1">
                      <p className="font-medium text-slate-800 leading-relaxed">{msg.text}</p>
                      <span className="text-[9px] text-slate-400 block text-right font-medium">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* AI Bubble (Right Green) */
                  <div key={msg.id} className="flex justify-end animate-fade-in">
                    <div className="bg-[#E7FCE3] text-slate-900 text-[11px] p-2.5 rounded-2xl rounded-tr-none max-w-[86%] shadow-sm border border-emerald-200/90 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800">
                        <Bot className="w-3 h-3 text-emerald-600" />
                        <span>Sohoj Reply (Auto-Reply)</span>
                      </div>
                      <p className="font-medium leading-relaxed text-slate-900">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-700 font-semibold">
                        <span>{msg.time}</span>
                        <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Live Typing Indicator */}
              {isTyping && (
                <div className="flex justify-end animate-pulse">
                  <div className="bg-[#E7FCE3] px-3 py-2 rounded-2xl rounded-tr-none shadow-sm border border-emerald-200/90 flex items-center gap-1.5 text-[10px] text-emerald-800 font-bold">
                    <Bot className="w-3 h-3 text-emerald-600" />
                    <span>Sohoj Reply is typing</span>
                    <div className="flex items-center gap-0.5 ml-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mock WhatsApp Chat Input Bar */}
            <div className="bg-slate-100 p-2 border-t border-slate-200/80 flex items-center gap-2">
              <div className="flex-1 bg-white rounded-full px-3.5 py-1.5 text-[10px] text-slate-400 border border-slate-200 flex items-center justify-between">
                <span>Type a customer message...</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#075E54] text-white flex items-center justify-center shadow-sm">
                <Send className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* iOS Home Indicator */}
            <div className="bg-slate-100 pb-1 flex justify-center">
              <div className="w-28 h-1 bg-slate-400 rounded-full" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
