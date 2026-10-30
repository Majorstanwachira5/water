'use client';

import React from 'react';
import {
  Pipette as PipeIcon,
  GitBranch,
  Droplet,
  Sliders,
  Database as TankIcon,
  Wrench,
} from 'lucide-react';
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

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('pipe') && !lower.includes('fitting')) return PipeIcon;
  if (lower.includes('fitting')) return GitBranch;
  if (lower.includes('tap') || lower.includes('faucet')) return Droplet;
  if (lower.includes('valve')) return Sliders;
  if (lower.includes('tank')) return TankIcon;
  return Wrench;
}

export default function CategoryStrip({
  categories = DEFAULT_CATEGORIES,
  selectedCategoryId = null,
  onSelectCategory,
}: CategoryStripProps) {
  return (
    <section className="bg-[#F5F7FA] py-8 border-y border-[#DFE5EB]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Horizontal scroll on small devices */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
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
                className={`flex-1 min-w-[150px] flex flex-col items-center text-center p-3 rounded-xl transition-all group ${
                  isSelected
                    ? 'bg-white shadow-md border-2 border-[#FF850D]'
                    : 'hover:bg-white hover:shadow-sm'
                }`}
              >
                {/* Circular Icon Container */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-2.5 transition-colors ${
                    isSelected
                      ? 'bg-[#073253] text-[#FF850D]'
                      : 'bg-[#073253]/10 text-[#073253] group-hover:bg-[#073253] group-hover:text-white'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>

                {/* Category Name */}
                <span className="text-sm font-bold text-[#172B3A] group-hover:text-[#FF850D] transition-colors line-clamp-1">
                  {cat.name}
                </span>

                {/* Category Tagline */}
                <span className="text-xs text-[#667585] mt-0.5 line-clamp-1">
                  {cat.description}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
