'use client';

import React, { useState } from 'react';
import { Phone, MessageSquare, MessageCircle, Send, CheckCircle2, AlertCircle, Clock, MapPin } from 'lucide-react';
import { generateWhatsAppLink, isValidKenyanPhoneNumber } from '@michaforge/shared-validation';

interface ContactSectionProps {
  businessPhone?: string;
  whatsappNumber?: string;
  secondaryPhone?: string;
  secondaryWhatsappNumber?: string;
  address?: string;
  googleMapsUrl?: string;
}

export default function ContactSection({
  businessPhone = '0714843208',
  whatsappNumber = '+254714843208',
  secondaryPhone = '0721435772',
  secondaryWhatsappNumber = '+254721435772',
  address = 'Kombo Munyiri Rd, Gikomba, next to Gold Stone Plaza, Nairobi, Kenya',
  googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=Michaforge+Enterprises+and+Hardware,+Kombo+Munyiri+Rd,+Nairobi',
}: ContactSectionProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    email: '',
    enquiryType: 'general',
    productName: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const primaryWaUrl = generateWhatsAppLink(
    whatsappNumber,
    undefined,
    undefined,
    'Hello Michaforge Enterprises, I would like to make an enquiry regarding your plumbing materials.'
  );

  const secondaryWaUrl = generateWhatsAppLink(
    secondaryWhatsappNumber,
    undefined,
    undefined,
    'Hello Michaforge Enterprises, I would like to make an enquiry regarding your plumbing materials.'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!formData.customerName.trim() || !formData.phoneNumber.trim() || !formData.message.trim()) {
      setStatusMessage({ type: 'error', text: 'Please fill in your name, phone number, and message.' });
      return;
    }

    if (!isValidKenyanPhoneNumber(formData.phoneNumber)) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid Kenyan phone number (e.g. 0714843208 or +254714843208).' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: 'Thank you! Your enquiry has been received. Our team will contact you shortly.',
        });
        setFormData({
          customerName: '',
          phoneNumber: '',
          email: '',
          enquiryType: 'general',
          productName: '',
          message: '',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error?.message || `Failed to submit enquiry. Please call us directly on ${businessPhone} or ${secondaryPhone}.`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Network connection issue. Please contact us directly on WhatsApp or Call ${businessPhone} / ${secondaryPhone}.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-10 bg-white border-t border-[#DFE5EB]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-[#FF850D] uppercase tracking-wider">
            Get In Touch
          </span>
          <h2 className="text-3xl font-extrabold text-[#073253] mt-1">
            Contact Michaforge Enterprises
          </h2>
          <div className="w-16 h-1 bg-[#FF850D] mx-auto mt-2 rounded-full" />
          <p className="text-[#667585] text-sm mt-3">
            Reach our plumbing materials supply desk via Call, SMS, WhatsApp (Primary or Alternative line) or submit an online enquiry for instant pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Action Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Direct Phone Numbers Header */}
            <div className="bg-[#F5F7FA] border border-[#DFE5EB] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center space-x-2 text-[#073253]">
                <Phone className="w-5 h-5 text-[#FF850D]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#667585]">
                  Direct Voice Call Lines
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Primary Phone */}
                <a
                  href={`tel:${whatsappNumber}`}
                  className="flex flex-col p-3 rounded-xl bg-white border border-[#DFE5EB] hover:border-[#FF850D] hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-[#073253]">
                      Primary Line
                    </span>
                    <Phone className="w-3.5 h-3.5 text-[#073253] group-hover:text-[#FF850D]" />
                  </div>
                  <span className="text-base font-extrabold text-[#073253] group-hover:text-[#FF850D]">
                    {businessPhone}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Tap to call</span>
                </a>

                {/* Alternative Phone */}
                <a
                  href={`tel:${secondaryWhatsappNumber}`}
                  className="flex flex-col p-3 rounded-xl bg-white border border-[#DFE5EB] hover:border-[#FF850D] hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-orange-50 text-[#FF850D]">
                      Alternative Line
                    </span>
                    <Phone className="w-3.5 h-3.5 text-[#FF850D]" />
                  </div>
                  <span className="text-base font-extrabold text-[#073253] group-hover:text-[#FF850D]">
                    {secondaryPhone}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Tap to call</span>
                </a>
              </div>
            </div>

            {/* WhatsApp Chat Channels */}
            <div className="bg-[#F5F7FA] border border-[#DFE5EB] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center space-x-2 text-[#0BAA58]">
                <MessageCircle className="w-5 h-5 fill-[#0BAA58] text-[#0BAA58]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0BAA58]">
                  WhatsApp Support &amp; Enquiries
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Primary WhatsApp */}
                <a
                  href={primaryWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col p-3 rounded-xl bg-white border border-[#DFE5EB] hover:border-[#0BAA58] hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-green-50 text-[#0BAA58]">
                      WhatsApp 1 (Primary)
                    </span>
                    <MessageCircle className="w-3.5 h-3.5 text-[#0BAA58] fill-[#0BAA58]" />
                  </div>
                  <span className="text-sm font-extrabold text-[#073253] group-hover:text-[#0BAA58]">
                    Chat {businessPhone}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Instant quotes &amp; orders</span>
                </a>

                {/* Alternative WhatsApp */}
                <a
                  href={secondaryWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col p-3 rounded-xl bg-white border border-[#DFE5EB] hover:border-[#0BAA58] hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-green-50 text-[#0BAA58]">
                      WhatsApp 2 (Alternative)
                    </span>
                    <MessageCircle className="w-3.5 h-3.5 text-[#0BAA58] fill-[#0BAA58]" />
                  </div>
                  <span className="text-sm font-extrabold text-[#073253] group-hover:text-[#0BAA58]">
                    Chat {secondaryPhone}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Fast customer service</span>
                </a>
              </div>
            </div>

            {/* SMS Cards */}
            <div className="bg-[#F5F7FA] border border-[#DFE5EB] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center space-x-2 text-[#0B3556]">
                <MessageSquare className="w-5 h-5 text-[#0B3556]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#667585]">
                  Send SMS Inquiry
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={`sms:${whatsappNumber}?body=Hello%20Michaforge%20Enterprises%2C%20please%20send%20price%20quote`}
                  className="p-3 rounded-xl bg-white border border-[#DFE5EB] hover:border-[#073253] transition-colors"
                >
                  <span className="text-[10px] font-bold text-gray-500 block">SMS Primary</span>
                  <span className="text-sm font-bold text-[#073253]">{businessPhone}</span>
                </a>
                <a
                  href={`sms:${secondaryWhatsappNumber}?body=Hello%20Michaforge%20Enterprises%2C%20please%20send%20price%20quote`}
                  className="p-3 rounded-xl bg-white border border-[#DFE5EB] hover:border-[#073253] transition-colors"
                >
                  <span className="text-[10px] font-bold text-gray-500 block">SMS Alternative</span>
                  <span className="text-sm font-bold text-[#073253]">{secondaryPhone}</span>
                </a>
              </div>
            </div>

            {/* Business Details Box */}
            <div className="p-5 rounded-2xl bg-[#073253] text-white space-y-3">
              <div className="flex items-center space-x-2 text-[#FF850D] text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Operating Hours</span>
              </div>
              <p className="text-sm text-gray-200">
                Monday – Saturday: 7:30 AM – 6:00 PM <br />
                Sunday &amp; Public Holidays: On Call / WhatsApp
              </p>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start space-x-2.5 text-xs text-gray-200 pt-3 border-t border-[#0B3556] hover:text-white transition-colors"
                title="Open Michaforge Enterprises and Hardware on Google Maps"
              >
                <MapPin className="w-4 h-4 text-[#FF850D] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="block font-bold text-white group-hover:text-[#FF850D] transition-colors">
                      Michaforge Enterprises and Hardware
                    </span>
                    <span className="text-[10px] font-bold text-[#FF850D] bg-[#FF850D]/20 px-2 py-0.5 rounded border border-[#FF850D]/40 whitespace-nowrap">
                      Maps 📍
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-200 block mt-0.5">
                    {address}
                  </span>
                  <span className="text-[11px] text-gray-300 block mt-0.5">
                    Nairobi &amp; Countrywide Deliveries • <span className="text-[#FF850D] underline underline-offset-2">View Named Pin (PR9M+5HJ) →</span>
                  </span>
                </div>
              </a>
            </div>

            {/* Live Interactive Google Map with Named Business Pin */}
            <div className="rounded-2xl border border-[#DFE5EB] bg-white p-3.5 shadow-sm space-y-2.5 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0BAA58] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0BAA58]" />
                  </span>
                  <span className="text-xs font-black text-[#073253]">
                    Michaforge Enterprises and Hardware
                  </span>
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-[#FF850D] hover:underline inline-flex items-center"
                >
                  <span>Open Full Map</span>
                  <span className="ml-1">↗</span>
                </a>
              </div>
              <div className="w-full h-44 rounded-xl overflow-hidden border border-[#DFE5EB] relative bg-slate-100">
                <iframe
                  title="Michaforge Enterprises and Hardware Location"
                  src="https://maps.google.com/maps?q=Michaforge+Enterprises+and+Hardware,+Kombo+Munyiri+Rd,+Nairobi&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#667585] pt-0.5">
                <span className="truncate">Kombo Munyiri Rd, next to Gold Stone Plaza</span>
                <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  PR9M+5HJ Nairobi
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Web Enquiry Form */}
          <div className="lg:col-span-7 bg-[#F5F7FA] p-6 sm:p-8 rounded-2xl border border-[#DFE5EB] shadow-sm">
            <h3 className="text-xl font-bold text-[#073253] mb-2">
              Submit a Product Enquiry
            </h3>
            <p className="text-xs text-[#667585] mb-6">
              Need bulk materials or a specific pipe fitting? Fill in the details below and we will prepare a quotation for you.
            </p>

            {statusMessage && (
              <div
                className={`p-4 rounded-xl mb-6 flex items-start space-x-3 text-sm ${
                  statusMessage.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#172B3A] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Kamau"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#DFE5EB] bg-white text-sm text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B3A] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0714843208"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#DFE5EB] bg-white text-sm text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#172B3A] mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#DFE5EB] bg-white text-sm text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B3A] mb-1">
                    Enquiry Type
                  </label>
                  <select
                    value={formData.enquiryType}
                    onChange={(e) => setFormData({ ...formData, enquiryType: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#DFE5EB] bg-white text-sm text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                  >
                    <option value="general">General Plumbing Enquiry</option>
                    <option value="product">Specific Product Price</option>
                    <option value="bulk_quote">Bulk Project Quotation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B3A] mb-1">
                  Product / Item of Interest (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4 inch PVC Pipes, Brass Ball Valve, 1,000L Tank"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#DFE5EB] bg-white text-sm text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B3A] mb-1">
                  Your Message or Quantity Required *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please state quantities, delivery location, or sizes required..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#DFE5EB] bg-white text-sm text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center space-x-2 bg-[#FF850D] hover:bg-[#E67300] text-white font-bold py-3.5 px-6 rounded-lg transition-colors shadow-md disabled:opacity-70"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting Enquiry...' : 'Submit Product Enquiry'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
