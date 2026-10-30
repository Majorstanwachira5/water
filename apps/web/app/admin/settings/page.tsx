'use client';

import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, Phone, MessageSquare, Bell, CheckCircle2, Globe } from 'lucide-react';
import { BrandSettings } from '@michaforge/shared-contracts';

export default function AdminSettingsPage() {
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [testNotificationResult, setTestNotificationResult] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/settings/public')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setBrand(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand) return;

    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/v1/admin/branding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setStatusMessage('Settings saved successfully! Public website updated.');
      } else {
        setStatusMessage('Failed to save settings.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setTestNotificationResult(null);
    try {
      const res = await fetch('/api/v1/admin/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'sms', recipient: brand?.primaryPhone || '0714843208' }),
      });
      const json = await res.json();
      if (json.success) {
        setTestNotificationResult(`Dispatched test event to ${json.data.recipient} [Status: ${json.data.status}] via ${json.data.provider}`);
      }
    } catch (e) {
      setTestNotificationResult('Failed to dispatch test notification.');
    }
  };

  if (loading || !brand) {
    return <div className="p-12 text-center text-xs text-gray-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-[#073253]">Company &amp; System Settings</h1>
        <p className="text-xs text-[#667585] mt-1">
          Configure business phone numbers, WhatsApp, homepage headlines, and localization tokens.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Identity */}
        <div className="bg-white rounded-2xl border border-[#DFE5EB] p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#073253] border-b pb-2">
            Business Identity &amp; Contact Numbers
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={brand.businessName}
                onChange={(e) => setBrand({ ...brand, businessName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={brand.tagline}
                onChange={(e) => setBrand({ ...brand, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Display Phone Number</label>
              <input
                type="text"
                value={brand.primaryPhone}
                onChange={(e) => setBrand({ ...brand, primaryPhone: e.target.value })}
                placeholder="0714843208"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">WhatsApp Number (E.164)</label>
              <input
                type="text"
                value={brand.whatsappNumber}
                onChange={(e) => setBrand({ ...brand, whatsappNumber: e.target.value })}
                placeholder="+254714843208"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Currency</label>
              <input
                type="text"
                value={brand.currency}
                disabled
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Homepage Content Configuration */}
        <div className="bg-white rounded-2xl border border-[#DFE5EB] p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#073253] border-b pb-2">
            Homepage Content &amp; Headlines
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Top Announcement Bar Text</label>
              <input
                type="text"
                value={brand.announcementText}
                onChange={(e) => setBrand({ ...brand, announcementText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Hero Subheadline</label>
              <input
                type="text"
                value={brand.heroSubheadline}
                onChange={(e) => setBrand({ ...brand, heroSubheadline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Hero Headline</label>
              <input
                type="text"
                value={brand.heroHeadline}
                onChange={(e) => setBrand({ ...brand, heroHeadline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Hero Description</label>
              <textarea
                rows={2}
                value={brand.heroDescription}
                onChange={(e) => setBrand({ ...brand, heroDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 bg-[#FF850D] hover:bg-[#E67300] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* Notification Adapter Sandbox Test Box */}
      <div className="bg-white rounded-2xl border border-[#DFE5EB] p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-extrabold text-[#073253] flex items-center space-x-2">
          <Bell className="w-4 h-4 text-[#FF850D]" />
          <span>Notification Adapter Health Test</span>
        </h3>
        <p className="text-xs text-gray-500">
          Verify outbound notification queues. If external SMS/WhatsApp credentials are not yet configured in .env, the adapter runs in safe simulation mode.
        </p>
        <button
          onClick={handleTestNotification}
          className="inline-flex items-center space-x-2 bg-[#073253] hover:bg-[#0B3556] text-white px-4 py-2 rounded-xl text-xs font-bold"
        >
          <span>Send Test Alert to {brand.primaryPhone}</span>
        </button>
        {testNotificationResult && (
          <p className="text-xs text-[#0BAA58] bg-green-50 p-3 rounded-xl border border-green-200 font-mono">
            {testNotificationResult}
          </p>
        )}
      </div>
    </div>
  );
}
