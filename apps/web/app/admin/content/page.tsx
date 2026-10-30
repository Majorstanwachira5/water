'use client';

import React, { useEffect, useState } from 'react';
import {
  Save,
  RotateCcw,
  Phone,
  MessageSquare,
  Globe,
  Image as ImageIcon,
  Type,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Palette,
} from 'lucide-react';
import { BrandSettings } from '@michaforge/shared-contracts';

// ─────────────────────────────────────────
// Section accordion helper
// ─────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-[#DFE5EB] shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#073253]/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#073253]" />
          </div>
          <span className="font-bold text-[#073253] text-sm">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-[#DFE5EB] space-y-4">{children}</div>}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-[#172B3A]">{label}</label>
      {hint && <p className="text-[11px] text-[#667585]">{hint}</p>}
      {children}
    </div>
  );
}

const INPUT_CLS =
  'w-full rounded-xl border border-[#DFE5EB] bg-[#F8FAFB] px-3.5 py-2.5 text-sm text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF850D]/30 focus:border-[#FF850D] transition';

const TEXTAREA_CLS =
  'w-full rounded-xl border border-[#DFE5EB] bg-[#F8FAFB] px-3.5 py-2.5 text-sm text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF850D]/30 focus:border-[#FF850D] transition resize-none';

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────
export default function AdminContentBrandingPage() {
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<'success' | 'error' | null>(null);

  // Form state mirroring brand
  const [form, setForm] = useState({
    businessName: '',
    tagline: '',
    primaryPhone: '',
    whatsappNumber: '',
    email: '',
    address: '',
    announcementText: '',
    heroHeadline: '',
    heroSubheadline: '',
    heroDescription: '',
    heroImageUrl: '',
    logoUrl: '',
    logoWhiteUrl: '',
    faviconUrl: '',
  });

  useEffect(() => {
    fetch('/api/v1/settings/public')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const b: BrandSettings = json.data;
          setBrand(b);
          setForm({
            businessName: b.businessName || '',
            tagline: b.tagline || '',
            primaryPhone: b.primaryPhone || '',
            whatsappNumber: b.whatsappNumber || '',
            email: b.email || '',
            address: b.address || '',
            announcementText: b.announcementText || '',
            heroHeadline: b.heroHeadline || '',
            heroSubheadline: b.heroSubheadline || '',
            heroDescription: b.heroDescription || '',
            heroImageUrl: b.heroImageUrl || '',
            logoUrl: b.logoUrl || '',
            logoWhiteUrl: b.logoWhiteUrl || '',
            faviconUrl: b.faviconUrl || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    if (!brand) return;
    setForm({
      businessName: brand.businessName || '',
      tagline: brand.tagline || '',
      primaryPhone: brand.primaryPhone || '',
      whatsappNumber: brand.whatsappNumber || '',
      email: brand.email || '',
      address: brand.address || '',
      announcementText: brand.announcementText || '',
      heroHeadline: brand.heroHeadline || '',
      heroSubheadline: brand.heroSubheadline || '',
      heroDescription: brand.heroDescription || '',
      heroImageUrl: brand.heroImageUrl || '',
      logoUrl: brand.logoUrl || '',
      logoWhiteUrl: brand.logoWhiteUrl || '',
      faviconUrl: brand.faviconUrl || '',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedMsg(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('michaforge_admin_token') : null;

      // Save brand/contact settings
      const brandRes = await fetch('/api/v1/admin/branding', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          businessName: form.businessName,
          tagline: form.tagline,
          primaryPhone: form.primaryPhone,
          whatsappNumber: form.whatsappNumber,
          email: form.email,
          address: form.address,
          announcementText: form.announcementText,
          logoUrl: form.logoUrl,
          logoWhiteUrl: form.logoWhiteUrl,
          faviconUrl: form.faviconUrl,
        }),
      });

      // Save homepage content separately
      const contentRes = await fetch('/api/v1/admin/content/homepage', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          heroHeadline: form.heroHeadline,
          heroSubheadline: form.heroSubheadline,
          heroDescription: form.heroDescription,
          heroImageUrl: form.heroImageUrl,
          announcementText: form.announcementText,
        }),
      });

      if (brandRes.ok && contentRes.ok) {
        const json = await brandRes.json();
        if (json.success) setBrand(json.data);
        setSavedMsg('success');
        setTimeout(() => setSavedMsg(null), 4000);
      } else {
        setSavedMsg('error');
      }
    } catch {
      setSavedMsg('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-[#FF850D] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#073253]">Content & Branding</h1>
          <p className="text-xs text-[#667585] mt-1">
            Manage the website's public-facing text, contact details, logo paths, and hero section.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="branding-reset-btn"
            type="button"
            onClick={handleReset}
            className="inline-flex items-center space-x-1.5 border border-[#DFE5EB] bg-white text-[#172B3A] hover:bg-gray-50 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            id="branding-save-btn"
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-1.5 bg-[#073253] hover:bg-[#0B3556] disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving…' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {savedMsg === 'success' && (
        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">Branding &amp; content updated successfully.</span>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center space-x-1 text-xs underline"
          >
            <ExternalLink className="w-3 h-3" />
            <span>View site</span>
          </a>
        </div>
      )}
      {savedMsg === 'error' && (
        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">Save failed. Check that the backend services are running.</span>
        </div>
      )}

      {/* ─── Sections ─── */}

      {/* 1. Business Identity */}
      <Section title="Business Identity" icon={Globe} defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Business Name" hint="Displayed in header, footer, and SEO tags.">
            <input
              id="field-business-name"
              className={INPUT_CLS}
              value={form.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
            />
          </Field>
          <Field label="Tagline" hint="Short descriptor shown beneath the name.">
            <input
              id="field-tagline"
              className={INPUT_CLS}
              value={form.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
            />
          </Field>
        </div>
        <Field label="Announcement Bar Text" hint="Short message displayed in the orange top bar.">
          <input
            id="field-announcement"
            className={INPUT_CLS}
            value={form.announcementText}
            onChange={(e) => handleChange('announcementText', e.target.value)}
          />
        </Field>
        <Field label="Physical Address" hint="Optional — shown in contact section and footer.">
          <input
            id="field-address"
            className={INPUT_CLS}
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </Field>
      </Section>

      {/* 2. Contact Details */}
      <Section title="Contact Details" icon={Phone}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Primary Phone"
            hint="Safaricom number — used for tel: links and M-Pesa. Formats: 07XXXXXXXX or +2547XXXXXXXX."
          >
            <input
              id="field-primary-phone"
              className={INPUT_CLS}
              value={form.primaryPhone}
              onChange={(e) => handleChange('primaryPhone', e.target.value)}
              placeholder="0714843208"
            />
          </Field>
          <Field
            label="WhatsApp Number"
            hint="E.164 format (+254…). This is used for all WhatsApp click-to-chat links."
          >
            <input
              id="field-whatsapp"
              className={INPUT_CLS}
              value={form.whatsappNumber}
              onChange={(e) => handleChange('whatsappNumber', e.target.value)}
              placeholder="+254714843208"
            />
          </Field>
          <Field label="Business Email" hint="Optional — shown in the contact section.">
            <input
              id="field-email"
              type="email"
              className={INPUT_CLS}
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="info@michaforge.co.ke"
            />
          </Field>
        </div>
      </Section>

      {/* 3. Hero / Homepage Content */}
      <Section title="Hero Section — Homepage" icon={Type}>
        <Field label="Hero Headline" hint="Large bold text. Concise and impactful.">
          <input
            id="field-hero-headline"
            className={INPUT_CLS}
            value={form.heroHeadline}
            onChange={(e) => handleChange('heroHeadline', e.target.value)}
          />
        </Field>
        <Field label="Hero Sub-headline" hint="Smaller bold text above the headline.">
          <input
            id="field-hero-subheadline"
            className={INPUT_CLS}
            value={form.heroSubheadline}
            onChange={(e) => handleChange('heroSubheadline', e.target.value)}
          />
        </Field>
        <Field
          label="Hero Description"
          hint="Paragraph text describing your business (1–2 sentences max)."
        >
          <textarea
            id="field-hero-description"
            className={TEXTAREA_CLS}
            rows={3}
            value={form.heroDescription}
            onChange={(e) => handleChange('heroDescription', e.target.value)}
          />
        </Field>
        <Field
          label="Hero Background Image URL"
          hint="Absolute URL or public path (e.g. /images/hero_plumbing_supplies.png). Upload via Media Library first."
        >
          <input
            id="field-hero-image"
            className={INPUT_CLS}
            value={form.heroImageUrl}
            onChange={(e) => handleChange('heroImageUrl', e.target.value)}
          />
        </Field>
        {form.heroImageUrl && (
          <div className="mt-2 rounded-xl overflow-hidden border border-[#DFE5EB] max-h-40 bg-gray-100 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.heroImageUrl}
              alt="Hero preview"
              className="object-cover w-full max-h-40"
            />
          </div>
        )}
      </Section>

      {/* 4. Logos & Assets */}
      <Section title="Logos & Asset Paths" icon={ImageIcon}>
        <p className="text-xs text-[#667585] bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          These are file paths, not file uploads. Upload images first in the{' '}
          <a href="/admin/media" className="text-[#073253] font-bold underline">
            Media Library
          </a>{' '}
          then paste the returned URL here.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Logo URL (Dark Backgrounds)">
            <input
              id="field-logo-url"
              className={INPUT_CLS}
              value={form.logoUrl}
              onChange={(e) => handleChange('logoUrl', e.target.value)}
              placeholder="/images/logo_navbar.png"
            />
          </Field>
          <Field label="Logo URL (White / Light)">
            <input
              id="field-logo-white-url"
              className={INPUT_CLS}
              value={form.logoWhiteUrl}
              onChange={(e) => handleChange('logoWhiteUrl', e.target.value)}
              placeholder="/images/logo_footer.png"
            />
          </Field>
          <Field label="Favicon URL">
            <input
              id="field-favicon-url"
              className={INPUT_CLS}
              value={form.faviconUrl}
              onChange={(e) => handleChange('faviconUrl', e.target.value)}
              placeholder="/favicon.ico"
            />
          </Field>
        </div>
      </Section>

      {/* 5. Brand Colour Reference */}
      <Section title="Brand Colour Palette (Read-only Reference)" icon={Palette}>
        <p className="text-xs text-[#667585] mb-3">
          These are the approved Michaforge brand colours. They are hard-coded into the design system
          and cannot be changed here to maintain visual consistency.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'Deep Navy', hex: '#073253' },
            { name: 'Primary Navy', hex: '#0B3556' },
            { name: 'Brand Orange', hex: '#FF850D' },
            { name: 'Red Accent', hex: '#D92D36' },
            { name: 'WhatsApp Green', hex: '#0BAA58' },
            { name: 'Off-White BG', hex: '#F5F7FA' },
            { name: 'Border Grey', hex: '#DFE5EB' },
            { name: 'Dark Text', hex: '#172B3A' },
          ].map((c) => (
            <div key={c.hex} className="flex items-center space-x-2.5">
              <div
                className="w-8 h-8 rounded-lg border border-[#DFE5EB] flex-shrink-0"
                style={{ backgroundColor: c.hex }}
              />
              <div>
                <p className="text-[11px] font-bold text-[#172B3A]">{c.name}</p>
                <p className="text-[10px] font-mono text-[#667585]">{c.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Live Preview Link */}
      <div className="flex items-center justify-between p-4 bg-[#073253]/5 border border-[#073253]/20 rounded-2xl">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-5 h-5 text-[#FF850D]" />
          <div>
            <p className="text-sm font-bold text-[#073253]">Preview Public Website</p>
            <p className="text-xs text-[#667585]">Changes take effect immediately after saving.</p>
          </div>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          id="preview-site-link"
          className="inline-flex items-center space-x-1.5 bg-[#FF850D] hover:bg-[#E67300] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open Site</span>
        </a>
      </div>
    </div>
  );
}
