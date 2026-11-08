'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Tag,
  Headphones,
  Target,
  Eye,
  Quote,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { AboutContent } from '@michaforge/shared-contracts';

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
    caption: 'Quality plumbing and hardware materials at competitive prices.',
    subcaption: 'Trusted by homeowners, contractors, builders and industry professionals.',
  },
  {
    id: 'founder_store',
    image: '/images/about/founder_hardware_store.png',
    fallback: '/images/about/founder_standing.jpg',
    tag: 'Kombo Munyiri Rd, Gikomba',
    badge: 'Next to Gold Stone Plaza, Nairobi',
    caption: 'Wide range of reliable products in stock for every project.',
    subcaption: 'Honesty, quality, affordability and dependable customer service.',
  },
  {
    id: 'showroom_display',
    image: '/images/about/showroom_display.png',
    fallback: '/images/modern_hardware_about.png',
    tag: 'Quality & Reliability',
    badge: 'Comprehensive Inventory',
    caption: 'Heavy-duty PPR, uPVC, brass valves & sanitary fixtures.',
    subcaption: 'Quality products, fair prices and guaranteed customer satisfaction.',
  },
];

const DEFAULT_ABOUT_CONTENT: AboutContent = {
  title: 'About Us',
  description:
    'Michaforge Enterprises is a trusted supplier and dealer in plumbing and hardware materials, committed to providing quality products at competitive prices.',
  paragraphs: [
    'Michaforge Enterprises is a trusted supplier and dealer in plumbing and hardware materials, committed to providing quality products at competitive prices.',
    'We pride ourselves on offering a wide range of reliable products to meet the needs of homeowners, contractors, builders and other industry professionals. Our focus is on quality, affordability and excellent customer service.',
    'At Michaforge Enterprises, our goal is to deliver value and earn the trust of every customer we serve. Our commitment is simple: Quality products, fair prices and customer satisfaction.',
  ],
  valuesLead:
    'Our values are built on honesty, quality, affordability and excellent customer service:',
  features: [
    {
      title: 'Quality',
      desc: 'Reliable products you can trust.',
    },
    {
      title: 'Affordability',
      desc: 'Competitive prices that offer value for money.',
    },
    {
      title: 'Customer Service',
      desc: 'Friendly, dependable and professional service.',
    },
  ],
  mission: 'To provide quality plumbing and hardware materials at affordable prices.',
  vision:
    'To be the leading destination for plumbing and hardware solutions in quality, affordability and excellence.',
  slogan: '"Building Trust Through Quality and Reliability."',
  location: 'Kombo Munyiri Rd, Gikomba, next to Gold Stone Plaza, Nairobi, Kenya',
};

interface AboutSectionProps {
  aboutContent?: AboutContent | null;
  address?: string;
}

export default function AboutSection({ aboutContent, address }: AboutSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const paragraphs =
    aboutContent?.paragraphs && aboutContent.paragraphs.length > 0
      ? aboutContent.paragraphs
      : DEFAULT_ABOUT_CONTENT.paragraphs!;
  const valuesLead = aboutContent?.valuesLead || DEFAULT_ABOUT_CONTENT.valuesLead!;
  const values =
    aboutContent?.features && aboutContent.features.length > 0
      ? aboutContent.features
      : DEFAULT_ABOUT_CONTENT.features;
  const mission = aboutContent?.mission || DEFAULT_ABOUT_CONTENT.mission!;
  const vision = aboutContent?.vision || DEFAULT_ABOUT_CONTENT.vision!;
  const slogan = aboutContent?.slogan || DEFAULT_ABOUT_CONTENT.slogan!;
  const locationText =
    aboutContent?.location ||
    (address && address !== 'Nairobi, Kenya' ? address : DEFAULT_ABOUT_CONTENT.location!);

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

  const getValueIcon = (idx: number) => {
    if (idx === 0) return <ShieldCheck className="w-5 h-5 text-[#FF850D] flex-shrink-0" />;
    if (idx === 1) return <Tag className="w-5 h-5 text-[#0BAA58] flex-shrink-0" />;
    return <Headphones className="w-5 h-5 text-[#073253] flex-shrink-0" />;
  };

  return (
    <section id="about" className="py-10 sm:py-14 bg-[#F5F7FA] border-t border-[#DFE5EB] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Row: Showroom Carousel + About Us & Our Values */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-9 items-stretch">
          {/* Left Column: Interactive Looping Image Carousel */}
          <div className="lg:col-span-5 flex">
            <div
              className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border-2 border-white bg-[#073253] group select-none min-h-[380px] sm:min-h-[440px]"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              role="region"
              aria-label="Michaforge Leadership & Showroom Carousel"
            >
              {/* Slides Container with Crossfade Transitions */}
              <div className="absolute inset-0">
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

              {/* Floating Top Badge */}
              <div className="absolute top-3.5 inset-x-3.5 z-20 flex items-center justify-between text-xs">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white font-bold border border-white/15 shadow-sm">
                  <Sparkles className="w-3 h-3 text-[#FF850D]" />
                  <span className="text-[11px] uppercase tracking-wider">{active.badge}</span>
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-[#073253]/80 backdrop-blur-md text-white font-mono text-[11px] font-bold border border-white/10">
                  0{currentSlide + 1} / 0{ABOUT_SLIDES.length}
                </span>
              </div>

              {/* Navigation Arrows */}
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

              {/* Bottom Caption Overlay */}
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

                {/* Looping Slide Indicators */}
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

          {/* Right Column: Exact About Us Narrative & Core Values */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div>
                <span className="text-xs font-extrabold text-[#FF850D] uppercase tracking-wider">
                  Michaforge Enterprises
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#073253] tracking-tight mt-0.5">
                  About Us
                </h2>
                <div className="w-16 h-1 bg-[#FF850D] mt-2 rounded-full" />
              </div>

              <div className="space-y-3 text-[#172B3A] text-sm sm:text-[15px] leading-relaxed">
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Our Values Box */}
            <div className="bg-white rounded-2xl border border-[#DFE5EB] p-4 sm:p-5 space-y-3.5 shadow-2xs">
              <p className="text-xs sm:text-sm font-bold text-[#073253] leading-snug">
                {valuesLead}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {values.map((val, idx) => (
                  <div
                    key={val.title}
                    className="rounded-xl bg-[#F8FAFC] border border-[#DFE5EB] p-3.5 hover:border-[#FF850D] transition-colors flex flex-col space-y-1.5"
                  >
                    <div className="flex items-center space-x-2">
                      {getValueIcon(idx)}
                      <h3 className="font-extrabold text-sm text-[#073253]">{val.title}</h3>
                    </div>
                    <p className="text-xs text-[#475569] leading-relaxed">{val.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Rows: Our Mission, Our Vision, Our Slogan & LOCATION */}
        <div className="mt-6 sm:mt-8 space-y-4">
          {/* Mission & Vision Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#DFE5EB] hover:border-[#FF850D] transition-colors p-5 flex items-start space-x-4 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-[#FF850D]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#073253]">Our Mission</h3>
                <p className="text-xs sm:text-sm text-[#172B3A] mt-1 leading-relaxed">
                  {mission}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#DFE5EB] hover:border-[#073253] transition-colors p-5 flex items-start space-x-4 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-[#073253]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#073253]">Our Vision</h3>
                <p className="text-xs sm:text-sm text-[#172B3A] mt-1 leading-relaxed">
                  {vision}
                </p>
              </div>
            </div>
          </div>

          {/* Slogan & Location Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#073253] text-white rounded-2xl border border-[#0B3556] p-5 flex items-start space-x-4 relative overflow-hidden">
              <div className="w-11 h-11 rounded-xl bg-[#FF850D]/20 border border-[#FF850D]/40 flex items-center justify-center flex-shrink-0">
                <Quote className="w-5 h-5 text-[#FF850D]" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF850D]">
                  Our Slogan
                </span>
                <p className="text-sm sm:text-base font-extrabold text-white mt-1 italic leading-snug">
                  {slogan}
                </p>
              </div>
            </div>

            <div className="bg-[#0B3556] text-white rounded-2xl border border-[#FF850D]/40 p-5 flex items-start space-x-4 relative overflow-hidden">
              <div className="w-11 h-11 rounded-xl bg-[#FF850D]/20 border border-[#FF850D]/40 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#FF850D]" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF850D]">
                  LOCATION
                </span>
                <p className="text-sm sm:text-base font-bold text-white mt-1 leading-snug">
                  {locationText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
