'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CatalogProductItem } from '@michaforge/shared-contracts';
import ProductCard from './ProductCard';

interface FeaturedProductsProps {
  products: CatalogProductItem[];
  whatsappNumber?: string;
  onOpenProductModal?: (product: CatalogProductItem) => void;
}

export default function FeaturedProducts({
  products = [],
  whatsappNumber = '+254714843208',
  onOpenProductModal,
}: FeaturedProductsProps) {
  return (
    <section className="py-5 sm:py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header matching flyer */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#073253]">
              Featured Products
            </h2>
            {/* Orange underline accent matching flyer */}
            <div className="w-24 h-1 bg-[#FF850D] mt-1 rounded-full" />
          </div>

          <a
            href="/products"
            className="inline-flex items-center space-x-1.5 bg-[#FF850D] hover:bg-[#E67300] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Product Cards Grid: crisp square image display above title & price */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              whatsappNumber={whatsappNumber}
              onSelect={(p) => onOpenProductModal && onOpenProductModal(p)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
