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
    <div className="product-card flex flex-col justify-between bg-white border border-[#DFE5EB] rounded-xl overflow-hidden shadow-sm hover:border-[#FF850D]/60 transition-all text-left">
      <div
        className="w-full h-36 sm:h-40 bg-[#F8FAFB] overflow-hidden flex items-center justify-center cursor-pointer group border-b border-gray-100"
        onClick={() => onSelect(product)}
      >
        <img
          src={primaryImage}
          alt={product.name}
          loading="eager"
          decoding="sync"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallbackImage;
          }}
        />
      </div>

      <div className="p-2.5 pt-2 flex-1 flex flex-col justify-between">
        <div>
          <h3
            className="font-extrabold text-xs sm:text-[13px] text-[#073253] line-clamp-1 hover:text-[#FF850D] cursor-pointer"
            onClick={() => onSelect(product)}
            title={product.name}
          >
            {product.name}
          </h3>

          <div className="mt-0.5">
            {isPriceSet ? (
              <div className="flex items-baseline space-x-1">
                <span className="text-sm sm:text-[15px] font-black text-[#FF850D]">
                  {product.formattedPrice}
                </span>
                {product.previousPrice ? (
                  <span className="text-[10px] text-gray-400 line-through">
                    KSh {product.previousPrice}
                  </span>
                ) : null}
              </div>
            ) : (
              <div className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#FF850D] bg-orange-50 px-1.5 py-0.5 rounded">
                <Tag className="w-3 h-3" />
                <span>Contact for Price</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-[#667585] mt-0.5 mb-2">
            {product.unit}
          </p>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center space-x-1.5 bg-[#0BAA58] hover:bg-[#09934B] text-white text-[11px] font-bold py-1.5 px-2 rounded-md transition-colors shadow-sm"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-white flex-shrink-0" />
          <span className="truncate">Inquire on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

export default ProductCard;
