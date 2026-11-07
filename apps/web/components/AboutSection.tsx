'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Truck,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface AboutSlide {
  id: string;
  image: string;
  fallback: string;
  tag: string;
  badge: string;
  caption: string;
  subcaption: string;
}

const ABOUT_SLIDES: AboutSlide[] = [
  {
    id: 'founder_portrait',
    image: '/images/about/founder_hardware_portrait.png',
    fallback: '/images/about/founder_portrait.jpg',
    tag: "Kenya's Trusted Supplier",
    badge: 'Managing Director & Technical Specialist',
    caption: 'Genuine modern plumbing & hardware materials built to last.',
    subcaption: 'Hands-on contractor support, direct quotations & certified brand durability.',
  },
  {
    id: 'founder_store',
    image: '/images/about/founder_hardware_store.png',
    fallback: '/images/about/founder_standing.jpg',
    tag: 'Direct Project Supply',
    badge: 'Nairobi Storefront & Warehouse Hub',
    caption: 'Over 70+ certified plumbing and hardware product lines in stock.',
    subcaption: 'Prompt delivery of complete project bills of quantities across all Kenyan counties.',
  },
  {
    id: 'showroom_display',
    image: '/images/about/showroom_display.png',
    fallback: '/images/modern_hardware_about.png',
    tag: "Contractors' First Choice",
    badge: 'Comprehensive Inventory',
    caption: 'Heavy-duty PPR, uPVC, brass valves & stylish sanitary fixtures.',
    subcaption: 'Commercial-grade resilience engineered for modern residential and commercial builds.',
  },
];

export default function AboutSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // Auto-looping carousel timer (advances every 4.5 seconds when not paused)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ABOUT_SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % ABOUT_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + ABOUT_SLIDES.length) % ABOUT_SLIDES.length);
  };

  // Touch Swipe Handlers for Mobile Browsers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  const active = ABOUT_SLIDES[currentSlide];

  return (
    <section id="about" className="py-12 sm:py-16 bg-[#F5F7FA] border-t border-[#DFE5EB] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Interactive Looping Image Carousel */}
          <div className="lg:col-span-5">
            <div
              className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 border-white bg-[#073253] group select-none h-[420px] sm:h-[480px]"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              role="region"
              aria-label="Michaforge Leadership & Showroom Carousel"
            >
              {/* Slides Container with Crossfade Transitions */}
              <div className="relative w-full h-full">
                {ABOUT_SLIDES.map((slide, idx) => {
                  const isActive = idx === currentSlide;

                  return (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      <img
                        src={slide.image}
                        alt={slide.caption}
                        className="w-full h-full object-cover object-top filter brightness-[0.98] transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.src !== slide.fallback) {
                            target.src = slide.fallback;
                          } else {
                            target.src = '/images/modern_hardware_about.png';
                          }
                        }}
                      />

                      {/* Deep Gradient Overlay for Maximum Text Legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#073253]/95 via-[#073253]/45 to-transparent" />
                    </div>
                  );
                })}
              </div>

              {/* Floating Top Badge (Slide Counter & Auto-play Status) */}
              <div className="absolute top-3.5 inset-x-3.5 z-20 flex items-center justify-between text-xs">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white font-bold border border-white/15 shadow-sm">
                  <Sparkles className="w-3 h-3 text-[#FF850D]" />
                  <span className="text-[11px] uppercase tracking-wider">{active.badge}</span>
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-[#073253]/80 backdrop-blur-md text-white font-mono text-[11px] font-bold border border-white/10">
                  0{currentSlide + 1} / 0{ABOUT_SLIDES.length}
                </span>
              </div>

              {/* Navigation Arrows (Visible on Desktop Hover & Always on Tablet/Mobile) */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Slide"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-[#FF850D] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-md hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Slide"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-[#FF850D] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-md hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Bottom Caption Overlay (Exact Heading from Original) */}
              <div className="absolute bottom-0 inset-x-0 z-20 p-5 sm:p-6 text-white space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF850D]" />
                  <span className="text-[11px] sm:text-xs uppercase tracking-widest text-[#FF850D] font-extrabold drop-shadow-xs">
                    {active.tag}
                  </span>
                </div>

                <p className="text-sm sm:text-base font-bold leading-snug drop-shadow-sm text-white">
                  {active.caption}
                </p>

                <p className="text-xs text-gray-200/90 leading-relaxed drop-shadow-xs hidden sm:block">
                  {active.subcaption}
                </p>

                {/* Looping Slide Indicators (Clickable Progress Dots) */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    {ABOUT_SLIDES.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none ${
                          idx === currentSlide
                            ? 'w-7 bg-[#FF850D] shadow-xs'
                            : 'w-2 bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[10px] text-gray-300 italic">
                    {isPaused ? 'Paused on hover' : 'Auto-looping'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: About details */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <span className="text-xs font-bold text-[#FF850D] uppercase tracking-wider">
                About Our Business
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#073253] tracking-tight mt-1">
                Dealers in All Plumbing Materials &amp; Hardware
              </h2>
              <div className="w-16 h-1 bg-[#FF850D] mt-2 rounded-full" />
            </div>

            <p className="text-[#172B3A] text-sm sm:text-base leading-relaxed">
              <strong>Michaforge Enterprises</strong> is your reliable plumbing partner in Kenya, supplying commercial builders, plumbing contractors, and residential owners with certified piping systems, durable fittings, brass valves, stylish faucets, and high-capacity water storage tanks.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-[#DFE5EB] shadow-2xs hover:border-[#FF850D] transition-colors">
                <ShieldCheck className="w-5 h-5 text-[#FF850D] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#073253]">Certified Quality</h4>
                  <p className="text-xs text-[#667585] mt-0.5 leading-normal">
                    Heavy-duty uPVC, PPR, brass valves, and high-pressure fittings built to last.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-[#DFE5EB] shadow-2xs hover:border-[#FF850D] transition-colors">
                <Truck className="w-5 h-5 text-[#0BAA58] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#073253]">Full Contractor Supply</h4>
                  <p className="text-xs text-[#667585] mt-0.5 leading-normal">
                    Complete project bills of quantities supplied promptly across Kenya.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-[#DFE5EB] shadow-2xs hover:border-[#FF850D] transition-colors">
                <Headphones className="w-5 h-5 text-[#073253] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#073253]">Direct Technical Advice</h4>
                  <p className="text-xs text-[#667585] mt-0.5 leading-normal">
                    Instant advice on pipe diameters, pressure ratings, and installation fittings.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-[#DFE5EB] shadow-2xs hover:border-[#FF850D] transition-colors">
                <CheckCircle2 className="w-5 h-5 text-[#FF850D] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#073253]">Transparent Pricing</h4>
                  <p className="text-xs text-[#667585] mt-0.5 leading-normal">
                    Direct quotations via call, SMS, or WhatsApp on 0714843208.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
