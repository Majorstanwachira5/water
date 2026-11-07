'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CategoryStrip from '../../components/CategoryStrip';
import ProductDetailModal from '../../components/ProductDetailModal';
import ProductCard from '../../components/ProductCard';
import { Search, Filter, RefreshCw, X } from 'lucide-react';
import { CatalogProductItem, Category } from '@michaforge/shared-contracts';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || searchParams.get('categoryId') || null;
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<CatalogProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'name' | 'price-asc' | 'price-desc'>('featured');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProductItem | null>(null);
  const [brand, setBrand] = useState<any>(null);

  // Sync state if URL query changes via browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category') || params.get('categoryId') || null;
      setSelectedCategory(cat);
      const q = params.get('search') || '';
      setSearchQuery(q);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync when searchParams change
  useEffect(() => {
    const cat = searchParams.get('category') || searchParams.get('categoryId') || null;
    setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/v1/settings/public')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) setBrand(json.data);
      })
      .catch(() => {});
  }, []);

  const phone = brand?.primaryPhone || '0714843208';
  const whatsapp = brand?.whatsappNumber || '+254714843208';
  const secondaryPhone = brand?.secondaryPhone || '0721435772';
  const secondaryWhatsapp = brand?.secondaryWhatsappNumber || '+254721435772';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/v1/catalog/products?limit=100';
      if (selectedCategory) url += `&categoryId=${encodeURIComponent(selectedCategory)}`;
      if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;

      const res = await fetch(url);
      const json = await res.json();
      let items: CatalogProductItem[] = [];

      if (res.ok && json.success && Array.isArray(json.data)) {
        items = json.data;
      } else {
        setError(json.error?.message || 'Failed to retrieve products from Supabase');
      }

      if (sortBy === 'name') {
        items.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'price-asc') {
        items.sort((a, b) => (a.price || 999999) - (b.price || 999999));
      } else if (sortBy === 'price-desc') {
        items.sort((a, b) => (b.price || 0) - (a.price || 0));
      }
      setProducts(items);
    } catch {
      setError('Unable to reach server. Please check your network connection.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy]);

  useEffect(() => {
    fetch('/api/v1/categories')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      })
      .catch((err) => console.error('[ProductsPage] Failed to fetch categories:', err));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategorySelect = (id: string | null) => {
    setSelectedCategory(id);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (id) {
        url.searchParams.set('category', id);
        url.searchParams.delete('categoryId');
      } else {
        url.searchParams.delete('category');
        url.searchParams.delete('categoryId');
      }
      window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (searchQuery.trim()) {
        url.searchParams.set('search', searchQuery.trim());
      } else {
        url.searchParams.delete('search');
      }
      window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
    }
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('search');
      url.searchParams.delete('category');
      url.searchParams.delete('categoryId');
      window.history.pushState(null, '', url.pathname);
    }
  };

  // Find active category label
  const activeCategoryObj = categories.find(
    (c) => c.id === selectedCategory || c.slug === selectedCategory
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar
        businessPhone={phone}
        whatsappNumber={whatsapp}
        secondaryPhone={secondaryPhone}
        secondaryWhatsappNumber={secondaryWhatsapp}
        activePage="products"
      />

      {/* Page Title & Search Header */}
      <div className="bg-[#073253] text-white py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="max-w-xl">
            <span className="text-xs font-bold text-[#FF850D] uppercase tracking-wider">
              Michaforge Catalogue
            </span>
            <h1 className="text-3xl sm:text-4xl font-black mt-1">
              Plumbing &amp; Hardware Catalogue
            </h1>
            <p className="text-gray-300 text-sm mt-2">
              Browse pipes, fittings, valves, taps, water tanks and essential plumbing supplies.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name, SKU, or specification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg text-[#172B3A] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#FF850D] hover:bg-[#E67300] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors"
            >
              Search
            </button>
            {(searchQuery || selectedCategory) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors"
              >
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Interactive Category Navigation Strip */}
      <CategoryStrip
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={handleCategorySelect}
        showAllOption={true}
      />

      {/* Catalogue Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-grow w-full">
        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#172B3A] font-medium">
            <span>Showing:</span>
            <span className="font-bold text-[#073253]">
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </span>

            {/* Active category filter pill */}
            {selectedCategory && (
              <span className="inline-flex items-center space-x-1.5 bg-[#FF850D]/10 text-[#FF850D] text-xs px-3 py-1 rounded-full font-bold border border-[#FF850D]/20">
                <span>Category: {activeCategoryObj?.name || selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => handleCategorySelect(null)}
                  className="hover:text-[#073253] p-0.5"
                  title="Clear category filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {/* Active search query pill */}
            {searchQuery && (
              <span className="inline-flex items-center space-x-1.5 bg-[#073253]/10 text-[#073253] text-xs px-3 py-1 rounded-full font-bold border border-[#073253]/20">
                <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    if (typeof window !== 'undefined') {
                      const url = new URL(window.location.href);
                      url.searchParams.delete('search');
                      window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
                    }
                  }}
                  className="hover:text-[#FF850D] p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#DFE5EB] rounded-lg text-xs font-semibold text-[#172B3A] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FF850D]"
            >
              <option value="featured">Sort: Featured</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-64 flex flex-col justify-between">
                <div className="bg-gray-200 h-32 rounded-lg" />
                <div className="space-y-2 mt-3">
                  <div className="bg-gray-200 h-4 rounded w-3/4" />
                  <div className="bg-gray-200 h-3 rounded w-1/2" />
                </div>
                <div className="bg-gray-200 h-8 rounded mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 space-y-4">
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

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
            <h3 className="text-lg font-bold text-[#073253]">No products match your criteria</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {selectedCategory
                ? `No products found in ${activeCategoryObj?.name || 'this category'}. Try choosing another category or clearing filters.`
                : 'Try adjusting your search query or selecting a category from above.'}
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#FF850D] text-white text-xs font-bold shadow-xs hover:bg-[#E67300] transition-colors"
            >
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                whatsappNumber={whatsapp}
                onSelect={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF850D]" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
