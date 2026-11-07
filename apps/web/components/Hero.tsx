'use client';

import React from 'react';
import {
  ArrowRight,
  MessageCircle,
  ShoppingBag,
  ShieldCheck,
  Building2,
  Truck,
  CheckCircle2,
} from 'lucide-react';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  description?: string;
  whatsappNumber?: string;
  heroImageUrl?: string;
}

export default function Hero({
  headline = 'Quality Plumbing &\nHardware Materials',
  subheadline = 'WELCOME TO MICHAFORGE ENTERPRISES',
  description = 'Your trusted supplier of plumbing materials, pipes, fittings, taps, valves and all hardware essentials.',
  whatsappNumber = '+254714843208',
  heroImageUrl = '/images/about/showroom_display.png',
}: HeroProps) {
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hello Michaforge Enterprises, I would like to enquire about your plumbing and hardware materials.'
  )}`;

  const resolvedBgImage =
    !heroImageUrl ||
    heroImageUrl === '/images/hero_plumbing_supplies.png' ||
    heroImageUrl === '/images/modern_hardware_hero.png'
      ? '/images/about/showroom_display.png'
      : heroImageUrl;

  return (
    <section className="relative bg-[#073253] text-white overflow-hidden py-10 sm:py-14 lg:py-16">
      {/* Background Showroom Image with Seamless Deep Navy Ambient Blend */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <img
          src={resolvedBgImage}
          alt="Michaforge Enterprises Showroom Backdrop"
          className="w-full h-full object-cover object-center filter brightness-[0.35] contrast-[1.1] saturate-[1.2]"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (target.src !== '/images/about/showroom_display.jpg') {
              target.src = '/images/about/showroom_display.jpg';
            } else {
              target.src = '/images/modern_hardware_about.png';
            }
          }}
        />

        {/* Horizontal Gradient: Deep solid navy on left for 100% typography contrast, soft transparency on right for showroom visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#073253] via-[#073253]/92 to-[#073253]/65" />

        {/* Vertical Vignette: Seamless top & bottom transitions with Navbar and Categories */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#073253]/85 via-transparent to-[#073253]/90" />

        {/* Warm Orange Brand Ambient Light */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FF850D]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Typography, Value Proposition & CTAs */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            {/* Subheadline Pill Badge */}
            <div>
              <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[#FF850D] text-xs sm:text-sm font-extrabold tracking-wider uppercase shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#FF850D] animate-pulse" />
                <span>{subheadline}</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.12] text-white drop-shadow-md">
              Quality Plumbing &amp; <br />
              <span className="text-[#FF850D]">Hardware Materials</span>
            </h1>

            {/* Description */}
            <p className="text-gray-200 text-sm sm:text-base max-w-xl leading-relaxed drop-shadow-sm font-medium">
              {description}
            </p>

            {/* Call To Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <a
                href="/products"
                className="inline-flex items-center space-x-2 bg-[#FF850D] hover:bg-[#E67300] text-white font-bold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all text-sm group"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Our Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-black/35 hover:bg-white/15 text-white font-semibold border border-white/40 hover:border-white px-5 py-3.5 rounded-xl backdrop-blur-md transition-all text-sm shadow-md"
              >
                <MessageCircle className="w-4 h-4 text-[#0BAA58]" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Quick Trust Indicators */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-gray-300">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0BAA58]" />
                <span>100% Genuine Supplies</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0BAA58]" />
                <span>Direct Contractor Pricing</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0BAA58]" />
                <span>Countrywide Delivery</span>
              </span>
            </div>
          </div>

          {/* Right Column: Glassmorphic Hub Showcase (Lets the showroom background shine through) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#FF850D] flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF850D]" />
                  <span>Nairobi Warehouse &amp; Showroom</span>
                </span>
                <span className="text-[11px] font-semibold text-gray-300">Open Mon – Sat</span>
              </div>

              {/* 3 Value Pillars */}
              <div className="space-y-2.5">
                <div className="flex items-start space-x-3 bg-black/30 p-3 rounded-xl border border-white/10 hover:border-[#FF850D]/60 transition-colors">
                  <ShieldCheck className="w-5 h-5 text-[#FF850D] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Genuine Certified Materials</h4>
                    <p className="text-xs text-gray-300 mt-0.5 leading-normal">
                      Heavy-duty PPR, uPVC, brass ball valves, and verified plumbing fixtures.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-black/30 p-3 rounded-xl border border-white/10 hover:border-[#FF850D]/60 transition-colors">
                  <Building2 className="w-5 h-5 text-[#0BAA58] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Contractor &amp; Project Supply</h4>
                    <p className="text-xs text-gray-300 mt-0.5 leading-normal">
                      Complete project bills of quantities (BOQs) supplied at wholesale rates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-black/30 p-3 rounded-xl border border-white/10 hover:border-[#FF850D]/60 transition-colors">
                  <Truck className="w-5 h-5 text-[#FF850D] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Prompt Countrywide Dispatch</h4>
                    <p className="text-xs text-gray-300 mt-0.5 leading-normal">
                      Fast, reliable delivery to job sites in Nairobi and all Kenyan counties.
                    </p>
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp Enquiry Shortcut */}
              <div className="pt-2 flex items-center justify-between text-xs text-gray-300 border-t border-white/10">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0BAA58]" />
                  <span>Direct Hotline: <strong className="text-white">0714843208</strong></span>
                </span>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF850D] hover:underline font-bold flex items-center space-x-1"
                >
                  <span>Quick Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
