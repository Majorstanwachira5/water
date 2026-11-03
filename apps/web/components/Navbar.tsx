'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Menu,
  X,
  Home,
  LayoutGrid,
  User,
  Mail,
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
    <header className="w-full sticky top-0 z-50 bg-white shadow-sm border-b border-[#DFE5EB]/80">
      {/* 1. Ultra-Slim Navy Top Announcement Bar */}
      <div className="bg-[#073253] text-white text-[11px] py-1 px-4 border-b border-[#0B3556]/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left item */}
          <div className="flex items-center space-x-1.5 font-medium">
            <MapPin className="w-3 h-3 text-[#FF850D] flex-shrink-0" />
            <span>Quality Plumbing &amp; Hardware Solutions</span>
          </div>

          {/* Right items */}
          <div className="flex items-center space-x-4">
            <a
              href={`tel:+254714843208`}
              className="flex items-center space-x-1 hover:text-[#FF850D] transition-colors font-medium"
            >
              <Phone className="w-3 h-3 text-[#FF850D]" />
              <span>Call Us: +254 714 843 208</span>
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-1 hover:text-[#0BAA58] transition-colors font-medium"
            >
              <MessageCircle className="w-3 h-3 text-[#0BAA58]" />
              <span>WhatsApp Us</span>
            </a>
            <a
              href="/admin"
              className="text-gray-300 hover:text-white flex items-center space-x-1 text-[10px] opacity-85 hover:opacity-100"
              title="Admin Portal"
            >
              <ShieldCheck className="w-3 h-3 text-[#FF850D]" />
              <span>Staff Login</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Compact White Navigation Bar with Prominent Brand Logo & Name */}
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 py-1 sm:py-1.5 flex items-center justify-between gap-4">
        {/* Prominent Brand Logo & Website Name filling the left white section */}
        <a
          href="/"
          className="flex items-center flex-shrink-0 group py-0.5"
          aria-label="Michaforge Enterprises — Dealers in All Plumbing Materials"
        >
          <img
            src="/images/logo_clean.svg"
            alt="Michaforge Enterprises — Dealers in All Plumbing Materials"
            className="h-12 sm:h-14 md:h-[60px] lg:h-[66px] w-auto object-contain transition-transform duration-200 group-hover:scale-[1.01]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/logo_navbar.png';
            }}
          />
        </a>

        {/* Desktop Nav Items matching flyer icons & pills */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <a
            href="/"
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs lg:text-sm font-bold transition-all ${
              activePage === 'home'
                ? 'bg-[#FF850D] text-white shadow-sm'
                : 'text-[#073253] hover:text-[#FF850D] hover:bg-gray-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </a>

          <a
            href="/products"
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs lg:text-sm font-bold transition-all ${
              activePage === 'products'
                ? 'bg-[#FF850D] text-white shadow-sm'
                : 'text-[#073253] hover:text-[#FF850D] hover:bg-gray-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-[#073253] group-hover:text-[#FF850D]" />
            <span>Products</span>
          </a>

          <a
            href="/#about"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs lg:text-sm font-bold text-[#073253] hover:text-[#FF850D] hover:bg-gray-50 transition-all"
          >
            <User className="w-4 h-4 text-[#073253]" />
            <span>About Us</span>
          </a>

          <a
            href="/#contact"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs lg:text-sm font-bold text-[#073253] hover:text-[#FF850D] hover:bg-gray-50 transition-all"
          >
            <Mail className="w-4 h-4 text-[#073253]" />
            <span>Contact</span>
          </a>
        </div>

        {/* Right Action: WhatsApp CTA button */}
        <div className="hidden md:block flex-shrink-0">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-[#0BAA58] hover:bg-[#09934B] text-white px-4 lg:px-5 py-2 rounded-full text-xs lg:text-sm font-bold shadow-sm hover:shadow transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center space-x-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-[#0BAA58] text-white shadow-sm"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#073253] hover:bg-gray-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-1.5">
          <a
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-bold bg-[#FF850D] text-white"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </a>
          <a
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-bold text-[#073253] hover:bg-gray-50"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Products</span>
          </a>
          <a
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-bold text-[#073253] hover:bg-gray-50"
          >
            <User className="w-4 h-4" />
            <span>About Us</span>
          </a>
          <a
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-bold text-[#073253] hover:bg-gray-50"
          >
            <Mail className="w-4 h-4" />
            <span>Contact</span>
          </a>
          <a
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50 pt-2 border-t"
          >
            <ShieldCheck className="w-4 h-4 text-[#FF850D]" />
            <span>Staff Portal Login</span>
          </a>
        </div>
      )}
    </header>
  );
}
