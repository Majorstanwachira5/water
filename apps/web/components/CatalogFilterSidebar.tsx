'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  SlidersHorizontal,
  LayoutGrid,
  Sparkles,
  Tag,
  RotateCcw,
  Check,
  MessageCircle,
} from 'lucide-react';
import { Category } from '@michaforge/shared-contracts';

export interface SubCategoryFilter {
  slug: string;
  label: string;
  keywords: string[];
}

export const CATEGORY_SUBFILTERS: Record<string, SubCategoryFilter[]> = {
  cat_sanitary_ware: [
    { slug: 'ceramic-urinals', label: 'Ceramic Urinals', keywords: ['urinal'] },
    { slug: 'cisterns-flush', label: 'Cisterns & Flush Kits', keywords: ['cistern', 'flush'] },
    { slug: 'vanity-basins-seats', label: 'Vanity Basins & Seats', keywords: ['vanity', 'basin', 'seat'] },
    { slug: 'grab-bars', label: 'Safety Grab Bars', keywords: ['grab bar', 'accessible'] },
  ],
  cat_taps_faucets: [
    { slug: 'kitchen-mixers', label: 'Kitchen Sink Mixers', keywords: ['kitchen'] },
    { slug: 'spring-pull-down', label: 'Spring Pull-Down Taps', keywords: ['spring', 'pull-down', 'pull-out'] },
    { slug: 'shattaf-bidet', label: 'Shattaf & Bidet Sprays', keywords: ['shattaf', 'bidet', 'trigger'] },
    { slug: 'wall-mount-taps', label: 'Wall-Mount Taps', keywords: ['wall-mount', 'wall-mounted', 'bibcock'] },
    { slug: 'basin-taps', label: 'Basin Taps & Suites', keywords: ['basin', 'pillar', 'suite'] },
  ],
  cat_shower_systems: [
    { slug: 'instant-heaters', label: 'Instant Water Heaters', keywords: ['instant', 'heater'] },
    { slug: 'rain-shower-heads', label: 'Rain Shower Heads', keywords: ['rain shower head', 'overhead', 'swivel wall arm', 'dual-flow'] },
    { slug: 'mixer-valves', label: 'Concealed Mixer Valves', keywords: ['concealed', 'mixer valve', 'thermostatic'] },
    { slug: 'shower-columns', label: 'Full Shower Columns', keywords: ['exposed', '8807', 'shower set'] },
  ],
  cat_kitchen_sinks: [
    { slug: 'double-bowl', label: 'Double Bowl Sinks', keywords: ['double bowl'] },
    { slug: 'single-bowl', label: 'Single Bowl Sinks', keywords: ['single bowl'] },
    { slug: 'black-nano-quartz', label: 'Black Nano & Quartz', keywords: ['black nano', 'granite', 'quartz'] },
    { slug: 'sus304-handmade', label: 'SUS304 Handmade Sinks', keywords: ['sus304', 'handmade', 'handcrafted'] },
  ],
  cat_plumbing_pipes: [
    { slug: 'magic-bends', label: 'Toilet Magic Bends', keywords: ['magic bend', 'toilet waste'] },
    { slug: 'bottle-traps', label: 'Sink Bottle Traps', keywords: ['bottle trap', 'strainer'] },
    { slug: 'flexible-hoses', label: 'Flexible Braided Hoses', keywords: ['hose', 'braided'] },
    { slug: 'ppr-welding', label: 'PPR Welding Kits', keywords: ['ppr', 'welding', 'fusion'] },
  ],
  cat_hardware_items: [
    { slug: 'mortise-locks', label: 'Mortise Door Locks', keywords: ['mortise', 'lock', 'deadbolt'] },
    { slug: 'bathroom-sets', label: 'Bathroom Accessory Sets', keywords: ['6-piece', 'accessories', 'shelving'] },
    { slug: 'towel-shelves', label: 'Towel Racks & Shelves', keywords: ['towel'] },
    { slug: 'water-filters', label: 'Water Filters & Purifiers', keywords: ['water filter', 'purification', 'cartridge', 'abt-pure', 'so-pure'] },
    { slug: 'hinges-rods', label: 'Hinges, Rods & Holders', keywords: ['hinges', 'curtain', 'soap dish'] },
  ],
};

export function getSubFiltersForCategory(cat: Category): SubCategoryFilter[] {
  if (CATEGORY_SUBFILTERS[cat.id]) {
    return CATEGORY_SUBFILTERS[cat.id];
  }
  if (cat.description) {
    return cat.description
      .split(/[,&]/)
      .map((part) => part.trim())
      .filter((part) => part.length > 2)
      .slice(0, 5)
      .map((label) => ({
        slug: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        label,
        keywords: [label.toLowerCase()],
      }));
  }
  return [];
}

function SidebarCategoryIcon({ name, iconName }: { name: string; iconName?: string }) {
  const key = `${name} ${iconName || ''}`.toLowerCase();

  if (key.includes('sanitary') || key.includes('ceramic') || key.includes('urinal') || key.includes('toilet')) {
    return (
      <svg className="w-4 h-4" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 6H21V13C21 17 18 20 14 20C10 20 7 17 7 13V6Z" />
        <path d="M11 20V24H17V20" />
        <circle cx="14" cy="14" r="1.5" />
      </svg>
    );
  }

  if (key.includes('tap') || key.includes('faucet') || key.includes('mixer') || key.includes('shattaf')) {
    return (
      <svg className="w-4 h-4" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 6H18" />
        <path d="M14 6V10" />
        <path d="M6 12H18C20.5 12 22 13.5 22 16V18H18V16C18 15.2 17.5 15 16.5 15H6V12Z" />
        <path d="M6 10V17" />
      </svg>
    );
  }

  if (key.includes('shower') || key.includes('heater') || key.includes('heating')) {
    return (
      <svg className="w-4 h-4" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 7H14C17 7 19 9 19 12V14" />
        <path d="M13 14H25L23 18H15L13 14Z" />
        <line x1="16" y1="21" x2="16" y2="24" />
        <line x1="20" y1="21" x2="20" y2="24" />
      </svg>
    );
  }

  if (key.includes('sink')) {
    return (
      <svg className="w-4 h-4" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="8" width="20" height="15" rx="2" />
        <line x1="14" y1="8" x2="14" y2="23" />
        <path d="M14 8V5C14 4 15 3 16 3H17" />
      </svg>
    );
  }

  if (key.includes('pipe') || key.includes('drainage') || key.includes('trap')) {
    return (
      <svg className="w-4 h-4" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 19L19 5C20.5 3.5 23 3.5 24 4.5C25 5.5 25 8 23.5 9.5L9.5 23.5" />
        <path d="M16 8L20 12" />
      </svg>
    );
  }

  return (
    <svg className="w-4 h-4" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18.5 5.5C17 7 17 9.5 18.5 11L10.5 19C9 17.5 6.5 17.5 5 19L8.5 21.5L9.5 23.5C11 22 11 19.5 9.5 18L17.5 10C19 11.5 21.5 11.5 23 10L19.5 7.5L18.5 5.5Z" />
    </svg>
  );
}

export interface CatalogFilterSidebarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  selectedSubSlug: string | null;
  minPrice: string;
  maxPrice: string;
  onlyFeatured: boolean;
  onlyPriced: boolean;
  categoryCounts: Record<string, number>;
  totalCatalogCount: number;
  whatsappNumber?: string;
  onSelectCategory: (categoryId: string | null, subSlug?: string | null) => void;
  onApplyPriceRange: (min: string, max: string) => void;
  onToggleFeatured: (val: boolean) => void;
  onTogglePriced: (val: boolean) => void;
  onResetAll: () => void;
}

const PRICE_PRESETS = [
  { label: 'Under KSh 1,500', min: '', max: '1500' },
  { label: 'KSh 1,500 – 2,850', min: '1500', max: '2850' },
  { label: 'Above KSh 2,850', min: '2851', max: '' },
];

export default function CatalogFilterSidebar({
  categories,
  selectedCategoryId,
  selectedSubSlug,
  minPrice,
  maxPrice,
  onlyFeatured,
  onlyPriced,
  categoryCounts,
  totalCatalogCount,
  whatsappNumber = '+254714843208',
  onSelectCategory,
  onApplyPriceRange,
  onToggleFeatured,
  onTogglePriced,
  onResetAll,
}: CatalogFilterSidebarProps) {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Sync price inputs when external state resets or updates
  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  // Automatically expand the active category so its sub-items are immediately accessible
  useEffect(() => {
    if (selectedCategoryId) {
      const matched = categories.find(
        (c) => c.id === selectedCategoryId || c.slug === selectedCategoryId
      );
      if (matched) {
        setExpandedIds((prev) => ({ ...prev, [matched.id]: true }));
      }
    }
  }, [selectedCategoryId, categories]);

  const sortedCategories = [...categories]
    .filter((c) => c.isPublished !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const hasActiveFilters = Boolean(
    selectedCategoryId || selectedSubSlug || minPrice || maxPrice || onlyFeatured || onlyPriced
  );

  const toggleExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const allExpanded =
    sortedCategories.length > 0 && sortedCategories.every((c) => expandedIds[c.id]);

  const handleToggleExpandAll = () => {
    if (allExpanded) {
      setExpandedIds({});
    } else {
      const next: Record<string, boolean> = {};
      sortedCategories.forEach((c) => {
        next[c.id] = true;
      });
      setExpandedIds(next);
    }
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyPriceRange(localMin.trim(), localMax.trim());
  };

  const cleanWa = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <aside
      aria-label="Catalogue Categories and Search Filters"
      className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden select-none"
    >
      {/* Top Filter Bar Header */}
      <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-[#FF850D]" />
          <h2 className="text-[13px] font-black text-[#073253] tracking-tight">
            Search Filter
          </h2>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#FF850D] hover:text-[#073253] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* SECTION 1: Department Categories (Vertical Tree with Dropdowns) */}
      <div className="p-3.5 border-b border-[#EDF2F7]">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
            Category
          </span>
          <button
            type="button"
            onClick={handleToggleExpandAll}
            className="text-[10.5px] font-bold text-[#073253]/75 hover:text-[#FF850D] transition-colors"
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        <nav aria-label="Product Departments" className="space-y-1">
          {/* All Products Option */}
          <button
            type="button"
            onClick={() => onSelectCategory(null, null)}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all duration-150 ${
              !selectedCategoryId
                ? 'bg-[#FFF4EB] text-[#FF850D] font-extrabold border border-[#FF850D]/30'
                : 'text-[#1E293B] hover:bg-[#F8FAFC] font-semibold border border-transparent'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  !selectedCategoryId
                    ? 'bg-[#FF850D] text-white'
                    : 'bg-[#EEF2F6] text-[#073253]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </span>
              <span className="text-[12.5px] leading-snug truncate">
                All Products
              </span>
            </div>
            {totalCatalogCount > 0 && (
              <span
                className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  !selectedCategoryId
                    ? 'bg-[#FF850D]/15 text-[#FF850D]'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {totalCatalogCount}
              </span>
            )}
          </button>

          {/* Individual Categories Going Down with Dropdowns */}
          {sortedCategories.map((cat) => {
            const isSelected =
              selectedCategoryId === cat.id || selectedCategoryId === cat.slug;
            const subFilters = getSubFiltersForCategory(cat);
            const isExpanded = Boolean(expandedIds[cat.id]);
            const count = categoryCounts[cat.id] ?? 0;

            return (
              <div
                key={cat.id}
                className={`rounded-xl transition-colors ${
                  isSelected ? 'bg-[#FFF9F5]/70' : ''
                }`}
              >
                {/* Category Header Row */}
                <div
                  className={`group flex items-center justify-between rounded-xl transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#FFF4EB] text-[#FF850D] border border-[#FF850D]/30'
                      : 'text-[#1E293B] hover:bg-[#F8FAFC] border border-transparent'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat.id, null);
                      setExpandedIds((prev) => ({ ...prev, [cat.id]: true }));
                    }}
                    className="flex-1 flex items-center space-x-2.5 px-2.5 py-2 text-left min-w-0"
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#073253] text-[#FF850D]'
                          : 'bg-[#EEF2F6] text-[#073253] group-hover:bg-[#073253] group-hover:text-[#FF850D]'
                      }`}
                    >
                      <SidebarCategoryIcon name={cat.name} iconName={cat.iconName} />
                    </span>
                    <span
                      className={`text-[12.5px] leading-snug ${
                        isSelected ? 'font-extrabold text-[#FF850D]' : 'font-semibold text-[#073253] group-hover:text-[#FF850D]'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>

                  <div className="flex items-center pr-1.5 space-x-1 flex-shrink-0">
                    {count > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-[#FF850D]/15 text-[#FF850D]'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {count}
                      </span>
                    )}

                    {subFilters.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(cat.id, e)}
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${cat.name} sub-categories`}
                        className={`p-1 rounded-lg transition-colors ${
                          isSelected
                            ? 'text-[#FF850D] hover:bg-[#FF850D]/15'
                            : 'text-slate-400 hover:text-[#073253] hover:bg-slate-200/60'
                        }`}
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable Sub-Category Dropdown Menu */}
                {subFilters.length > 0 && isExpanded && (
                  <div className="mt-1 ml-5 pl-2.5 border-l-2 border-[#E2E8F0] space-y-0.5 py-1">
                    <button
                      type="button"
                      onClick={() => onSelectCategory(cat.id, null)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11.5px] text-left transition-colors ${
                        isSelected && !selectedSubSlug
                          ? 'bg-[#FF850D]/15 text-[#FF850D] font-extrabold'
                          : 'text-[#475569] hover:text-[#073253] hover:bg-slate-100/80 font-medium'
                      }`}
                    >
                      <span>All in {cat.name.split(',')[0]}</span>
                      {isSelected && !selectedSubSlug && (
                        <Check className="w-3 h-3 text-[#FF850D] flex-shrink-0" />
                      )}
                    </button>

                    {subFilters.map((sub) => {
                      const isSubActive = isSelected && selectedSubSlug === sub.slug;
                      return (
                        <button
                          key={sub.slug}
                          type="button"
                          onClick={() => onSelectCategory(cat.id, isSubActive ? null : sub.slug)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11.5px] text-left transition-colors ${
                            isSubActive
                              ? 'bg-[#FF850D] text-white font-bold'
                              : 'text-[#475569] hover:text-[#FF850D] hover:bg-[#FFF4EB]/70 font-medium'
                          }`}
                        >
                          <span className="truncate">{sub.label}</span>
                          {isSubActive && (
                            <Check className="w-3 h-3 text-white flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* SECTION 2: Price Range Filter (Min — Max + Apply) */}
      <div className="p-3.5 border-b border-[#EDF2F7] space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
            Price (KSh)
          </span>
          {(minPrice || maxPrice) && (
            <button
              type="button"
              onClick={() => {
                setLocalMin('');
                setLocalMax('');
                onApplyPriceRange('', '');
              }}
              className="text-[10.5px] font-bold text-[#FF850D] hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        <form onSubmit={handlePriceSubmit} className="flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Min"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className="w-full min-w-0 px-2.5 py-1.5 text-xs text-[#073253] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF850D] focus:border-[#FF850D] placeholder:text-slate-400"
          />
          <span className="text-slate-400 text-xs font-bold flex-shrink-0">—</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Max"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className="w-full min-w-0 px-2.5 py-1.5 text-xs text-[#073253] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF850D] focus:border-[#FF850D] placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="bg-[#FF850D] hover:bg-[#E67300] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            Apply
          </button>
        </form>

        {/* Quick Price Range Chips */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {PRICE_PRESETS.map((preset) => {
            const isPresetActive =
              minPrice === preset.min && maxPrice === preset.max && (preset.min !== '' || preset.max !== '');
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  if (isPresetActive) {
                    setLocalMin('');
                    setLocalMax('');
                    onApplyPriceRange('', '');
                  } else {
                    setLocalMin(preset.min);
                    setLocalMax(preset.max);
                    onApplyPriceRange(preset.min, preset.max);
                  }
                }}
                className={`text-[10.5px] px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                  isPresetActive
                    ? 'bg-[#FFF4EB] border-[#FF850D] text-[#FF850D] font-bold'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:border-[#FF850D]/50 hover:text-[#073253]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Quick Suggestions / Filter Toggles */}
      <div className="p-3.5 border-b border-[#EDF2F7] space-y-1.5">
        <span className="block px-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#64748B] mb-1.5">
          Suggestions
        </span>

        <button
          type="button"
          onClick={() => onToggleFeatured(!onlyFeatured)}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
            onlyFeatured
              ? 'bg-[#FFF4EB] text-[#FF850D] font-bold border border-[#FF850D]/30'
              : 'text-[#334155] hover:bg-[#F8FAFC] font-medium border border-transparent'
          }`}
        >
          <span className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FF850D]" />
            <span>Featured Best Sellers</span>
          </span>
          <span
            className={`w-4 h-4 rounded flex items-center justify-center border ${
              onlyFeatured
                ? 'bg-[#FF850D] border-[#FF850D] text-white'
                : 'border-slate-300 bg-white'
            }`}
          >
            {onlyFeatured && <Check className="w-3 h-3" />}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTogglePriced(!onlyPriced)}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
            onlyPriced
              ? 'bg-[#FFF4EB] text-[#FF850D] font-bold border border-[#FF850D]/30'
              : 'text-[#334155] hover:bg-[#F8FAFC] font-medium border border-transparent'
          }`}
        >
          <span className="flex items-center space-x-2">
            <Tag className="w-3.5 h-3.5 text-[#073253]" />
            <span>Listed Store Prices</span>
          </span>
          <span
            className={`w-4 h-4 rounded flex items-center justify-center border ${
              onlyPriced
                ? 'bg-[#FF850D] border-[#FF850D] text-white'
                : 'border-slate-300 bg-white'
            }`}
          >
            {onlyPriced && <Check className="w-3 h-3" />}
          </span>
        </button>
      </div>

      {/* SECTION 4: Contractor Wholesale BOQ Help */}
      <div className="p-3.5 bg-gradient-to-br from-[#073253] to-[#0B436F] text-white">
        <p className="text-[11px] font-extrabold text-[#FF850D] uppercase tracking-wider">
          Bulk &amp; BOQ Supply
        </p>
        <p className="text-[11.5px] text-slate-200 mt-0.5 leading-snug">
          Need contractor rates or an item not listed? Chat directly with our counter.
        </p>
        <a
          href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
            'Hello Michaforge Enterprises, I would like assistance with a plumbing & hardware quotation.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 w-full inline-flex items-center justify-center space-x-1.5 bg-[#0BAA58] hover:bg-[#09934B] text-white text-[11.5px] font-bold py-2 px-3 rounded-xl transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-white" />
          <span>Request BOQ Quote</span>
        </a>
      </div>
    </aside>
  );
}
