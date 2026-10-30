'use client';

import React from 'react';
import { Phone, MessageCircle, MapPin, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { generateWhatsAppLink } from '@michaforge/shared-validation';

interface FooterProps {
  businessPhone?: string;
  whatsappNumber?: string;
}

export default function Footer({
  businessPhone = '0714843208',
  whatsappNumber = '+254714843208',
}: FooterProps) {
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const waUrl = generateWhatsAppLink(
    whatsappNumber,
    undefined,
    undefined,
    'Hello Michaforge Enterprises, I would like to enquire about your plumbing materials.'
  );

  return (
    <footer className="bg-[#073253] text-white pt-16 border-t border-[#0B3556]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          {/* Col 1: Brand & Logo */}
          <div className="space-y-4">
            <img
              src="/images/logo_clean_white.svg"
              alt="Michaforge Enterprises"
              className="h-12 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/logo_footer.png';
              }}
            />
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Dealers in all plumbing materials, pipes, fittings, taps, valves, water tanks and building essentials in Kenya.
            </p>
            <div className="pt-2 text-xs text-[#FF850D] font-bold">
              • Quality Products • Reliable Service •
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#FF850D]" />
              <span>Quick Links</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
              <li>
                <a href="/" className="hover:text-[#FF850D] flex items-center space-x-1.5 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF850D]" />
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a href="/products" className="hover:text-[#FF850D] flex items-center space-x-1.5 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF850D]" />
                  <span>Products Catalogue</span>
                </a>
              </li>
              <li>
                <a href="/#about" className="hover:text-[#FF850D] flex items-center space-x-1.5 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF850D]" />
                  <span>About Us</span>
                </a>
              </li>
              <li>
                <a href="/#contact" className="hover:text-[#FF850D] flex items-center space-x-1.5 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF850D]" />
                  <span>Contact &amp; Enquiries</span>
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-[#FF850D] flex items-center space-x-1.5 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF850D]" />
                  <span>Staff Portal</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#FF850D]" />
              <span>Product Categories</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
              <li>
                <a href="/products?category=cat_pvc_pipes" className="hover:text-[#FF850D] transition-colors">
                  PVC Pipes (Durable &amp; Reliable)
                </a>
              </li>
              <li>
                <a href="/products?category=cat_pipe_fittings" className="hover:text-[#FF850D] transition-colors">
                  Pipe Fittings (All Types &amp; Sizes)
                </a>
              </li>
              <li>
                <a href="/products?category=cat_taps_faucets" className="hover:text-[#FF850D] transition-colors">
                  Taps &amp; Faucets (Quality Chrome)
                </a>
              </li>
              <li>
                <a href="/products?category=cat_valves" className="hover:text-[#FF850D] transition-colors">
                  Valves (Flow &amp; Pressure Control)
                </a>
              </li>
              <li>
                <a href="/products?category=cat_water_tanks" className="hover:text-[#FF850D] transition-colors">
                  Water Storage Tanks
                </a>
              </li>
              <li>
                <a href="/products?category=cat_hardware_items" className="hover:text-[#FF850D] transition-colors">
                  Hardware &amp; Installation Items
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Us & Payment Badges */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#FF850D]" />
              <span>Contact Us</span>
            </h4>

            <div className="space-y-2.5 text-xs sm:text-sm text-gray-300">
              <a
                href={`tel:+254714843208`}
                className="flex items-center space-x-2 hover:text-[#FF850D] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#FF850D]" />
                <span>+254 714 843 208</span>
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:text-[#0BAA58] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#0BAA58]" />
                <span>Chat on WhatsApp</span>
              </a>

              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="w-4 h-4 text-[#FF850D]" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>

            {/* We Accept Payment Badges from the Flyer */}
            <div className="pt-3 border-t border-[#0B3556]">
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-2">
                We Accept
              </span>
              <div className="flex items-center space-x-2">
                <div className="bg-emerald-600 px-2 py-1 rounded text-[10px] font-black tracking-wider text-white">
                  M-PESA
                </div>
                <div className="bg-blue-600 px-2 py-1 rounded text-[10px] font-black tracking-wider text-white">
                  VISA
                </div>
                <div className="bg-red-600 px-2 py-1 rounded text-[10px] font-black tracking-wider text-white">
                  MASTERCARD
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-[#0B3556] flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
          <p>© {new Date().getFullYear()} Michaforge Enterprises. All rights reserved.</p>
          <p className="text-[#FF850D] font-semibold">
            Quality Plumbing &amp; Hardware Materials
          </p>
        </div>
      </div>

      {/* Narrow Orange Bottom Strip matching flyer */}
      <div className="w-full h-1.5 bg-[#FF850D]" />
    </footer>
  );
}
