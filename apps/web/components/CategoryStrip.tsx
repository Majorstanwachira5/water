'use client';

import React from 'react';
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

// Rich item highlights for the pop-out animation effect
const CATEGORY_HIGHLIGHTS: Record<string, string[]> = {
  cat_sanitary_ware: ['Ceramic Urinals', 'Wash Basins', 'Flush Kits', 'Grab Bars'],
  cat_taps_faucets: ['Spring Mixers', 'Basin Taps', 'Bidet Shattafs', 'Goosenecks'],
  cat_shower_systems: ['Instant Heaters', 'Shower Columns', 'Rain Heads', 'Mixer Valves'],
  cat_kitchen_sinks: ['Nano Black', 'Double Bowl', 'Single Bowl', 'Drainer Kits'],
  cat_plumbing_pipes: ['Magic Bends', 'Bottle Traps', 'PPR Pipes', 'Welding Kits'],
  cat_hardware_items: ['Mortise Locks', '6pc Bath Sets', 'Towel Shelves', 'Curtain Rods'],
};

function PlumbingCategoryIcon({ name, iconName }: { name: string; iconName?: string }) {
  const key = `${name} ${iconName || ''}`.toLowerCase();

  // 1. Sanitary Ware & Ceramics
  if (key.includes('sanitary') || key.includes('ceramic') || key.includes('urinal') || key.includes('toilet') || key.includes('basin')) {
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 19L19 5C20.5 3.5 23 3.5 24 4.5C25 5.5 25 8 23.5 9.5L9.5 23.5" />
        <ellipse cx="7.2" cy="21.2" rx="3.2" ry="2" transform="rotate(-45 7.2 21.2)" />
        <path d="M16 8L20 12" />
      </svg>
    );
  }

  // 6. Hardware & Locks
  return (
    <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
  // Use passed categories or standard published store categories
  const rawList = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  
  // Ensure we display published categories ordered by display order
  const list = rawList
    .filter((c) => c.isPublished !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <section 
      aria-label="Product Categories Navigation" 
      className="bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] py-6 sm:py-8 border-b border-[#DFE5EB] shadow-xs relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header with Clear Visual Context */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4 sm:mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF850D] animate-pulse" />
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#FF850D]">
                Department Catalogue
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#073253] tracking-tight mt-0.5">
              Explore Plumbing &amp; Hardware Solutions
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {showAllOption && selectedCategoryId && onSelectCategory && (
              <button
                type="button"
                onClick={() => onSelectCategory(null)}
                className="text-xs font-bold text-[#FF850D] hover:text-[#073253] bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <span>✕ Clear Category Filter</span>
              </button>
            )}
            <p className="text-xs text-gray-500 hidden md:block">
              Hover over any department to preview items, or click to filter live inventory
            </p>
          </div>
        </div>

        {/* Responsive Balanced Grid: 2 cols on mobile, 3 on tablet, 6 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-4.5">
          {list.map((cat) => {
            const isSelected =
              selectedCategoryId === cat.id ||
              selectedCategoryId === cat.slug;

            const highlights =
              CATEGORY_HIGHLIGHTS[cat.id] ||
              cat.description?.split(',').map((s) => s.trim()) ||
              [];

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
                aria-label={`Category: ${cat.name}. ${cat.description || ''}`}
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
                className={`group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer select-none min-h-[170px] sm:min-h-[190px] transform-gpu will-change-transform transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF850D] focus-visible:ring-offset-2 ${
                  isSelected
                    ? 'bg-[#FFF8F2] border-2 border-[#FF850D] shadow-lg -translate-y-1.5 ring-2 ring-[#FF850D]/25 z-20'
                    : 'bg-white border border-[#DFE5EB] shadow-xs z-10 hover:z-30 hover:scale-[1.04] sm:hover:scale-[1.06] hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#073253]/20 hover:border-[#FF850D] hover:bg-white hover:ring-4 hover:ring-[#FF850D]/15'
                }`}
              >
                {/* Top Accent Highlight (Pulses / Lights up in Brand Orange on Hover & Active) */}
                <div
                  className={`absolute top-0 left-3 right-3 h-1.5 rounded-b-full transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#FF850D] via-[#FF982A] to-[#FF850D] shadow-xs'
                      : 'bg-transparent group-hover:bg-gradient-to-r group-hover:from-[#FF850D] group-hover:via-[#FF982A] group-hover:to-[#FF850D] group-hover:shadow-xs'
                  }`}
                />

                {/* Card Top: Icon & Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-2 sm:mb-2.5">
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 border transition-all duration-300 ease-out ${
                      isSelected
                        ? 'bg-[#073253] text-[#FF850D] border-[#073253] shadow-md scale-105'
                        : 'bg-[#EEF2F6] text-[#073253] border-[#DFE5EB] group-hover:scale-110 group-hover:rotate-2 group-hover:bg-[#073253] group-hover:text-[#FF850D] group-hover:border-[#073253] group-hover:shadow-md'
                    }`}
                  >
                    <PlumbingCategoryIcon name={cat.name} iconName={cat.iconName} />
                  </div>

                  {isSelected ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF850D] text-white shadow-xs">
                      Active
                    </span>
                  ) : (
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-100 text-[#FF850D]">
                      Explore
                    </span>
                  )}
                </div>

                {/* Card Body: Name and Description (Full Text, No Truncate) */}
                <div className="flex-1 flex flex-col justify-start">
                  <h3
                    className={`text-xs sm:text-[13.5px] md:text-sm font-black leading-snug tracking-tight transition-colors duration-200 ${
                      isSelected
                        ? 'text-[#FF850D]'
                        : 'text-[#073253] group-hover:text-[#FF850D]'
                    }`}
                  >
                    {cat.name}
                  </h3>

                  <p
                    className={`text-[11px] sm:text-xs leading-relaxed mt-1 transition-colors duration-200 ${
                      isSelected
                        ? 'text-[#073253]/85 font-medium'
                        : 'text-[#5A6E82] group-hover:text-[#172B3A]'
                    }`}
                  >
                    {cat.description}
                  </p>

                  {/* Pop-Out Highlights Strip (Reveals specific items when pausing over category) */}
                  {highlights.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 group-hover:border-[#FF850D]/25 transition-colors">
                      <div className="flex flex-wrap gap-1">
                        {highlights.slice(0, 3).map((item) => (
                          <span
                            key={item}
                            className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-gray-100/90 text-gray-600 group-hover:bg-[#FFF3E6] group-hover:text-[#D96B00] group-hover:border group-hover:border-[#FF850D]/25 transition-all duration-200"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Interactive CTA Button */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold">
                  <span
                    className={`transition-colors duration-200 ${
                      isSelected
                        ? 'text-[#FF850D] font-extrabold'
                        : 'text-gray-400 group-hover:text-[#073253] group-hover:font-extrabold'
                    }`}
                  >
                    {isSelected ? 'Active Filter' : 'Browse Items'}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#FF850D] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-[#FF850D] group-hover:text-white group-hover:translate-x-1 group-hover:shadow-xs'
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
