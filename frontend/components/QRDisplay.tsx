'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { QrCode, CheckCircle2, RefreshCw, Smartphone, Unplug, AlertCircle, Copy, KeyRound } from 'lucide-react';

interface WhatsAppStatusResponse {
  status: 'disconnected' | 'connecting' | 'qr_ready' | 'pairing_ready' | 'connected';
  qr?: string | null;
  pairingCode?: string | null;
  number?: string | null;
}

export default function QRDisplay() {
  const [statusData, setStatusData] = useState<WhatsAppStatusResponse>({
    status: 'disconnected',
    qr: null,
    pairingCode: null,
    number: null,
  });
  const [activeTab, setActiveTab] = useState<'qr' | 'pairing'>('pairing');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
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
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleConnect = async (usePhone: boolean = false) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const payload = usePhone && phoneInput ? { phoneNumber: phoneInput } : {};
      const res = await fetchApi<WhatsAppStatusResponse>('/api/whatsapp/connect', {
        method: 'POST',
        body: JSON.stringify(payload),
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

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">WhatsApp Connection</h2>
            <p className="text-xs text-slate-500 font-medium">Link your business WhatsApp account</p>
          </div>
        </div>

        {/* Connection Status Badge */}
        <div className="flex items-center gap-2">
          {statusData.status === 'connected' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Connected
            </span>
          )}
          {(statusData.status === 'qr_ready' || statusData.status === 'pairing_ready') && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Ready to Link
            </span>
          )}
          {statusData.status === 'connecting' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
              Initializing...
            </span>
          )}
          {statusData.status === 'disconnected' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
              Disconnected
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Connected State */}
      {statusData.status === 'connected' ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">WhatsApp Active</h3>
            <p className="text-sm text-slate-700 font-mono font-bold mt-1">
              {statusData.number ? `+${statusData.number}` : 'Connected Account'}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-2">
              Your AI auto-reply engine is actively monitoring and answering customer messages.
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-sm font-bold transition-all shadow-sm"
          >
            <Unplug className="w-4 h-4" />
            {loading ? 'Disconnecting...' : 'Disconnect WhatsApp'}
          </button>
        </div>
      ) : (
        <>
          {/* Method Switcher Tabs */}
          <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('pairing')}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pairing'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              1-Mobile Phone Code (No PC Needed)
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'qr'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-4 h-4" />
              Scan QR Code
            </button>
          </div>

          {/* TAB 1: Pairing Code Method (100% Mobile Phone Single Device Ready) */}
          {activeTab === 'pairing' && (
            <div className="space-y-5 pt-2">
              {statusData.pairingCode ? (
                <div className="space-y-4 text-center">
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-3xl space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      Your 8-Digit Pairing Code
                    </p>
                    <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 tracking-wider">
                      {statusData.pairingCode}
                    </div>

                    <button
                      onClick={() => handleCopyCode(statusData.pairingCode || '')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 transition-all active:scale-95"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Copied Code!' : 'Copy Code'}
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2 text-slate-700 font-medium">
                    <p className="font-bold text-blue-600 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" /> How to link using this phone:
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                      <li>Open <strong>WhatsApp</strong> on this mobile phone</li>
                      <li>Go to <strong>Settings</strong> &gt; <strong>Linked Devices</strong></li>
                      <li>Tap <strong>Link a Device</strong> &gt; Select <strong>&quot;Link with phone number instead&quot;</strong></li>
                      <li>Enter or paste this 8-digit code!</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Enter Your WhatsApp Phone Number
                    </label>
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="e.g. 8801700000000 (with country code)"
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all placeholder:text-slate-400 font-medium font-mono"
                    />
                    <p className="text-[11px] text-slate-500 font-medium">
                      Enter full number starting with country code (e.g. 88017...).
                    </p>
                  </div>

                  <button
                    onClick={() => handleConnect(true)}
                    disabled={loading || !phoneInput.trim()}
                    className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating Code...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Generate 8-Digit Mobile Code
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: QR Code Scan Method */}
          {activeTab === 'qr' && (
            <div className="space-y-4 pt-2">
              {statusData.status === 'qr_ready' && statusData.qr ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-2">
                  <div className="p-4 bg-white rounded-2xl shadow-md border-4 border-blue-500/20">
                    <img src={statusData.qr} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
                  </div>

                  <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-left text-xs text-slate-700">
                    <p className="font-bold text-blue-600 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" /> How to connect:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 font-medium">
                      <li>Open WhatsApp on another phone</li>
                      <li>Go to <strong>Settings</strong> &gt; <strong>Linked Devices</strong></li>
                      <li>Scan this QR Code!</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <button
                    onClick={() => handleConnect(false)}
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating QR Code...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4" />
                        Display QR Code
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
