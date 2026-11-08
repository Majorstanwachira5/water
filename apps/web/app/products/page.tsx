'use client';

import React, { useEffect, useState, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CatalogFilterSidebar, {
  getSubFiltersForCategory,
} from '../../components/CatalogFilterSidebar';
import ProductDetailModal from '../../components/ProductDetailModal';
import ProductCard from '../../components/ProductCard';
import {
  Search,
  RefreshCw,
  X,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  Home,
} from 'lucide-react';
import { CatalogProductItem, Category } from '@michaforge/shared-contracts';

const INITIAL_CATEGORIES: Category[] = [
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

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || searchParams.get('categoryId') || null;
  const initialSub = searchParams.get('sub') || null;
  const initialSearch = searchParams.get('search') || '';
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  const initialFeatured = searchParams.get('featured') === 'true';

  const [products, setProducts] = useState<CatalogProductItem[]>([]);
  const [allCatalogProducts, setAllCatalogProducts] = useState<CatalogProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedSubSlug, setSelectedSubSlug] = useState<string | null>(initialSub);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [onlyFeatured, setOnlyFeatured] = useState(initialFeatured);
  const [onlyPriced, setOnlyPriced] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'name' | 'price-asc' | 'price-desc'>('featured');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProductItem | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [brand, setBrand] = useState<any>(null);

  // Sync URL query params cleanly without full page reload
  const syncUrlParams = useCallback(
    (overrides: {
      category?: string | null;
      sub?: string | null;
      search?: string;
      minPrice?: string;
      maxPrice?: string;
      featured?: boolean;
    }) => {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);

      const catVal = overrides.category !== undefined ? overrides.category : selectedCategory;
      const subVal = overrides.sub !== undefined ? overrides.sub : selectedSubSlug;
      const searchVal = overrides.search !== undefined ? overrides.search : searchQuery;
      const minVal = overrides.minPrice !== undefined ? overrides.minPrice : minPrice;
      const maxVal = overrides.maxPrice !== undefined ? overrides.maxPrice : maxPrice;
      const featVal = overrides.featured !== undefined ? overrides.featured : onlyFeatured;

      url.searchParams.delete('categoryId');
      if (catVal) url.searchParams.set('category', catVal);
      else url.searchParams.delete('category');

      if (subVal) url.searchParams.set('sub', subVal);
      else url.searchParams.delete('sub');

      if (searchVal.trim()) url.searchParams.set('search', searchVal.trim());
      else url.searchParams.delete('search');

      if (minVal) url.searchParams.set('minPrice', minVal);
      else url.searchParams.delete('minPrice');

      if (maxVal) url.searchParams.set('maxPrice', maxVal);
      else url.searchParams.delete('maxPrice');

      if (featVal) url.searchParams.set('featured', 'true');
      else url.searchParams.delete('featured');

      window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
    },
    [selectedCategory, selectedSubSlug, searchQuery, minPrice, maxPrice, onlyFeatured]
  );

  // Sync state if URL query changes via browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedCategory(params.get('category') || params.get('categoryId') || null);
      setSelectedSubSlug(params.get('sub') || null);
      setSearchQuery(params.get('search') || '');
      setMinPrice(params.get('minPrice') || '');
      setMaxPrice(params.get('maxPrice') || '');
      setOnlyFeatured(params.get('featured') === 'true');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync when Next.js searchParams change externally
  useEffect(() => {
    const cat = searchParams.get('category') || searchParams.get('categoryId') || null;
    setSelectedCategory(cat);
    setSelectedSubSlug(searchParams.get('sub') || null);
  }, [searchParams]);

  // Fetch public brand settings & full catalog counts once
  useEffect(() => {
    fetch('/api/v1/settings/public')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) setBrand(json.data);
      })
      .catch(() => {});

    fetch('/api/v1/categories')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(json.data);
        }
      })
      .catch((err) => console.error('[ProductsPage] Failed to fetch categories:', err));

    fetch('/api/v1/catalog/products?limit=200')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setAllCatalogProducts(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const phone = brand?.primaryPhone || '0714843208';
  const whatsapp = brand?.whatsappNumber || '+254714843208';
  const secondaryPhone = brand?.secondaryPhone || '0721435772';
  const secondaryWhatsapp = brand?.secondaryWhatsappNumber || '+254721435772';

  // Fetch filtered products from Supabase API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/v1/catalog/products?limit=200';
      if (selectedCategory) url += `&categoryId=${encodeURIComponent(selectedCategory)}`;
      if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;

      const res = await fetch(url);
      const json = await res.json();

      if (res.ok && json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      } else {
        setError(json.error?.message || 'Failed to retrieve products from Supabase');
        setProducts([]);
      }
    } catch {
      setError('Unable to reach server. Please check your network connection.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Compute live product counts per category for sidebar badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const source = allCatalogProducts.length > 0 ? allCatalogProducts : products;
    for (const item of source) {
      if (item.categoryId) {
        counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
      }
    }
    return counts;
  }, [allCatalogProducts, products]);

  const activeCategoryObj = useMemo(
    () => categories.find((c) => c.id === selectedCategory || c.slug === selectedCategory),
    [categories, selectedCategory]
  );

  const activeSubFilterObj = useMemo(() => {
    if (!activeCategoryObj || !selectedSubSlug) return null;
    const subs = getSubFiltersForCategory(activeCategoryObj);
    return subs.find((s) => s.slug === selectedSubSlug) || null;
  }, [activeCategoryObj, selectedSubSlug]);

  // Apply refined sub-category, price range, suggestion filters & sorting
  const displayedProducts = useMemo(() => {
    let list = [...products];

    // 1. Sub-category dropdown filter
    if (activeSubFilterObj && activeSubFilterObj.keywords.length > 0) {
      list = list.filter((item) => {
        const specText = (item.specifications || [])
          .map((s) => `${s.key} ${s.value}`)
          .join(' ');
        const haystack = `${item.name} ${item.shortDescription || ''} ${item.description || ''} ${item.sku || ''} ${specText}`.toLowerCase();
        return activeSubFilterObj.keywords.some((kw) => haystack.includes(kw.toLowerCase()));
      });
    }

    // 2. Price range filter (KES)
    const parsedMin = minPrice !== '' ? Number(minPrice) : null;
    const parsedMax = maxPrice !== '' ? Number(maxPrice) : null;
    if (parsedMin !== null && !Number.isNaN(parsedMin)) {
      list = list.filter((item) => item.price !== null && item.price !== undefined && Number(item.price) >= parsedMin);
    }
    if (parsedMax !== null && !Number.isNaN(parsedMax)) {
      list = list.filter((item) => item.price !== null && item.price !== undefined && Number(item.price) <= parsedMax);
    }

    // 3. Quick suggestion toggles
    if (onlyFeatured) {
      list = list.filter((item) => Boolean(item.isFeatured));
    }
    if (onlyPriced) {
      list = list.filter((item) => item.price !== null && item.price !== undefined && Number(item.price) > 0);
    }

    // 4. Sorting
    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => (a.price || 999999) - (b.price || 999999));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return list;
  }, [products, activeSubFilterObj, minPrice, maxPrice, onlyFeatured, onlyPriced, sortBy]);

  const handleCategorySelect = (categoryId: string | null, subSlug: string | null = null) => {
    setSelectedCategory(categoryId);
    setSelectedSubSlug(subSlug);
    syncUrlParams({ category: categoryId, sub: subSlug });
    setMobileFilterOpen(false);
  };

  const handleApplyPriceRange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    syncUrlParams({ minPrice: min, maxPrice: max });
    setMobileFilterOpen(false);
  };

  const handleToggleFeatured = (val: boolean) => {
    setOnlyFeatured(val);
    syncUrlParams({ featured: val });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    syncUrlParams({ search: searchQuery });
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedSubSlug(null);
    setMinPrice('');
    setMaxPrice('');
    setOnlyFeatured(false);
    setOnlyPriced(false);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedSubSlug ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (onlyFeatured ? 1 : 0) +
    (onlyPriced ? 1 : 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F6F9]">
      <Navbar
        businessPhone={phone}
        whatsappNumber={whatsapp}
        secondaryPhone={secondaryPhone}
        secondaryWhatsappNumber={secondaryWhatsapp}
        activePage="products"
      />

      {/* Compact Blue Header Section */}
      <div className="relative bg-[#073253] text-white py-4 sm:py-5 px-4 sm:px-6 overflow-hidden border-b border-white/10">
        {/* Subtle Ambient Showroom Backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <img
            src="/images/about/showroom_display.png"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center filter brightness-[0.25] contrast-[1.1] saturate-[1.1] opacity-25"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/about/showroom_display.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#073253] via-[#073253]/95 to-[#073253]/85" />
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
            {/* Left Column: Title & Subtitle */}
            <div className="lg:col-span-7 space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#FF850D]" />
                <span className="text-[10.5px] sm:text-xs font-black text-[#FF850D] uppercase tracking-wider">
                  Michaforge Catalogue
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-[28px] font-black tracking-tight text-white leading-tight">
                Plumbing &amp; Hardware Catalogue
              </h1>
              <p className="text-gray-200 text-xs sm:text-[13px] max-w-xl leading-relaxed">
                Browse genuine pipes, fittings, valves, taps, sinks, showers and hardware supplies.
              </p>
            </div>

            {/* Right Column: Search Input */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <form onSubmit={handleSearchSubmit} className="w-full max-w-md flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="I'm looking for taps, sinks, PPR, locks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-[#172B3A] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF850D] bg-white border border-white/20 placeholder:text-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#FF850D] hover:bg-[#E67300] text-white px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex-shrink-0 flex items-center space-x-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Storefront Area: Immediate Breadcrumb + Left Category/Filter Sidebar + Right Products Grid */}
      <main className="max-w-[1400px] mx-auto px-3 sm:px-5 lg:px-6 py-3.5 sm:py-4 flex-grow w-full">
        {/* Clean Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-[#64748B] mb-3 px-0.5"
        >
          <a
            href="/"
            className="inline-flex items-center space-x-1 hover:text-[#073253] font-semibold transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            type="button"
            onClick={() => handleCategorySelect(null, null)}
            className={`hover:text-[#FF850D] transition-colors ${
              !activeCategoryObj ? 'font-bold text-[#073253]' : 'font-semibold'
            }`}
          >
            All Products
          </button>
          {activeCategoryObj && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => handleCategorySelect(activeCategoryObj.id, null)}
                className={`hover:text-[#FF850D] transition-colors ${
                  !activeSubFilterObj ? 'font-bold text-[#073253]' : 'font-semibold'
                }`}
              >
                {activeCategoryObj.name}
              </button>
            </>
          )}
          {activeSubFilterObj && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-[#FF850D]">{activeSubFilterObj.label}</span>
            </>
          )}
        </nav>

        {/* Mobile & Tablet (< lg) Quick Category Bar + Filter Drawer Trigger */}
        <div className="lg:hidden mb-3 space-y-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#073253] text-white text-xs font-bold flex-shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF850D]" />
              <span>Categories &amp; Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#FF850D] text-white text-[10px] font-black">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleCategorySelect(null, null)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 border transition-colors ${
                !selectedCategory
                  ? 'bg-[#FF850D] text-white border-[#FF850D]'
                  : 'bg-white text-[#073253] border-[#E2E8F0]'
              }`}
            >
              All
            </button>

            {categories
              .filter((c) => c.isPublished !== false)
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
              .map((cat) => {
                const isSel = selectedCategory === cat.id || selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(isSel ? null : cat.id, null)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 border transition-colors ${
                      isSel
                        ? 'bg-[#FF850D] text-white border-[#FF850D]'
                        : 'bg-white text-[#073253] border-[#E2E8F0]'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Mobile Slide-Over Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="relative z-10 w-[86%] max-w-[330px] bg-[#F8FAFC] h-full overflow-y-auto p-3 shadow-xl">
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-sm font-black text-[#073253]">
                  Browse Catalogue &amp; Filters
                </span>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#073253]"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <CatalogFilterSidebar
                categories={categories}
                selectedCategoryId={selectedCategory}
                selectedSubSlug={selectedSubSlug}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onlyFeatured={onlyFeatured}
                onlyPriced={onlyPriced}
                categoryCounts={categoryCounts}
                totalCatalogCount={allCatalogProducts.length || products.length}
                whatsappNumber={whatsapp}
                onSelectCategory={handleCategorySelect}
                onApplyPriceRange={handleApplyPriceRange}
                onToggleFeatured={handleToggleFeatured}
                onTogglePriced={setOnlyPriced}
                onResetAll={() => {
                  handleClearFilters();
                  setMobileFilterOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Two-Column Storefront Layout: Left Sidebar + Right Product Grid */}
        <div className="flex flex-col lg:flex-row gap-4 xl:gap-5 items-start">
          {/* LEFT SIDEBAR: Categories going vertically down + Dropdowns + Price & Suggestions */}
          <div className="hidden lg:block w-[265px] xl:w-[285px] flex-shrink-0 sticky top-4">
            <CatalogFilterSidebar
              categories={categories}
              selectedCategoryId={selectedCategory}
              selectedSubSlug={selectedSubSlug}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onlyFeatured={onlyFeatured}
              onlyPriced={onlyPriced}
              categoryCounts={categoryCounts}
              totalCatalogCount={allCatalogProducts.length || products.length}
              whatsappNumber={whatsapp}
              onSelectCategory={handleCategorySelect}
              onApplyPriceRange={handleApplyPriceRange}
              onToggleFeatured={handleToggleFeatured}
              onTogglePriced={setOnlyPriced}
              onResetAll={handleClearFilters}
            />
          </div>

          {/* RIGHT MAIN AREA: Immediate Results Bar + Products Grid */}
          <div className="flex-1 min-w-0 w-full">
            {/* Top Results & Sort Toolbar Card */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] px-3.5 sm:px-4 py-2.5 mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-[13px] text-[#475569]">
                <span>
                  <strong className="font-black text-[#073253]">
                    {displayedProducts.length}
                  </strong>{' '}
                  {displayedProducts.length === 1 ? 'result' : 'results'}{' '}
                  {activeCategoryObj ? (
                    <>
                      for{' '}
                      <span className="font-bold text-[#073253]">
                        {activeCategoryObj.name}
                      </span>
                    </>
                  ) : (
                    'in catalogue'
                  )}
                </span>

                {/* Active Sub-Category Pill */}
                {activeSubFilterObj && (
                  <span className="inline-flex items-center space-x-1 bg-[#FF850D]/10 text-[#FF850D] text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-[#FF850D]/25">
                    <span>{activeSubFilterObj.label}</span>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(selectedCategory, null)}
                      className="hover:text-[#073253]"
                      title="Remove sub-category filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Active Price Range Pill */}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center space-x-1 bg-[#073253]/10 text-[#073253] text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-[#073253]/20">
                    <span>
                      KSh {minPrice || '0'} – {maxPrice || 'Any'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplyPriceRange('', '')}
                      className="hover:text-[#FF850D]"
                      title="Remove price filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Active Search Pill */}
                {searchQuery.trim() && (
                  <span className="inline-flex items-center space-x-1 bg-[#073253]/10 text-[#073253] text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-[#073253]/20">
                    <span>&ldquo;{searchQuery.trim()}&rdquo;</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        syncUrlParams({ search: '' });
                      }}
                      className="hover:text-[#FF850D]"
                      title="Clear search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Active Featured Pill */}
                {onlyFeatured && (
                  <span className="inline-flex items-center space-x-1 bg-[#FF850D]/10 text-[#FF850D] text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-[#FF850D]/25">
                    <span>Featured</span>
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(false)}
                      className="hover:text-[#073253]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeFilterCount > 1 && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-[11px] font-bold text-[#FF850D] hover:underline ml-1"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Right Sort Control */}
              <div className="flex items-center space-x-2 ml-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort products"
                  className="bg-[#FF850D] hover:bg-[#E67300] text-white rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#073253] cursor-pointer transition-colors"
                >
                  <option value="featured" className="bg-white text-[#172B3A]">
                    Popular / Featured
                  </option>
                  <option value="price-asc" className="bg-white text-[#172B3A]">
                    Price: Low to High
                  </option>
                  <option value="price-desc" className="bg-white text-[#172B3A]">
                    Price: High to Low
                  </option>
                  <option value="name" className="bg-white text-[#172B3A]">
                    Name: A – Z
                  </option>
                </select>
              </div>
            </div>

            {/* Loading Skeleton Grid */}
            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col"
                  >
                    <div className="bg-slate-200 aspect-square w-full" />
                    <div className="p-3 space-y-2">
                      <div className="bg-slate-200 h-4 rounded w-4/5" />
                      <div className="bg-slate-200 h-4 rounded w-2/5" />
                      <div className="bg-slate-200 h-8 rounded-xl w-full mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
                <p className="text-red-600 font-semibold text-sm">{error}</p>
                <button
                  onClick={() => fetchProducts()}
                  className="inline-flex items-center space-x-2 bg-[#073253] text-white px-4 py-2 rounded-lg text-xs font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Empty Filter State */}
            {!loading && !error && displayedProducts.length === 0 && (
              <div className="text-center py-14 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                <h3 className="text-base sm:text-lg font-extrabold text-[#073253]">
                  No products match the selected filters
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {activeSubFilterObj
                    ? `No items matched "${activeSubFilterObj.label}" with your current price or search filters.`
                    : selectedCategory
                    ? `No products found in ${activeCategoryObj?.name || 'this department'} matching your current filters.`
                    : 'Try adjusting your search keywords, price range, or selecting another category on the left.'}
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {selectedSubSlug && (
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(selectedCategory, null)}
                      className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#073253] text-xs font-bold transition-colors"
                    >
                      Show All in {activeCategoryObj?.name.split(',')[0] || 'Category'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-[#FF850D] hover:bg-[#E67300] text-white text-xs font-bold transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}

            {/* Products Showcase Grid */}
            {!loading && !error && displayedProducts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    whatsappNumber={whatsapp}
                    onSelect={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer
        businessPhone={phone}
        whatsappNumber={whatsapp}
        secondaryPhone={secondaryPhone}
        secondaryWhatsappNumber={secondaryWhatsapp}
      />

      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        businessPhone={phone}
        whatsappNumber={whatsapp}
        secondaryPhone={secondaryPhone}
        secondaryWhatsappNumber={secondaryWhatsapp}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF850D]" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
