'use client';

import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@michaforge.co.ke');
  const [password, setPassword] = useState('Admin@Michaforge2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('michaforge_admin_token', data.data.accessToken);
        localStorage.setItem('michaforge_admin_user', JSON.stringify(data.data.user));
        window.location.href = '/admin';
      } else {
        setError(data.error?.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setError('Connection error. Verify the Auth microservice is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#073253] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-gray-100">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#073253] text-[#FF850D] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md font-black text-xl">
            MF
          </div>
          <h2 className="text-2xl font-black text-[#073253]">
            MICHAFORGE ENTERPRISES
          </h2>
          <p className="text-xs text-[#FF850D] font-bold uppercase tracking-wider mt-1">
            Staff &amp; Management Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172B3A] mb-1">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@michaforge.co.ke"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DFE5EB] text-sm text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B3A] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DFE5EB] text-sm text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
              />
            </div>
          </div>

          {/* Seed hint box */}
          <div className="p-3 bg-[#F5F7FA] rounded-xl text-[11px] text-[#667585] space-y-1 border border-gray-100">
            <div className="flex items-center space-x-1 font-bold text-[#073253]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0BAA58]" />
              <span>Initial Admin Credentials</span>
            </div>
            <p>Email: <code className="text-[#172B3A] font-semibold">admin@michaforge.co.ke</code></p>
            <p>Password: <code className="text-[#172B3A] font-semibold">Admin@Michaforge2026!</code></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center space-x-2 bg-[#FF850D] hover:bg-[#E67300] text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all text-sm disabled:opacity-70"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <a href="/" className="text-xs text-gray-500 hover:text-[#073253]">
            ← Return to Michaforge Public Website
          </a>
        </div>
      </div>
    </div>
  );
}
