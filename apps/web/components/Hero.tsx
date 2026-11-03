'use client';

import React from 'react';
import { ArrowRight, MessageCircle, ShoppingBag } from 'lucide-react';

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
  heroImageUrl = '/images/modern_hardware_hero.png',
}: HeroProps) {
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hello Michaforge Enterprises, I would like to enquire about your plumbing and hardware materials.'
  )}`;

  const resolvedHeroImage =
    !heroImageUrl || heroImageUrl === '/images/hero_plumbing_supplies.png'
      ? '/images/modern_hardware_hero.png'
      : heroImageUrl;

  return (
    <section className="relative bg-[#073253] text-white overflow-hidden py-8 lg:py-12">
      {/* Dynamic Orange Diagonal Decorative Slice matching the flyer */}
      <div
        className="hidden lg:block absolute top-0 bottom-0 left-[47%] w-4 bg-[#FF850D] -skew-x-[18deg] z-10 shadow-xl"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-6 space-y-4">
            {/* Subheadline */}
            <div>
              <span className="text-[#FF850D] text-xs sm:text-sm font-extrabold tracking-wider uppercase">
                {subheadline}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight leading-[1.12]">
              Quality Plumbing &amp; <br />
              <span className="text-[#FF850D]">Hardware Materials</span>
            </h1>

            {/* Description */}
            <p className="text-gray-200 text-sm sm:text-base max-w-lg leading-relaxed">
              {description}
            </p>

            {/* Call To Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <a
                href="/products"
                className="inline-flex items-center space-x-2 bg-[#FF850D] hover:bg-[#E67300] text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-orange-500/20 transition-all text-sm group"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Our Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-[#073253]/80 hover:bg-white/10 text-white font-semibold border border-white/60 px-5 py-3 rounded-lg transition-all text-sm"
              >
                <MessageCircle className="w-4 h-4 text-[#0BAA58]" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Column: Modern Hardware Showcase Photo */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-[#FF850D]/40 bg-[#0B3556]">
              <img
                src={resolvedHeroImage}
                alt="Michaforge Enterprises Modern Plumbing and Hardware Materials"
                className="w-full h-[260px] sm:h-[320px] lg:h-[340px] object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/hero_plumbing_supplies.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#073253]/30 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
