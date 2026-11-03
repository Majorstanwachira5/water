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
    <section className="py-8 sm:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header matching flyer */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#073253]">
              Featured Products
            </h2>
            {/* Orange underline accent matching flyer */}
            <div className="w-24 h-1 bg-[#FF850D] mt-1.5 rounded-full" />
          </div>

          <a
            href="/products"
            className="inline-flex items-center space-x-1.5 bg-[#FF850D] hover:bg-[#E67300] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Product Cards Grid: 6 cards matching flyer row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
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
                className="product-card flex flex-col justify-between bg-white border border-[#DFE5EB] rounded-xl p-2.5 shadow-sm hover:border-[#FF850D]/60 transition-all text-left"
              >
                {/* Product Image Area */}
                <div
                  className="w-full h-28 sm:h-32 bg-[#F5F7FA] rounded-lg overflow-hidden flex items-center justify-center cursor-pointer group"
                  onClick={() => onOpenProductModal && onOpenProductModal(product)}
                >
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/modern_hardware_hero.png';
                    }}
                  />
                </div>

                {/* Product Info matching flyer layout */}
                <div className="mt-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="font-extrabold text-xs sm:text-[13px] text-[#073253] line-clamp-1 hover:text-[#FF850D] cursor-pointer"
                      onClick={() => onOpenProductModal && onOpenProductModal(product)}
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    {/* Price display in bold Orange matching flyer */}
                    <div className="mt-1">
                      {isPriceSet ? (
                        <div className="flex items-baseline space-x-1">
                          <span className="text-sm sm:text-[15px] font-black text-[#FF850D]">
                            {product.formattedPrice}
                          </span>
                          {product.previousPrice && (
                            <span className="text-[10px] text-gray-400 line-through">
                              KSh {product.previousPrice}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#FF850D]">
                          <Tag className="w-3 h-3" />
                          <span>Contact for Price</span>
                        </div>
                      )}
                    </div>

                    {/* Unit of sale */}
                    <p className="text-[11px] text-[#667585] mt-0.5 mb-2.5">
                      {product.unit}
                    </p>
                  </div>

                  {/* Green Inquire on WhatsApp button matching flyer */}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-1.5 bg-[#0BAA58] hover:bg-[#09934B] text-white text-[11px] font-bold py-1.5 px-2 rounded-md transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-3 h-3 fill-white flex-shrink-0" />
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
