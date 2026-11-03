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
    id: 'cat_pvc_pipes',
    name: 'PVC Pipes',
    slug: 'pvc-pipes',
    description: 'Durable & Reliable',
    iconName: 'pipe',
    displayOrder: 1,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat_pipe_fittings',
    name: 'Pipe Fittings',
    slug: 'pipe-fittings',
    description: 'Various Sizes & Types',
    iconName: 'fittings',
    displayOrder: 2,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat_taps_faucets',
    name: 'Taps & Faucets',
    slug: 'taps-faucets',
    description: 'Quality & Stylish',
    iconName: 'tap',
    displayOrder: 3,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat_valves',
    name: 'Valves',
    slug: 'valves',
    description: 'Control Your Flow',
    iconName: 'valve',
    displayOrder: 4,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat_water_tanks',
    name: 'Water Tanks',
    slug: 'water-tanks',
    description: 'Storage Solutions',
    iconName: 'tank',
    displayOrder: 5,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat_hardware_items',
    name: 'Hardware Items',
    slug: 'hardware-items',
    description: 'Building Essentials',
    iconName: 'hardware',
    displayOrder: 6,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
];

function PlumbingCategoryIcon({ name, iconName }: { name: string; iconName?: string }) {
  const key = `${name} ${iconName || ''}`.toLowerCase();

  // 1. PVC Pipes (diagonal cylinder pipe with socket collar)
  if (key.includes('pipe') && !key.includes('fitting')) {
    return (
      <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19L19 5C20.5 3.5 23 3.5 24 4.5C25 5.5 25 8 23.5 9.5L9.5 23.5" />
        <ellipse cx="7.2" cy="21.2" rx="3.2" ry="2" transform="rotate(-45 7.2 21.2)" />
        <path d="M16 8L20 12" />
      </svg>
    );
  }

  // 2. Pipe Fittings (90-degree elbow pipe joint with collars)
  if (key.includes('fitting')) {
    return (
      <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="14" y="4" width="9" height="4" rx="1" />
        <rect x="5" y="19" width="8" height="4" rx="1" />
        <path d="M15 8H19C19 14 15 15 13 19H7C7 11 11 8 15 8Z" />
      </svg>
    );
  }

  // 3. Taps & Faucets (classic water tap with T-handle & droplet)
  if (key.includes('tap') || key.includes('faucet')) {
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

  // 4. Valves (inline flanged valve with top handwheel)
  if (key.includes('valve')) {
    return (
      <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="14" cy="6" rx="5" ry="2" />
        <path d="M14 8V12" />
        <rect x="4" y="13" width="3" height="8" rx="1" />
        <rect x="21" y="13" width="3" height="8" rx="1" />
        <path d="M7 15H21V19H7V15Z" />
        <circle cx="14" cy="17" r="3" />
      </svg>
    );
  }

  // 5. Water Tanks (ribbed cylindrical tank with top lid)
  if (key.includes('tank')) {
    return (
      <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="11" y="3" width="6" height="2.5" rx="1" />
        <rect x="7" y="6" width="14" height="18" rx="3" />
        <path d="M7 11H21" />
        <path d="M7 16H21" />
        <path d="M7 20H21" />
      </svg>
    );
  }

  // 6. Hardware Items (crossed spanner & screwdriver matching flyer)
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
