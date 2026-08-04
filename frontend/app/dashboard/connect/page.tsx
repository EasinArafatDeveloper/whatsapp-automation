'use client';

import QRDisplay from '@/components/QRDisplay';

export default function ConnectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Connect WhatsApp Business</h1>
        <p className="text-xs text-slate-600 font-medium mt-1">
          Link your business WhatsApp account using official Baileys multi-session authentication without paid Meta API approval.
        </p>
      </div>

      <QRDisplay />
    </div>
  );
}
