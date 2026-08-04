'use client';

import QRDisplay from '@/components/QRDisplay';

export default function ConnectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Connect WhatsApp Business</h1>
        <p className="text-xs text-slate-400 mt-1">
          Link your business WhatsApp account using official Baileys multi-session authentication without paid Meta API approval.
        </p>
      </div>

      <QRDisplay />
    </div>
  );
}
