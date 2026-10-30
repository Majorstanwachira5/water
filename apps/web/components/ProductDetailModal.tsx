'use client';

import React from 'react';
import { X, MessageCircle, Phone, Tag, Check, ArrowRight } from 'lucide-react';
import { CatalogProductItem } from '@michaforge/shared-contracts';
import { generateWhatsAppLink } from '@michaforge/shared-validation';

interface ProductDetailModalProps {
  product: CatalogProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  whatsappNumber = '+254714843208',
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images.find((img) => img.isPrimary)?.url || product.images[0].url
      : '/images/products/product_pvc_pipes.png';

  const waUrl = generateWhatsAppLink(whatsappNumber, product.name, product.sku);
  const isPriceConfigured =
    product.price !== null && product.price !== undefined && product.price > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DFE5EB] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Image */}
          <div className="bg-[#F5F7FA] rounded-xl p-4 flex items-center justify-center border border-[#DFE5EB]">
            <img
              src={primaryImage}
              alt={product.name}
              className="max-h-64 max-w-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/flyer_upright.jpg';
              }}
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF850D] bg-orange-50 px-2 py-0.5 rounded">
                SKU: {product.sku}
              </span>

              <h3 className="text-2xl font-black text-[#073253] mt-2">
                {product.name}
              </h3>

              <p className="text-xs text-[#667585] mt-1 font-medium">
                Unit of Sale: <span className="text-[#172B3A]">{product.unit}</span>
              </p>

              {/* Price */}
              <div className="my-4 p-3 rounded-xl bg-[#F5F7FA] border border-[#DFE5EB] flex items-center justify-between">
                <span className="text-xs font-bold text-[#667585]">Current Price:</span>
                {isPriceConfigured ? (
                  <span className="text-xl font-extrabold text-[#073253]">
                    {product.formattedPrice}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-[#FF850D] flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Contact for Price</span>
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#172B3A] leading-relaxed">
                {product.description || product.shortDescription}
              </p>

              {/* Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-[#073253] mb-2 uppercase tracking-wider">
                    Specifications
                  </h4>
                  <div className="space-y-1">
                    {product.specifications.map((spec) => (
                      <div key={spec.id} className="flex text-xs">
                        <span className="w-24 text-gray-500 font-medium">{spec.key}:</span>
                        <span className="font-semibold text-gray-800">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 bg-[#0BAA58] hover:bg-[#09934B] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-sm"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Inquire on WhatsApp</span>
              </a>

              <a
                href={`tel:+254714843208`}
                className="w-full inline-flex items-center justify-center space-x-2 bg-[#073253] hover:bg-[#0B3556] text-white font-semibold py-2.5 px-4 rounded-xl transition-all text-xs"
              >
                <Phone className="w-4 h-4 text-[#FF850D]" />
                <span>Call Directly: 0714843208</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
