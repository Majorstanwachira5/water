'use client';

import React, { useState } from 'react';
import { Phone, MessageSquare, MessageCircle, Send, CheckCircle2, AlertCircle, Clock, MapPin } from 'lucide-react';
import { generateWhatsAppLink, isValidKenyanPhoneNumber } from '../../packages/shared-validation/src';

interface ContactSectionProps {
  businessPhone?: string;
  whatsappNumber?: string;
}

export default function ContactSection({
  businessPhone = '0714843208',
  whatsappNumber = '+254714843208',
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

  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const waUrl = generateWhatsAppLink(whatsappNumber, undefined, undefined, 'Hello Michaforge Enterprises, I would like to make an enquiry regarding your plumbing materials.');

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
          text: data.error?.message || 'Failed to submit enquiry. Please call us directly on 0714843208.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Network connection issue. Please contact us directly on WhatsApp or Call 0714843208.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-16 bg-white border-t border-[#DFE5EB]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#FF850D] uppercase tracking-wider">
            Get In Touch
          </span>
          <h2 className="text-3xl font-extrabold text-[#073253] mt-1">
            Contact Michaforge Enterprises
          </h2>
          <div className="w-16 h-1 bg-[#FF850D] mx-auto mt-2 rounded-full" />
          <p className="text-[#667585] text-sm mt-3">
            Reach our plumbing materials supply desk via Call, SMS, WhatsApp or submit an online enquiry for instant pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Action Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Phone Card */}
            <a
              href={`tel:+254714843208`}
              className="flex items-center space-x-4 p-5 rounded-2xl bg-[#F5F7FA] border border-[#DFE5EB] hover:border-[#FF850D] hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#073253] text-white flex items-center justify-center flex-shrink-0 group-hover:bg-[#FF850D] transition-colors">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#667585] uppercase tracking-wider">Direct Voice Call</span>
                <h4 className="text-lg font-extrabold text-[#073253] group-hover:text-[#FF850D] transition-colors">
                  0714843208
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">Tap to dial immediately (+254 714 843 208)</p>
              </div>
            </a>

            {/* WhatsApp Card */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-4 p-5 rounded-2xl bg-[#F5F7FA] border border-[#DFE5EB] hover:border-[#0BAA58] hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0BAA58] text-white flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 fill-white" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#0BAA58] uppercase tracking-wider">WhatsApp Chat</span>
                <h4 className="text-lg font-extrabold text-[#073253] group-hover:text-[#0BAA58] transition-colors">
                  Chat on WhatsApp
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">Instant quotes, specifications &amp; photos</p>
              </div>
            </a>

            {/* SMS Card */}
            <a
              href={`sms:+254714843208?body=Hello%20Michaforge%20Enterprises%2C%20please%20send%20price%20quote`}
              className="flex items-center space-x-4 p-5 rounded-2xl bg-[#F5F7FA] border border-[#DFE5EB] hover:border-[#073253] hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0B3556] text-white flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#667585] uppercase tracking-wider">Send SMS</span>
                <h4 className="text-lg font-extrabold text-[#073253]">
                  0714843208
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">Send text message quote request</p>
              </div>
            </a>

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
              <div className="flex items-center space-x-2 text-xs text-gray-300 pt-2 border-t border-[#0B3556]">
                <MapPin className="w-4 h-4 text-[#FF850D]" />
                <span>Nairobi &amp; Countrywide Deliveries in Kenya</span>
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
