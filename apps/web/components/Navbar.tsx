'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  businessPhone?: string;
  whatsappNumber?: string;
  activePage?: 'home' | 'products' | 'about' | 'contact';
}

export default function Navbar({
  businessPhone = '0714843208',
  whatsappNumber = '+254714843208',
  activePage = 'home',
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hello Michaforge Enterprises, I would like to enquire about your plumbing and hardware materials.'
  )}`;

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-md border-b border-[#DFE5EB]">
      {/* 1. TOP SECTION: White Brand Header with High-Visibility Logo on Left & Centered Company Name */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3 sm:gap-6 bg-white">
        {/* Left: High-Visibility Faucet Logo Emblem */}
        <a
          href="/"
          className="flex items-center flex-shrink-0 group"
          aria-label="Michaforge Enterprises Logo"
        >
          <div className="relative flex items-center justify-center bg-white rounded-xl p-1 border-2 border-[#D92D36]/30 shadow-sm group-hover:border-[#D92D36] transition-all">
            <img
              src="/images/logo_emblem.png"
              alt="Michaforge MFE Faucet Logo"
              className="h-12 sm:h-16 md:h-[72px] w-auto object-contain contrast-125 saturate-125"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/logo_navbar.png';
              }}
            />
          </div>
        </a>

        {/* Center: Company Name filling the whole center part of the white top section */}
        <a
          href="/"
          className="flex-1 flex flex-col items-center justify-center text-center group px-1 sm:px-4"
        >
          <div className="flex flex-wrap items-baseline justify-center gap-x-2 sm:gap-x-3 leading-none">
            <span className="text-xl sm:text-3xl md:text-4xl lg:text-[42px] font-black tracking-wider text-[#D92D36] drop-shadow-sm">
              MICHAFORGE
            </span>
            <span className="text-lg sm:text-2xl md:text-3xl lg:text-[34px] font-black tracking-widest text-[#073253]">
              ENTERPRISES
            </span>
          </div>

          <div className="mt-1 sm:mt-1.5 inline-flex items-center justify-center space-x-1.5 sm:space-x-2.5 bg-[#073253] text-white px-3 sm:px-6 py-0.5 sm:py-1 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#FF850D] flex-shrink-0" />
            <span className="text-[9px] sm:text-xs md:text-sm font-extrabold uppercase tracking-[0.14em] sm:tracking-[0.2em]">
              DEALERS IN ALL PLUMBING MATERIALS
            </span>
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#FF850D] flex-shrink-0" />
          </div>
        </a>

        {/* Right: WhatsApp CTA (Desktop) & Mobile Menu Button */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center space-x-2 bg-[#0BAA58] hover:bg-[#09934B] text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-sm hover:shadow transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp</span>
          </a>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="lg:hidden p-2.5 rounded-full bg-[#0BAA58] text-white shadow-sm"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#073253] hover:bg-gray-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 2. BELOW THE COMPANY NAME: Navy Navigation & Contact Bar */}
      <nav className="bg-[#073253] text-white text-xs py-2 px-4 border-t border-[#0B3556]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Tagline */}
          <div className="hidden sm:flex items-center space-x-1.5 font-medium text-gray-200">
            <MapPin className="w-3.5 h-3.5 text-[#FF850D] flex-shrink-0" />
            <span>Quality Plumbing &amp; Hardware Solutions</span>
          </div>

          {/* Center: Clean text navigation links (no icons) */}
          <div className="flex items-center space-x-4 sm:space-x-6 font-bold text-xs">
            <a
              href="/"
              className={`transition-colors ${
                activePage === 'home' ? 'text-[#FF850D]' : 'text-white hover:text-[#FF850D]'
              }`}
            >
              Home
            </a>
            <a
              href="/products"
              className={`transition-colors ${
                activePage === 'products' ? 'text-[#FF850D]' : 'text-white hover:text-[#FF850D]'
              }`}
            >
              Products
            </a>
            <a
              href="/#about"
              className="text-white hover:text-[#FF850D] transition-colors"
            >
              About Us
            </a>
            <a
              href="/#contact"
              className="text-white hover:text-[#FF850D] transition-colors"
            >
              Contact
            </a>
          </div>

          {/* Right: Direct Phone & Password-Protected Staff Login */}
          <div className="flex items-center space-x-4">
            <a
              href="tel:+254714843208"
              className="flex items-center space-x-1 hover:text-[#FF850D] transition-colors font-semibold"
            >
              <Phone className="w-3.5 h-3.5 text-[#FF850D]" />
              <span>+254 714 843 208</span>
            </a>
            <a
              href="/admin/login"
              className="text-gray-300 hover:text-white flex items-center space-x-1 text-[11px] pl-3 border-l border-white/20"
              title="Staff Login (Password Required)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF850D]" />
              <span>Staff Login</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu (No icons on nav items) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-1.5">
          <a
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-bold bg-[#FF850D] text-white"
          >
            Home
          </a>
          <a
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-bold text-[#073253] hover:bg-gray-50"
          >
            Products
          </a>
          <a
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-bold text-[#073253] hover:bg-gray-50"
          >
            About Us
          </a>
          <a
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-bold text-[#073253] hover:bg-gray-50"
          >
            Contact
          </a>
          <a
            href="/admin/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50 pt-2 border-t"
          >
            Staff Portal Login
          </a>
        </div>
      )}
    </header>
  );
}
