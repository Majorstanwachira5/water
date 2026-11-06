'use client';

import React from 'react';
import { Category } from '@michaforge/shared-contracts';

interface CategoryStripProps {
  categories?: Category[];
  selectedCategoryId?: string | null;
  onSelectCategory?: (id: string | null) => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_sanitary_ware',
    name: 'Sanitary Ware',
    slug: 'sanitary-ware',
    description: 'Urinals, Basins, Cisterns',
    iconName: 'sanitary',
    displayOrder: 1,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat_taps_faucets',
    name: 'Taps & Mixers',
    slug: 'taps-faucets',
    description: 'Kitchen, Basin & Shattafs',
    iconName: 'tap',
    displayOrder: 2,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat_shower_systems',
    name: 'Showers & Heating',
    slug: 'shower-systems',
    description: 'Instant Showers & Columns',
    iconName: 'shower',
    displayOrder: 3,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat_kitchen_sinks',
    name: 'Kitchen Sinks',
    slug: 'kitchen-sinks',
    description: 'Nano Black & Stainless Sinks',
    iconName: 'sink',
    displayOrder: 4,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat_plumbing_pipes',
    name: 'Pipes & Drainage',
    slug: 'plumbing-pipes',
    description: 'Magic Bend, Traps & PPR',
    iconName: 'pipe',
    displayOrder: 5,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat_hardware_items',
    name: 'Hardware & Locks',
    slug: 'hardware-items',
    description: 'Security Locks & 6pc Sets',
    iconName: 'hardware',
    displayOrder: 6,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
];

function PlumbingCategoryIcon({ name, iconName }: { name: string; iconName?: string }) {
  const key = `${name} ${iconName || ''}`.toLowerCase();

  // 1. Sanitary Ware & Ceramics (urinal / toilet / basin ceramic fixture)
  if (key.includes('sanitary') || key.includes('ceramic') || key.includes('urinal')) {
    return (
      <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 6H21V13C21 17 18 20 14 20C10 20 7 17 7 13V6Z" />
        <path d="M11 20V24H17V20" />
        <circle cx="14" cy="14" r="1.5" />
        <path d="M14 6V9" />
      </svg>
    );
  }

  // 2. Taps, Mixers & Shattafs
  if (key.includes('tap') || key.includes('faucet') || key.includes('mixer') || key.includes('shattaf')) {
    return (
      <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  if (key.includes('sink') || key.includes('basin')) {
    return (
      <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="8" width="20" height="15" rx="2" />
        <line x1="14" y1="8" x2="14" y2="23" />
        <circle cx="9" cy="15" r="1.5" />
        <circle cx="19" cy="15" r="1.5" />
        <path d="M14 8V5C14 4 15 3 16 3H17" />
      </svg>
    );
  }

  // 5. Pipes & Drainage
  if (key.includes('pipe') || key.includes('drainage') || key.includes('trap')) {
    return (
      <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19L19 5C20.5 3.5 23 3.5 24 4.5C25 5.5 25 8 23.5 9.5L9.5 23.5" />
        <ellipse cx="7.2" cy="21.2" rx="3.2" ry="2" transform="rotate(-45 7.2 21.2)" />
        <path d="M16 8L20 12" />
      </svg>
    );
  }

  // 6. Hardware & Locks
  return (
    <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
}: CategoryStripProps) {
  const list = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <section className="bg-white py-4 border-b border-[#DFE5EB] shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[#DFE5EB]">
          {list.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;

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
                className={`flex items-center space-x-3 px-3.5 py-2.5 transition-all group ${
                  isSelected
                    ? 'bg-[#FF850D]/10'
                    : 'hover:bg-[#F5F7FA]'
                }`}
              >
                {/* Circular Icon Badge matching flyer */}
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${
                    isSelected
                      ? 'bg-[#073253] text-[#FF850D] border-[#073253]'
                      : 'bg-[#EEF2F6] text-[#073253] border-[#DFE5EB] group-hover:bg-[#073253] group-hover:text-white group-hover:border-[#073253]'
                  }`}
                >
                  <PlumbingCategoryIcon name={cat.name} iconName={cat.iconName} />
                </div>

                {/* Category Text */}
                <div className="min-w-0 text-left">
                  <span className="block text-xs sm:text-[13px] font-extrabold text-[#073253] group-hover:text-[#FF850D] transition-colors truncate">
                    {cat.name}
                  </span>
                  <span className="block text-[11px] text-[#667585] truncate">
                    {cat.description}
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
