'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin, changeAdminPassword } = useStore();

  const [email, setEmail] = useState('admin@hcdtfstore.com');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password Change Modal State on First Login
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const res = loginAdmin(email, password);

    if (res.success) {
      if (res.mustChangePassword) {
        setShowPasswordChangeModal(true);
      } else {
        router.push('/admin/dashboard');
      }
    } else {
      setErrorMsg(res.error || 'Invalid Admin Email or Password');
    }
  };

  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    setPassError('');

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    changeAdminPassword(newPassword);
    setShowPasswordChangeModal(false);
    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-white">
        
        {/* Portal Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock size={26} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">HC DTF STORE Portal</h1>
          <p className="text-xs text-slate-400">Strictly Restricted Internal Control System</p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-2xl font-bold flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Admin Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-xl transition"
          >
            Authenticate & Access Dashboard
          </button>
        </form>

        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-500 text-center font-mono">
          Default Password: <span className="text-emerald-400 font-bold">hima143</span>
        </div>

      </div>

      {/* Mandatory Password Change Modal on First Login */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md" />

          <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/50 rounded-3xl p-8 shadow-2xl z-10 text-white space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
                <KeyRound size={24} />
              </div>
              <h2 className="text-xl font-black text-white">First Login Security Mandate</h2>
              <p className="text-xs text-slate-400">
                You logged in with default credentials. You MUST set a new secure password before continuing.
              </p>
            </div>

            {passError && (
              <div className="p-3 bg-rose-950 border border-rose-800 text-rose-300 text-xs rounded-2xl font-bold">
                {passError}
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">New Secure Password *</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-lg transition"
              >
                Save New Password & Enter Admin Portal
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
