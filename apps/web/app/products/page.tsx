'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CategoryStrip from '../../components/CategoryStrip';
import ProductDetailModal from '../../components/ProductDetailModal';
import { Search, Filter, RefreshCw, MessageCircle, Tag, ArrowRight } from 'lucide-react';
import { CatalogProductItem, Category } from '@michaforge/shared-contracts';
import { generateWhatsAppLink } from '@michaforge/shared-validation';

export default function ProductsPage() {
  const [products, setProducts] = useState<CatalogProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'name' | 'price-asc' | 'price-desc'>('featured');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProductItem | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/v1/catalog/products?limit=100';
      if (selectedCategory) url += `&categoryId=${selectedCategory}`;
      if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;

      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.success) {
        let items: CatalogProductItem[] = json.data;
        if (sortBy === 'name') {
          items.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'price-asc') {
          items.sort((a, b) => (a.price || 999999) - (b.price || 999999));
        } else if (sortBy === 'price-desc') {
          items.sort((a, b) => (b.price || 0) - (a.price || 0));
        }
        setProducts(items);
      } else {
        setError(json.error?.message || 'Failed to load products');
      }
    } catch (err: any) {
      setError('Could not connect to catalogue service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/v1/categories')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) setCategories(json.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar activePage="products" />

      {/* Page Title & Search Header */}
      <div className="bg-[#073253] text-white py-10 px-4">
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
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg text-xs"
              >
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Category Strip */}
      <CategoryStrip
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={(id) => setSelectedCategory(id)}
      />

      {/* Catalogue Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-[#172B3A] font-medium">
            <span>Showing:</span>
            <span className="font-bold text-[#073253]">
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </span>
            {selectedCategory && (
              <span className="bg-[#FF850D]/10 text-[#FF850D] text-xs px-2.5 py-0.5 rounded-full font-bold">
                Filtered by category
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
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
              onClick={fetchProducts}
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
              Try adjusting your search query or selecting a different category from above.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="mt-2 text-xs font-bold text-[#FF850D] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {products.map((product) => {
              const primaryImage =
                product.images && product.images.length > 0
                  ? product.images.find((img) => img.isPrimary)?.url || product.images[0].url
                  : '/images/products/product_pvc_pipes.png';

              const waUrl = generateWhatsAppLink('+254714843208', product.name, product.sku);
              const isPriceSet =
                product.price !== null && product.price !== undefined && product.price > 0;

              return (
                <div
                  key={product.id}
                  className="product-card flex flex-col justify-between bg-white border border-[#DFE5EB] rounded-xl p-3 shadow-sm hover:border-[#FF850D]/60 transition-all text-left"
                >
                  <div
                    className="w-full h-32 sm:h-36 bg-[#F5F7FA] rounded-lg overflow-hidden flex items-center justify-center p-2 cursor-pointer group"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/flyer_upright.jpg';
                      }}
                    />
                  </div>

                  <div className="mt-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        className="font-bold text-sm text-[#172B3A] line-clamp-1 hover:text-[#FF850D] cursor-pointer"
                        onClick={() => setSelectedProduct(product)}
                        title={product.name}
                      >
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-[#667585] mt-0.5">{product.unit}</p>
                    </div>

                    <div className="my-2.5">
                      {isPriceSet ? (
                        <span className="text-sm font-extrabold text-[#073253]">
                          {product.formattedPrice}
                        </span>
                      ) : (
                        <div className="inline-flex items-center space-x-1 text-xs font-semibold text-[#FF850D] bg-orange-50 px-2 py-0.5 rounded">
                          <Tag className="w-3 h-3" />
                          <span>Contact for Price</span>
                        </div>
                      )}
                    </div>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center space-x-1.5 bg-[#0BAA58] hover:bg-[#09934B] text-white text-xs font-semibold py-2 px-2 rounded-lg transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span className="truncate">Inquire on WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
