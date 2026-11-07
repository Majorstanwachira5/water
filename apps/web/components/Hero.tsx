'use client';

import React from 'react';
import { ArrowRight, MessageCircle, ShoppingBag, CheckCircle2 } from 'lucide-react';

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
    <section className="relative bg-[#073253] text-white overflow-hidden pt-7 sm:pt-9 lg:pt-10 pb-4 sm:pb-5 lg:pb-6">
      {/* Background Showroom Image with Seamless Deep Navy Ambient Blend */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <img
          src="/images/about/showroom_display.png"
          alt="Michaforge Enterprises Showroom Backdrop"
          className="w-full h-full object-cover object-center filter brightness-[0.32] contrast-[1.1] saturate-[1.2]"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left Column: Typography, Value Proposition & CTAs */}
          <div className="lg:col-span-6 space-y-4">
            {/* Subheadline Pill Badge */}
            <div>
              <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[#FF850D] text-xs sm:text-sm font-extrabold tracking-wider uppercase shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#FF850D] animate-pulse" />
                <span>{subheadline}</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight leading-[1.12] text-white drop-shadow-md">
              Quality Plumbing &amp; <br />
              <span className="text-[#FF850D]">Hardware Materials</span>
            </h1>

            {/* Description */}
            <p className="text-gray-200 text-sm sm:text-base max-w-lg leading-relaxed drop-shadow-sm font-medium">
              {description}
            </p>

            {/* Call To Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1.5">
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
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-gray-300">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0BAA58]" />
                <span>100% Genuine Supplies</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0BAA58]" />
                <span>Direct Contractor Pricing</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0BAA58]" />
                <span>Countrywide Delivery</span>
              </span>
            </div>
          </div>

          {/* Right Column: Modern Hardware Showcase Photo (Returned back crystal clear) */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-[#FF850D]/40 bg-[#0B3556]">
              <img
                src={resolvedHeroImage}
                alt="Michaforge Enterprises Modern Plumbing and Hardware Materials"
                className="w-full h-[250px] sm:h-[300px] lg:h-[320px] object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/hero_plumbing_supplies.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#073253]/25 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
