'use client';

import React from 'react';
import { MessageCircle, ArrowRight, Tag } from 'lucide-react';
import { CatalogProductItem } from '@michaforge/shared-contracts';
import { generateWhatsAppLink } from '@michaforge/shared-validation';

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
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#DFE5EB]">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#073253]">
                Featured Products
              </h2>
            </div>
            {/* Orange underline accent matching flyer */}
            <div className="w-16 h-1 bg-[#FF850D] mt-2 rounded-full" />
          </div>

          <a
            href="/products"
            className="mt-4 sm:mt-0 inline-flex items-center space-x-1.5 text-sm font-bold text-[#FF850D] hover:text-[#E67300] hover:underline transition-all group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Product Cards Grid: 6 cards matching flyer row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {products.map((product) => {
            const primaryImage =
              product.images && product.images.length > 0
                ? product.images.find((img) => img.isPrimary)?.url || product.images[0].url
                : '/images/products/product_pvc_pipes.png';

            const waUrl = generateWhatsAppLink(
              whatsappNumber,
              product.name,
              product.sku
            );

            const isPriceSet =
              product.price !== null &&
              product.price !== undefined &&
              product.price > 0;

            return (
              <div
                key={product.id}
                className="product-card flex flex-col justify-between bg-white border border-[#DFE5EB] rounded-xl p-3 shadow-sm hover:border-[#FF850D]/60 transition-all text-left"
              >
                {/* Product Image Area */}
                <div
                  className="w-full h-32 sm:h-36 bg-[#F5F7FA] rounded-lg overflow-hidden flex items-center justify-center p-2 cursor-pointer group"
                  onClick={() => onOpenProductModal && onOpenProductModal(product)}
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

                {/* Product Info */}
                <div className="mt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="font-bold text-sm text-[#172B3A] line-clamp-1 hover:text-[#FF850D] cursor-pointer"
                      onClick={() => onOpenProductModal && onOpenProductModal(product)}
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    {/* Unit of sale */}
                    <p className="text-[11px] text-[#667585] mt-0.5">
                      {product.unit}
                    </p>
                  </div>

                  {/* Price display: dynamic from pricing service */}
                  <div className="my-2.5">
                    {isPriceSet ? (
                      <div className="flex items-baseline space-x-1">
                        <span className="text-sm font-extrabold text-[#073253]">
                          {product.formattedPrice}
                        </span>
                        {product.previousPrice && (
                          <span className="text-[10px] text-gray-400 line-through">
                            KSh {product.previousPrice}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="inline-flex items-center space-x-1 text-xs font-semibold text-[#FF850D] bg-orange-50 px-2 py-0.5 rounded">
                        <Tag className="w-3 h-3" />
                        <span>Contact for Price</span>
                      </div>
                    )}
                  </div>

                  {/* Green Inquire on WhatsApp button matching flyer */}
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
      </div>
    </section>
  );
}
