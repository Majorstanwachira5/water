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
    <div className="product-card group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/85 hover:border-[#FF850D]/80 transition-all duration-300 text-left select-none">
      {/* Top Product Image Stage: Clean 1:1 square frame above title & prices so the whole product is 100% visible */}
      <div
        className="relative w-full aspect-square bg-white cursor-pointer overflow-hidden border-b border-slate-100 flex items-center justify-center p-1"
        onClick={() => onSelect(product)}
        title={`View ${product.name}`}
      >
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain object-center group-hover:scale-[1.04] transition-transform duration-300"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (target.src !== fallbackImage) {
              target.src = fallbackImage;
            }
          }}
        />

        {product.isFeatured && (
          <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#FF850D] text-white uppercase tracking-wider pointer-events-none">
            Featured
          </span>
        )}
      </div>

      {/* Bottom Details & Pricing Panel */}
      <div className="flex-1 flex flex-col justify-between p-2.5 sm:p-3 bg-white space-y-2">
        <div className="space-y-1">
          <h3
            className="font-extrabold text-xs sm:text-[13px] text-[#073253] group-hover:text-[#FF850D] line-clamp-2 leading-snug transition-colors cursor-pointer min-h-[2.3em]"
            onClick={() => onSelect(product)}
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Current Price & Unit Row (No canceled grey previous prices) */}
          <div className="flex items-baseline justify-between gap-1 pt-0.5">
            {isPriceSet ? (
              <span className="text-sm sm:text-[15px] font-black text-[#FF850D] tracking-tight">
                {product.formattedPrice}
              </span>
            ) : (
              <div className="inline-flex items-center space-x-1 text-[10.5px] font-bold text-[#FF850D] bg-orange-50 px-1.5 py-0.5 rounded">
                <Tag className="w-2.5 h-2.5" />
                <span>Contact for Price</span>
              </div>
            )}

            <span className="text-[10px] sm:text-[11px] text-[#64748B] font-semibold truncate max-w-[95px] text-right">
              {product.unit ? `per ${product.unit}` : 'per item'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center space-x-1.5 bg-[#0BAA58] hover:bg-[#09934B] text-white text-[11px] font-bold py-2 px-2.5 rounded-xl transition-colors active:scale-[0.98]"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-white flex-shrink-0" />
          <span className="truncate">Inquire on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

export default ProductCard;
