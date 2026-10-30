'use client';

import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';

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
  heroImageUrl = '/images/hero_plumbing_supplies.png',
}: HeroProps) {
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hello Michaforge Enterprises, I would like to enquire about your plumbing and hardware materials.'
  )}`;

  return (
    <section className="relative bg-[#073253] text-white overflow-hidden py-10 lg:py-16">
      {/* Dynamic Orange Diagonal Decorative Slice matching the flyer */}
      <div
        className="hidden lg:block absolute top-0 bottom-0 left-[48%] w-8 bg-[#FF850D] -skew-x-12 z-10 shadow-2xl"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            {/* Subheadline Pill */}
            <div className="inline-block">
              <span className="text-[#FF850D] text-xs sm:text-sm font-bold tracking-widest uppercase">
                {subheadline}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Quality Plumbing &amp; <br />
              <span className="text-[#FF850D]">Hardware Materials</span>
            </h1>

            {/* Description */}
            <p className="text-gray-200 text-base sm:text-lg max-w-xl leading-relaxed">
              {description}
            </p>

            {/* Call To Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="/products"
                className="inline-flex items-center space-x-2 bg-[#FF850D] hover:bg-[#E67300] text-white font-bold px-7 py-3.5 rounded-lg shadow-lg hover:shadow-orange-500/20 transition-all text-sm sm:text-base group"
              >
                <span>View Our Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-transparent hover:bg-white/10 text-white font-semibold border-2 border-white px-6 py-3 rounded-lg transition-all text-sm sm:text-base"
              >
                <MessageCircle className="w-5 h-5 text-[#0BAA58]" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Assortment Photo */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg lg:max-w-none rounded-2xl overflow-hidden shadow-2xl border-2 border-[#0B3556]/60 bg-[#0B3556]">
              <img
                src={heroImageUrl}
                alt="Michaforge Enterprises Plumbing and Hardware Materials"
                className="w-full h-auto object-cover max-h-[380px] sm:max-h-[440px]"
                onError={(e) => {
                  // Fallback if needed
                  (e.currentTarget as HTMLImageElement).src = '/images/flyer_upright.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#073253]/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
