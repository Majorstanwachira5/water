'use client';

import React from 'react';
import { Flame, Sparkles, Tag } from 'lucide-react';
import { Category } from '@michaforge/shared-contracts';

interface CategoryStripProps {
  categories?: Category[];
  selectedCategoryId?: string | null;
  onSelectCategory?: (id: string | null) => void;
  showAllOption?: boolean;
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_sanitary_ware',
    name: 'Sanitary Ware',
    slug: 'sanitary-ware',
    description: 'Urinals, Basins, Cisterns & Fittings',
    iconName: 'sanitary',
    displayOrder: 1,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat_taps_faucets',
    name: 'Taps, Mixers & Shattafs',
    slug: 'taps-faucets',
    description: 'Kitchen, Basin Taps & Bidet Sprays',
    iconName: 'tap',
    displayOrder: 2,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat_shower_systems',
    name: 'Showers & Water Heating',
    slug: 'shower-systems',
    description: 'Instant Showers, Columns & Rain Heads',
    iconName: 'shower',
    displayOrder: 3,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat_kitchen_sinks',
    name: 'Kitchen Sinks & Basins',
    slug: 'kitchen-sinks',
    description: 'Black Nano, Stainless Double & Single',
    iconName: 'sink',
    displayOrder: 4,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat_plumbing_pipes',
    name: 'Pipes, Drainage & Traps',
    slug: 'plumbing-pipes',
    description: 'Magic Bend, Bottle Traps & PPR Kit',
    iconName: 'pipe',
    displayOrder: 5,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat_hardware_items',
    name: 'Hardware, Locks & Accessories',
    slug: 'hardware-items',
    description: 'Mortise Locks, 6pc Sets & Towel Shelves',
    iconName: 'hardware',
    displayOrder: 6,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
];

// Rich item highlights for each department card
const CATEGORY_HIGHLIGHTS: Record<string, string[]> = {
  cat_sanitary_ware: ['Ceramic Urinals', 'Wash Basins', 'Flush Kits'],
  cat_taps_faucets: ['Spring Mixers', 'Basin Taps', 'Bidet Shattafs'],
  cat_shower_systems: ['Instant Heaters', 'Shower Columns', 'Rain Heads'],
  cat_kitchen_sinks: ['Nano Black', 'Double Bowl', 'Single Bowl'],
  cat_plumbing_pipes: ['Magic Bends', 'Bottle Traps', 'PPR Pipes'],
  cat_hardware_items: ['Mortise Locks', '6pc Bath Sets', 'Towel Shelves'],
};

// Authentic store starting offer prices per category
const CATEGORY_OFFER_PRICES: Record<string, string> = {
  cat_sanitary_ware: 'From KSh 1,150',
  cat_taps_faucets: 'From KSh 850',
  cat_shower_systems: 'From KSh 1,200',
  cat_kitchen_sinks: 'From KSh 2,600',
  cat_plumbing_pipes: 'From KSh 900',
  cat_hardware_items: 'From KSh 950',
};

const BLACK_NOVEMBER_DEALS = [
  { badge: 'BLACK NOVEMBER', text: 'Mega Plumbing & Hardware Deals Live Now' },
  { badge: 'HOT OFFER', text: 'Taps, Kitchen Mixers & Shattafs from KSh 850' },
  { badge: 'FLASH DEAL', text: 'Instant Shower Heaters & Rain Heads from KSh 1,200' },
  { badge: 'PROMO PRICE', text: 'Black Nano & SUS304 Double Sinks from KSh 2,600' },
  { badge: 'HARDWARE SALE', text: 'Heavy-Duty Mortise Locks & 6pc Bath Sets from KSh 950' },
  { badge: 'PIPES & TRAPS', text: 'Magic Bends, Bottle Traps & PPR Kits from KSh 900' },
  { badge: 'CONTRACTOR BOQ', text: 'Special Wholesale Project Discounts Across Kenya' },
];

function PlumbingCategoryIcon({ name, iconName }: { name: string; iconName?: string }) {
  const key = `${name} ${iconName || ''}`.toLowerCase();

  // 1. Sanitary Ware & Ceramics
  if (key.includes('sanitary') || key.includes('ceramic') || key.includes('urinal') || key.includes('toilet') || key.includes('basin')) {
    return (
      <svg className="w-6 h-6 sm:w-6 sm:h-6" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 6H21V13C21 17 18 20 14 20C10 20 7 17 7 13V6Z" />
        <path d="M11 20V24H17V20" />
        <circle cx="14" cy="14" r="1.5" />
        <path d="M14 6V9" />
      </svg>
    );
  }

  // 2. Taps, Mixers & Shattafs
  if (key.includes('tap') || key.includes('faucet') || key.includes('mixer') || key.includes('shattaf') || key.includes('bidet')) {
    return (
      <svg className="w-6 h-6 sm:w-6 sm:h-6" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 6H18" />
        <path d="M14 6V10" />
        <path d="M6 12H18C20.5 12 22 13.5 22 16V18H18V16C18 15.2 17.5 15 16.5 15H6V12Z" />
        <path d="M6 10V17" />
        <path d="M20 21C20 21 18.5 23 18.5 24C18.5 24.8 19.2 25.5 20 25.5C20.8 25.5 21.5 24.8 21.5 24C21.5 23 20 21 20 21Z" />
      </svg>
    );
  }

  // 3. Showers & Water Heating
  if (key.includes('shower') || key.includes('heater') || key.includes('heating')) {
    return (
      <svg className="w-6 h-6 sm:w-6 sm:h-6" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 7H14C17 7 19 9 19 12V14" />
        <path d="M13 14H25L23 18H15L13 14Z" />
        <line x1="16" y1="21" x2="16" y2="23" />
        <line x1="19" y1="21" x2="19" y2="24" />
        <line x1="22" y1="21" x2="22" y2="23" />
        <circle cx="17.5" cy="26" r="0.75" fill="currentColor" />
        <circle cx="20.5" cy="26" r="0.75" fill="currentColor" />
      </svg>
    );
  }

  // 4. Kitchen Sinks & Basins
  if (key.includes('sink')) {
    return (
      <svg className="w-6 h-6 sm:w-6 sm:h-6" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="8" width="20" height="15" rx="2" />
        <line x1="14" y1="8" x2="14" y2="23" />
        <circle cx="9" cy="15" r="1.5" />
        <circle cx="19" cy="15" r="1.5" />
        <path d="M14 8V5C14 4 15 3 16 3H17" />
      </svg>
    );
  }

  // 5. Pipes, Drainage & Traps
  if (key.includes('pipe') || key.includes('drainage') || key.includes('trap') || key.includes('bend')) {
    return (
      <svg className="w-6 h-6 sm:w-6 sm:h-6" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 19L19 5C20.5 3.5 23 3.5 24 4.5C25 5.5 25 8 23.5 9.5L9.5 23.5" />
        <ellipse cx="7.2" cy="21.2" rx="3.2" ry="2" transform="rotate(-45 7.2 21.2)" />
        <path d="M16 8L20 12" />
      </svg>
    );
  }

  // 6. Hardware & Locks
  return (
    <svg className="w-6 h-6 sm:w-6 sm:h-6" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18.5 5.5C17 7 17 9.5 18.5 11L10.5 19C9 17.5 6.5 17.5 5 19C4 20 4 21.5 4.5 22.5L7 20L8.5 21.5L6 24C7 24.5 8.5 24.5 9.5 23.5C11 22 11 19.5 9.5 18L17.5 10C19 11.5 21.5 11.5 23 10C24 9 24 7.5 23.5 6.5L21 9L19.5 7.5L22 5C21 4.5 19.5 4.5 18.5 5.5Z" />
      <path d="M6 6L12 12" />
      <path d="M16 16L22 22" />
    </svg>
  );
}

export default function CategoryStrip({
  categories = DEFAULT_CATEGORIES,
  selectedCategoryId = null,
  onSelectCategory,
  showAllOption = false,
}: CategoryStripProps) {
  const rawList = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const list = rawList
    .filter((c) => c.isPublished !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <section
      aria-label="Product Categories and Black November Material Offers"
      className="relative overflow-hidden bg-[#061C30] border-b border-[#FF850D]/30 select-none"
    >
      {/* 1. Translucent Animated Black November Hardware Showcase Backdrop */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/images/black_november_promo_bg.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center animate-promo-bg opacity-55 filter contrast-[1.08] saturate-[1.15]"
        />
        {/* Translucent Brand-Synced Gradient Veil so foreground text & cards stay 100% crisp */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#073253]/85 via-[#061B2E]/65 to-[#051626]/88" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061B2E]/80 via-transparent to-[#061B2E]/80" />

        {/* Dynamic Animated Glowing Orbs */}
        <div className="absolute -top-16 left-1/4 w-72 h-72 rounded-full bg-[#FF850D]/20 blur-3xl animate-promo-orb" />
        <div
          className="absolute -bottom-20 right-1/4 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl animate-promo-orb"
          style={{ animationDelay: '-4s' }}
        />

        {/* Animated Shimmer Light Sweep */}
        <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#FF850D]/15 to-transparent animate-promo-sweep" />
      </div>

      {/* 2. Live Scrolling "Black November Material Offers" Marquee Ribbon */}
      <div className="relative z-10 bg-black/40 backdrop-blur-md border-b border-white/10 py-2 overflow-hidden">
        <div className="animate-promo-marquee flex items-center">
          {[0, 1].map((dupIdx) => (
            <div
              key={dupIdx}
              className="flex items-center space-x-6 pr-6"
              aria-hidden={dupIdx === 1}
            >
              {BLACK_NOVEMBER_DEALS.map((deal, idx) => (
                <a
                  key={`${dupIdx}-${idx}`}
                  href="/products"
                  className="inline-flex items-center space-x-2 text-xs whitespace-nowrap group"
                >
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF850D] to-[#FFA133] text-white text-[10px] font-black uppercase tracking-wider">
                    <Flame className="w-3 h-3 fill-white" />
                    <span>{deal.badge}</span>
                  </span>
                  <span className="text-slate-100 group-hover:text-[#FFB057] font-semibold transition-colors">
                    {deal.text}
                  </span>
                  <span className="text-[#FF850D]/60 pl-2">•</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Main Category Showcase Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {/* Section Header with Black November Promo Callout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4 sm:mb-5">
          <div>
            <div className="inline-flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FF850D] text-white text-[10.5px] font-black uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3 h-3" />
                <span>Black November Material Offers</span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Department Catalogue
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-[26px] font-black text-white tracking-tight leading-tight">
              Explore Plumbing &amp; Hardware Solutions
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {showAllOption && selectedCategoryId && onSelectCategory && (
              <button
                type="button"
                onClick={() => onSelectCategory(null)}
                className="text-xs font-bold text-white bg-[#FF850D] hover:bg-[#E67300] px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <span>✕ Clear Filter</span>
              </button>
            )}
            <a
              href="/products"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-200 transition-colors"
            >
              <Tag className="w-3.5 h-3.5 text-[#FF850D]" />
              <span>Special Offer Prices Inside Every Department</span>
            </a>
          </div>
        </div>

        {/* 4. Cream-White Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
          {list.map((cat) => {
            const isSelected =
              selectedCategoryId === cat.id ||
              selectedCategoryId === cat.slug;

            const highlights =
              CATEGORY_HIGHLIGHTS[cat.id] ||
              cat.description?.split(',').map((s) => s.trim()) ||
              [];

            const offerPrice =
              cat.formattedFromPrice ||
              (cat.effectiveFromPrice ? `From KSh ${cat.effectiveFromPrice.toLocaleString('en-KE')}` : null) ||
              CATEGORY_OFFER_PRICES[cat.id] ||
              'Special Offer';

            return (
              <a
                key={cat.id}
                href={`/products?category=${cat.id}`}
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    onSelectCategory(isSelected ? null : cat.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`Category: ${cat.name}. ${offerPrice}. ${cat.description || ''}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (onSelectCategory) {
                      onSelectCategory(isSelected ? null : cat.id);
                    } else {
                      window.location.href = `/products?category=${cat.id}`;
                    }
                  }
                }}
                className={`group relative flex flex-col justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl cursor-pointer select-none min-h-[160px] sm:min-h-[172px] transform-gpu will-change-transform transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF850D] ${
                  isSelected
                    ? 'bg-[#FFF8EE] border-2 border-[#FF850D] -translate-y-1 z-20'
                    : 'bg-[#FFFBF4] hover:bg-[#FFFDF9] border border-[#F2E9DC] z-10 hover:z-30 hover:scale-[1.03] hover:-translate-y-1.5 hover:border-[#FF850D]'
                }`}
              >
                {/* Top Glowing Accent Bar */}
                <div
                  className={`absolute top-0 left-3 right-3 h-1 rounded-b-full transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#FF850D] via-amber-400 to-[#FF850D]'
                      : 'bg-gradient-to-r from-[#FF850D]/40 via-amber-400/40 to-[#FF850D]/40 group-hover:from-[#FF850D] group-hover:via-amber-400 group-hover:to-[#FF850D]'
                  }`}
                />

                {/* Card Top: Icon & Live Offer Price Pill */}
                <div className="flex items-start justify-between gap-1.5 mb-2">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-300 ease-out ${
                      isSelected
                        ? 'bg-[#073253] text-[#FF850D] border-[#073253] scale-105'
                        : 'bg-[#F4EEE4] text-[#073253] border-[#E8DFD1] group-hover:scale-105 group-hover:bg-[#073253] group-hover:text-[#FF850D] group-hover:border-[#073253]'
                    }`}
                  >
                    <PlumbingCategoryIcon name={cat.name} iconName={cat.iconName} />
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-black tracking-tight transition-colors ${
                      isSelected
                        ? 'bg-[#FF850D] text-white'
                        : 'bg-[#FFF0DC] text-[#C85A00] border border-[#FF850D]/30 group-hover:bg-[#FF850D] group-hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Active' : offerPrice}
                  </span>
                </div>

                {/* Card Body: Name and Description */}
                <div className="flex-1 flex flex-col justify-start">
                  <h3
                    className={`text-xs sm:text-[13px] font-black leading-snug tracking-tight transition-colors duration-200 ${
                      isSelected
                        ? 'text-[#FF850D]'
                        : 'text-[#073253] group-hover:text-[#FF850D]'
                    }`}
                  >
                    {cat.name}
                  </h3>

                  <p className="text-[10.5px] sm:text-[11px] leading-relaxed mt-0.5 text-[#475569] font-medium">
                    {cat.description}
                  </p>

                  {/* Item Highlights Strip */}
                  {highlights.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-[#EFE7DA] group-hover:border-[#FF850D]/30 transition-colors">
                      <div className="flex flex-wrap gap-1">
                        {highlights.slice(0, 3).map((item) => (
                          <span
                            key={item}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F5EFE6] text-[#334155] group-hover:bg-[#FFF0DC] group-hover:text-[#C85A00] transition-colors duration-200"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Shop Offer CTA */}
                <div className="mt-2 pt-2 border-t border-[#EFE7DA] flex items-center justify-between text-[11px] font-extrabold">
                  <span
                    className={`transition-colors duration-200 ${
                      isSelected
                        ? 'text-[#FF850D]'
                        : 'text-[#073253] group-hover:text-[#FF850D]'
                    }`}
                  >
                    {isSelected ? 'Active Filter' : 'Shop Offers'}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#FF850D] text-white'
                        : 'bg-[#073253]/10 text-[#073253] group-hover:bg-[#FF850D] group-hover:text-white group-hover:translate-x-0.5'
                    }`}
                  >
                    {isSelected ? '✓' : '→'}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
