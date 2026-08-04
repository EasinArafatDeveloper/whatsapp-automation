'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { QrCode, CheckCircle2, RefreshCw, Smartphone, Unplug, AlertCircle } from 'lucide-react';

interface WhatsAppStatusResponse {
  status: 'disconnected' | 'connecting' | 'qr_ready' | 'connected';
  qr?: string | null;
  number?: string | null;
}

export default function QRDisplay() {
  const [statusData, setStatusData] = useState<WhatsAppStatusResponse>({
    status: 'disconnected',
    qr: null,
    number: null,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const checkStatus = useCallback(async () => {
    try {
      const data = await fetchApi<WhatsAppStatusResponse>('/api/whatsapp/status');
      setStatusData(data);
    } catch (err: any) {
      console.error('Status check error:', err);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    // Poll status every 3 seconds
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleConnect = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchApi<WhatsAppStatusResponse>('/api/whatsapp/connect', {
        method: 'POST',
      });
      setStatusData(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start WhatsApp session');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchApi<WhatsAppStatusResponse>('/api/whatsapp/logout', {
        method: 'POST',
      });
      setStatusData(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to disconnect session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">WhatsApp Connection</h2>
            <p className="text-xs text-slate-400">Scan QR Code with WhatsApp Linked Devices</p>
          </div>
        </div>

        {/* Connection Badge */}
        <div className="flex items-center gap-2">
          {statusData.status === 'connected' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Connected
            </span>
          )}
          {statusData.status === 'qr_ready' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Scan Required
            </span>
          )}
          {statusData.status === 'connecting' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Initializing...
            </span>
          )}
          {statusData.status === 'disconnected' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
              Disconnected
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Render states */}
      {statusData.status === 'connected' && (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">WhatsApp Active</h3>
            <p className="text-sm text-slate-300 font-mono mt-1">
              {statusData.number ? `+${statusData.number}` : 'Connected Account'}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Your AI auto-reply engine is actively monitoring and answering customer messages.
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-semibold transition-all"
          >
            <Unplug className="w-4 h-4" />
            {loading ? 'Disconnecting...' : 'Disconnect WhatsApp'}
          </button>
        </div>
      )}

      {statusData.status === 'qr_ready' && statusData.qr && (
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-emerald-500/30">
            <img src={statusData.qr} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
          </div>

          <div className="w-full bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-2 text-left text-xs text-slate-300">
            <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" /> How to connect:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Open WhatsApp on your mobile phone</li>
              <li>Go to <strong>Settings</strong> &gt; <strong>Linked Devices</strong></li>
              <li>Tap <strong>Link a Device</strong> and scan this QR Code</li>
            </ol>
          </div>
        </div>
      )}

      {statusData.status === 'connecting' && (
        <div className="text-center py-12 space-y-3">
          <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-300">Starting Baileys WhatsApp Session...</p>
          <p className="text-xs text-slate-500">QR code will appear in a few seconds</p>
        </div>
      )}

      {statusData.status === 'disconnected' && (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center border border-slate-700">
            <QrCode className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No Active Session</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Click the button below to generate a new session and display a QR code for linking your business phone.
            </p>
          </div>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating QR...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                Start WhatsApp Connection
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
