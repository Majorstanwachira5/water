'use client';

import React from 'react';
import { Phone, MessageCircle, MapPin, ChevronRight, ShieldCheck } from 'lucide-react';
import { generateWhatsAppLink } from '@michaforge/shared-validation';

interface FooterProps {
  businessPhone?: string;
  whatsappNumber?: string;
  secondaryPhone?: string;
  secondaryWhatsappNumber?: string;
}

export default function Footer({
  businessPhone = '0714843208',
  whatsappNumber = '+254714843208',
  secondaryPhone = '0721435772',
  secondaryWhatsappNumber = '+254721435772',
}: FooterProps) {
  const primaryWaUrl = generateWhatsAppLink(
    whatsappNumber,
    undefined,
    undefined,
    'Hello Michaforge Enterprises, I would like to enquire about your plumbing materials.'
  );

  const secondaryWaUrl = generateWhatsAppLink(
    secondaryWhatsappNumber,
    undefined,
    undefined,
    'Hello Michaforge Enterprises, I would like to enquire about your plumbing materials.'
  );

  return (
    <footer className="bg-[#073253] text-white border-t border-[#0B3556]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:divide-x lg:divide-[#0B3556]/80 items-start">
          {/* Col 1: Brand & Logo (4 cols) */}
          <div className="lg:col-span-4 space-y-2 pr-4">
            <img
              src="/images/logo_clean_white.svg"
              alt="Michaforge Enterprises"
              className="h-14 sm:h-16 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/logo_footer.png';
              }}
            />
            <p className="text-gray-300 text-xs leading-relaxed">
              Dealers in all plumbing materials, pipes, fittings, taps, valves, water tanks and building essentials in Kenya.
            </p>
          </div>

          {/* Col 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 lg:pl-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2.5">
              Quick Links
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-300">
              <li>
                <a href="/" className="hover:text-[#FF850D] flex items-center space-x-1 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF850D]" />
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a href="/products" className="hover:text-[#FF850D] flex items-center space-x-1 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF850D]" />
                  <span>Products</span>
                </a>
              </li>
              <li>
                <a href="/#about" className="hover:text-[#FF850D] flex items-center space-x-1 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF850D]" />
                  <span>About Us</span>
                </a>
              </li>
              <li>
                <a href="/#contact" className="hover:text-[#FF850D] flex items-center space-x-1 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF850D]" />
                  <span>Contact</span>
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-[#FF850D] flex items-center space-x-1 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF850D]" />
                  <span>Staff Portal</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Us (3 cols) */}
          <div className="lg:col-span-3 lg:pl-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2.5">
              Contact Us
            </h4>
            <div className="space-y-2 text-xs text-gray-300">
              {/* Primary Phone */}
              <a
                href={`tel:${whatsappNumber}`}
                className="flex items-center space-x-2 hover:text-[#FF850D] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#FF850D] flex-shrink-0" />
                <span>Call: {businessPhone} (Primary)</span>
              </a>

              {/* Alternative Phone */}
              <a
                href={`tel:${secondaryWhatsappNumber}`}
                className="flex items-center space-x-2 hover:text-[#FF850D] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#FF850D] flex-shrink-0" />
                <span>Call: {secondaryPhone} (Alternative)</span>
              </a>

              {/* Primary WhatsApp */}
              <a
                href={primaryWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:text-[#0BAA58] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#0BAA58] flex-shrink-0" />
                <span>WhatsApp: {businessPhone}</span>
              </a>

              {/* Alternative WhatsApp */}
              <a
                href={secondaryWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:text-[#0BAA58] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#0BAA58] flex-shrink-0" />
                <span>WhatsApp: {secondaryPhone}</span>
              </a>

              <div className="flex items-start space-x-2 text-gray-300 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF850D] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block">Visit Our Shop</span>
                  <span className="text-[11px] text-gray-400">Nairobi, Kenya</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: We Accept Payment Badges (3 cols) */}
          <div className="lg:col-span-3 lg:pl-6 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
              We Accept
            </h4>
            <div className="flex items-center space-x-2">
              <div className="bg-white px-2.5 py-1 rounded text-[11px] font-black tracking-wider text-[#0BAA58] shadow-sm">
                M-PESA
              </div>
              <div className="bg-[#0B3556] border border-white/20 px-2.5 py-1 rounded text-[11px] font-black italic tracking-wider text-white">
                VISA
              </div>
              <div className="flex items-center bg-[#0B3556] border border-white/20 px-2 py-1 rounded space-x-1">
                <span className="w-3.5 h-3.5 rounded-full bg-[#EB001B] inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] -ml-2 inline-block opacity-90" />
              </div>
            </div>
            <div className="pt-1 text-[11px] text-gray-300 italic leading-snug">
              <div>Quality Products | Reliable Service</div>
              <div className="text-gray-400">Your Plumbing &amp; Hardware Partner</div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Orange Bottom Copyright Bar matching flyer */}
      <div className="w-full bg-[#FF850D] py-2 px-4 text-center text-white text-xs font-semibold">
        © {new Date().getFullYear()} Michaforge Enterprises. All rights reserved.
      </div>
    </footer>
  );
}
