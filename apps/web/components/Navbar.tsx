'use client';

import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  businessPhone?: string;
  whatsappNumber?: string;
  secondaryPhone?: string;
  secondaryWhatsappNumber?: string;
  activePage?: 'home' | 'products' | 'about' | 'contact';
}

export default function Navbar({
  businessPhone = '0714843208',
  whatsappNumber = '+254714843208',
  secondaryPhone = '0721435772',
  secondaryWhatsappNumber = '+254721435772',
  activePage = 'home',
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [waDropdownOpen, setWaDropdownOpen] = useState(false);

  const cleanPrimaryWa = whatsappNumber.replace(/[^0-9]/g, '');
  const cleanSecondaryWa = secondaryWhatsappNumber.replace(/[^0-9]/g, '');

  const primaryWaUrl = `https://wa.me/${cleanPrimaryWa}?text=${encodeURIComponent(
    'Hello Michaforge Enterprises, I would like to enquire about your plumbing and hardware materials.'
  )}`;
  const secondaryWaUrl = `https://wa.me/${cleanSecondaryWa}?text=${encodeURIComponent(
    'Hello Michaforge Enterprises, I would like to enquire about your plumbing and hardware materials.'
  )}`;

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-md border-b border-[#DFE5EB]">
      {/* 1. TOP INFORMATION BAR: Catchy Customer Message (Slim & Centered) */}
      <div className="bg-[#073253] text-white py-1 sm:py-1.5 px-3 sm:px-6 border-b border-[#0B3556]">
        <div className="max-w-7xl mx-auto flex items-center justify-center relative">
          <p className="text-center font-medium text-[11px] sm:text-xs md:text-[13px] tracking-wide text-gray-100">
            “Your Trusted Partner for Quality Plumbing &amp; Hardware Solutions”
          </p>

          {/* Quick Phone Call Links on Desktop (Primary + Alternative) */}
          <div className="hidden lg:flex items-center space-x-1.5 text-xs absolute right-0 text-gray-200">
            <Phone className="w-3 h-3 text-[#FF850D]" />
            <a href={`tel:${whatsappNumber}`} className="font-semibold hover:text-white transition-colors">
              {businessPhone}
            </a>
            <span className="text-gray-400">/</span>
            <a href={`tel:${secondaryWhatsappNumber}`} className="font-semibold hover:text-[#FF850D] transition-colors">
              {secondaryPhone}
            </a>
          </div>
        </div>
      </div>

      {/* 2. COMPACT WHITE BRANDING SECTION: Logo, Company Name & WhatsApp CTA */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-4 bg-white">
        {/* Left: High-Visibility Faucet Logo */}
        <a
          href="/"
          className="flex items-center flex-shrink-0 group"
          aria-label="Michaforge Enterprises Logo"
        >
          <div className="relative flex items-center justify-center bg-white rounded-lg p-1 border border-[#D92D36]/25 shadow-xs group-hover:border-[#D92D36] transition-all">
            <img
              src="/images/logo_emblem.png"
              alt="Michaforge MFE Faucet Logo"
              className="h-9 sm:h-11 md:h-12 w-auto object-contain contrast-125 saturate-125"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/logo_navbar.png';
              }}
            />
          </div>
        </a>

        {/* Center: Company Name & Compact Tagline Badge */}
        <a
          href="/"
          className="flex-1 flex flex-col items-center justify-center text-center px-1 sm:px-3 group"
        >
          <div className="flex flex-wrap items-baseline justify-center gap-x-1.5 sm:gap-x-2.5 leading-none">
            <span className="text-lg sm:text-2xl md:text-[26px] lg:text-[28px] font-black tracking-wide text-[#D92D36] drop-shadow-xs">
              MICHAFORGE
            </span>
            <span className="text-base sm:text-xl md:text-[22px] lg:text-[24px] font-black tracking-wider text-[#073253]">
              ENTERPRISES
            </span>
          </div>

          <div className="mt-0.5 sm:mt-1 inline-flex items-center justify-center space-x-1.5 bg-[#073253] text-white px-2.5 sm:px-3 py-0.5 rounded-full shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF850D] flex-shrink-0" />
            <span className="text-[8px] sm:text-[9.5px] md:text-[10.5px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.18em]">
              DEALERS IN ALL PLUMBING MATERIALS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF850D] flex-shrink-0" />
          </div>
        </a>

        {/* Right: WhatsApp CTA & Mobile Menu Toggle */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0 relative">
          <div
            className="relative"
            onMouseEnter={() => setWaDropdownOpen(true)}
            onMouseLeave={() => setWaDropdownOpen(false)}
          >
            <a
              href={primaryWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 bg-[#0BAA58] hover:bg-[#09934B] text-white px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs hover:shadow transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white flex-shrink-0" />
              <span className="hidden md:inline">Chat on WhatsApp</span>
              <span className="md:hidden">WhatsApp</span>
            </a>

            {/* Hover / click dropdown to pick Primary or Alternative WhatsApp */}
            {waDropdownOpen && (
              <div className="hidden sm:block absolute right-0 top-full pt-1 z-50 w-56">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 text-xs space-y-1">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-2 py-0.5">
                    Select WhatsApp Line:
                  </span>
                  <a
                    href={primaryWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-green-50 text-[#073253] font-bold transition-colors"
                  >
                    <span>Primary Line</span>
                    <span className="text-[#0BAA58]">{businessPhone}</span>
                  </a>
                  <a
                    href={secondaryWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-green-50 text-[#073253] font-bold transition-colors"
                  >
                    <span>Alternative Line</span>
                    <span className="text-[#0BAA58]">{secondaryPhone}</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          <a
            href={primaryWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden p-1.5 rounded-full bg-[#0BAA58] text-white shadow-xs"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-[#073253] hover:bg-gray-100 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. SEPARATE ORANGE NAVIGATION BAR: Home | Products | About Us | Contact | Staff Login */}
      <nav className="bg-[#FF850D] text-white shadow-xs border-t border-[#FF982A]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* Desktop & Tablet Navigation */}
          <div className="hidden md:flex items-center justify-center h-8 sm:h-9 space-x-1.5 lg:space-x-3 text-xs sm:text-[13px] font-bold">
            <a
              href="/"
              className={`px-3 py-1 rounded transition-colors duration-150 ${
                activePage === 'home'
                  ? 'bg-[#073253] text-white shadow-xs'
                  : 'text-white hover:bg-[#073253] hover:text-white'
              }`}
            >
              Home
            </a>
            <span className="text-white/40 text-xs select-none">|</span>

            <a
              href="/products"
              className={`px-3 py-1 rounded transition-colors duration-150 ${
                activePage === 'products'
                  ? 'bg-[#073253] text-white shadow-xs'
                  : 'text-white hover:bg-[#073253] hover:text-white'
              }`}
            >
              Products
            </a>
            <span className="text-white/40 text-xs select-none">|</span>

            <a
              href="/#about"
              className="px-3 py-1 rounded text-white hover:bg-[#073253] hover:text-white transition-colors duration-150"
            >
              About Us
            </a>
            <span className="text-white/40 text-xs select-none">|</span>

            <a
              href="/#contact"
              className="px-3 py-1 rounded text-white hover:bg-[#073253] hover:text-white transition-colors duration-150"
            >
              Contact
            </a>
            <span className="text-white/40 text-xs select-none">|</span>

            <a
              href="/admin/login"
              className="px-3 py-1 rounded text-white hover:bg-[#073253] hover:text-white transition-colors duration-150 inline-flex items-center space-x-1"
              title="Staff Portal Login"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-white/90" />
              <span>Staff Login</span>
            </a>
          </div>

          {/* Mobile Quick Bar (Swipeable / Center-aligned on small screens) */}
          <div className="flex md:hidden items-center justify-center space-x-1.5 text-[11px] font-bold w-full overflow-x-auto py-1.5 scrollbar-none">
            <a
              href="/"
              className={`px-2 py-0.5 rounded transition-colors ${
                activePage === 'home' ? 'bg-[#073253] text-white' : 'text-white hover:bg-[#073253]'
              }`}
            >
              Home
            </a>
            <span className="text-white/40 select-none">|</span>
            <a
              href="/products"
              className={`px-2 py-0.5 rounded transition-colors ${
                activePage === 'products' ? 'bg-[#073253] text-white' : 'text-white hover:bg-[#073253]'
              }`}
            >
              Products
            </a>
            <span className="text-white/40 select-none">|</span>
            <a href="/#about" className="px-2 py-0.5 rounded text-white hover:bg-[#073253] transition-colors">
              About
            </a>
            <span className="text-white/40 select-none">|</span>
            <a href="/#contact" className="px-2 py-0.5 rounded text-white hover:bg-[#073253] transition-colors">
              Contact
            </a>
            <span className="text-white/40 select-none">|</span>
            <a href="/admin/login" className="px-2 py-0.5 rounded text-white hover:bg-[#073253] transition-colors">
              Staff
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu (When Hamburger is clicked) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2.5 pb-4 space-y-1.5 shadow-lg">
          <a
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3.5 py-2 rounded-lg text-sm font-bold transition-colors ${
              activePage === 'home' ? 'bg-[#FF850D] text-white' : 'text-[#073253] hover:bg-gray-50'
            }`}
          >
            Home
          </a>
          <a
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3.5 py-2 rounded-lg text-sm font-bold transition-colors ${
              activePage === 'products' ? 'bg-[#FF850D] text-white' : 'text-[#073253] hover:bg-gray-50'
            }`}
          >
            Products
          </a>
          <a
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2 rounded-lg text-sm font-bold text-[#073253] hover:bg-gray-50 transition-colors"
          >
            About Us
          </a>
          <a
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2 rounded-lg text-sm font-bold text-[#073253] hover:bg-gray-50 transition-colors"
          >
            Contact
          </a>
          <a
            href="/admin/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 pt-2 border-t border-gray-100 transition-colors"
          >
            Staff Portal Login
          </a>

          {/* Quick Dual Contact Options in Mobile Menu */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-3.5">
              Direct Contact Lines
            </span>
            <div className="grid grid-cols-2 gap-2 px-3.5">
              <a
                href={primaryWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-1.5 bg-[#0BAA58] text-white py-2 px-2 rounded-lg text-xs font-bold shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>WA {businessPhone}</span>
              </a>
              <a
                href={secondaryWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-1.5 bg-[#0BAA58] text-white py-2 px-2 rounded-lg text-xs font-bold shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>WA {secondaryPhone}</span>
              </a>
            </div>
            <div className="grid grid-cols-2 gap-2 px-3.5">
              <a
                href={`tel:${whatsappNumber}`}
                className="flex items-center justify-center space-x-1.5 bg-[#073253] text-white py-2 px-2 rounded-lg text-xs font-bold"
              >
                <Phone className="w-3.5 h-3.5 text-[#FF850D]" />
                <span>Call {businessPhone}</span>
              </a>
              <a
                href={`tel:${secondaryWhatsappNumber}`}
                className="flex items-center justify-center space-x-1.5 bg-[#073253] text-white py-2 px-2 rounded-lg text-xs font-bold"
              >
                <Phone className="w-3.5 h-3.5 text-[#FF850D]" />
                <span>Call {secondaryPhone}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
