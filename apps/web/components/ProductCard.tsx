'use client';

import React from 'react';
import { MessageCircle, Tag } from 'lucide-react';
import { CatalogProductItem } from '@michaforge/shared-contracts';
import { generateWhatsAppLink } from '@michaforge/shared-validation';

export interface ProductCardProps {
  product: CatalogProductItem;
  whatsappNumber: string;
  onSelect: (product: CatalogProductItem) => void;
  fallbackImage?: string;
}

export function ProductCard({
  product,
  whatsappNumber,
  onSelect,
  fallbackImage = '/images/products/product_synnova_urinal.png',
}: ProductCardProps) {
  const primaryImage =
    product.images && product.images.length > 0
      ? product.images.find((img) => img.isPrimary)?.url || product.images[0].url
      : fallbackImage;

  const isPriceSet =
    product.price !== null && product.price !== undefined && Number(product.price) > 0;

  const waUrl = generateWhatsAppLink(whatsappNumber, product.name, product.sku);

  return (
    <div className="product-card group relative flex flex-col justify-end w-full h-[320px] sm:h-[340px] rounded-2xl overflow-hidden bg-white border border-slate-200/70 hover:border-[#FF850D]/70 transition-all duration-300 text-left select-none">
      {/* Background Image: Fits all over, edge-to-edge, with smooth zoom on hover */}
      <div
        className="absolute inset-0 w-full h-full cursor-pointer overflow-hidden bg-slate-100"
        onClick={() => onSelect(product)}
        title={`View ${product.name}`}
      >
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 filter brightness-[0.98]"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (target.src !== fallbackImage) {
              target.src = fallbackImage;
            }
          }}
        />

        {/* Top Vignette for badge legibility */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />
      </div>

      {/* Top Floating Badge: Quality indicator only — price is displayed exclusively in the bottom panel to eliminate repetition */}
      <div className="absolute top-2.5 left-2.5 z-10 flex items-center pointer-events-none">
        {product.isFeatured ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF850D] text-white shadow-2xs uppercase tracking-wider">
            Featured
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#073253]/75 backdrop-blur-md text-white border border-white/20 shadow-2xs">
            Genuine
          </span>
        )}
      </div>

      {/* Floating Bottom Panel: Words above image with frosted backdrop blur & seamless blend */}
      <div className="relative z-10 p-2.5 sm:p-3 backdrop-blur-md bg-white/85 group-hover:bg-white/95 border-t border-white/50 transition-all duration-300 space-y-1.5">
        <h3
          className="font-extrabold text-xs sm:text-[13px] text-[#073253] group-hover:text-[#FF850D] line-clamp-2 leading-tight transition-colors cursor-pointer"
          onClick={() => onSelect(product)}
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Price & Unit Details Row */}
        <div className="flex items-baseline justify-between pt-0.5">
          {isPriceSet ? (
            <div className="flex items-baseline space-x-1.5">
              <span className="text-sm sm:text-[14.5px] font-black text-[#FF850D]">
                {product.formattedPrice}
              </span>
              {product.previousPrice ? (
                <span className="text-[10px] text-gray-400 line-through">
                  KSh {product.previousPrice}
                </span>
              ) : null}
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1 text-[10px] font-bold text-[#FF850D] bg-orange-50 px-1.5 py-0.5 rounded">
              <Tag className="w-2.5 h-2.5" />
              <span>Contact for Price</span>
            </div>
          )}

          <span className="text-[10px] sm:text-[11px] text-[#667585] font-semibold truncate max-w-[100px] text-right">
            {product.unit ? `per ${product.unit}` : 'per item'}
          </span>
        </div>

        {/* Action Button: Compact, zero wasted gaps */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center space-x-1.5 bg-[#0BAA58] hover:bg-[#09934B] text-white text-[11px] font-bold py-2 px-2.5 rounded-xl transition-all shadow-2xs active:scale-[0.98]"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-white flex-shrink-0" />
          <span className="truncate">Inquire on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

export default ProductCard;
