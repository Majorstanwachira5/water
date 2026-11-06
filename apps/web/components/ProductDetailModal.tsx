'use client';

import React from 'react';
import { X, MessageCircle, Phone, Tag } from 'lucide-react';
import { CatalogProductItem } from '@michaforge/shared-contracts';
import { generateWhatsAppLink } from '@michaforge/shared-validation';

interface ProductDetailModalProps {
  product: CatalogProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
  businessPhone?: string;
  secondaryPhone?: string;
  secondaryWhatsappNumber?: string;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  whatsappNumber = '+254714843208',
  businessPhone = '0714843208',
  secondaryPhone = '0721435772',
  secondaryWhatsappNumber = '+254721435772',
}: ProductDetailModalProps) {
  const [selectedImg, setSelectedImg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImg(product.images.find((img) => img.isPrimary)?.url || product.images[0].url);
    } else {
      setSelectedImg(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const displayImage =
    selectedImg ||
    (product.images && product.images.length > 0
      ? product.images.find((img) => img.isPrimary)?.url || product.images[0].url
      : '/images/products/product_synnova_urinal.png');

  const primaryWaUrl = generateWhatsAppLink(whatsappNumber, product.name, product.sku);
  const secondaryWaUrl = generateWhatsAppLink(secondaryWhatsappNumber, product.name, product.sku);
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
          {/* Edge-to-edge Image area with optional gallery thumbnails */}
          <div className="flex flex-col space-y-3">
            <div className="bg-[#F8FAFB] rounded-xl overflow-hidden flex items-center justify-center border border-[#DFE5EB]">
              <img
                src={displayImage}
                alt={product.name}
                className="w-full h-64 sm:h-72 object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/products/product_synnova_urinal.png';
                }}
              />
            </div>

            {/* Multiple Angle Gallery Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setSelectedImg(img.url)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      displayImage === img.url
                        ? 'border-[#FF850D] shadow-md scale-105'
                        : 'border-[#DFE5EB] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.altText || `View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
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

            {/* Action Buttons: WhatsApp & Direct Call (Both Lines Supported) */}
            <div className="space-y-2 pt-2">
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">
                Contact Our Desk
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={primaryWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 bg-[#0BAA58] hover:bg-[#09934B] text-white font-bold py-2.5 px-3 rounded-xl shadow-xs transition-all text-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp: {businessPhone}</span>
                </a>

                <a
                  href={secondaryWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 bg-[#0BAA58] hover:bg-[#09934B] text-white font-bold py-2.5 px-3 rounded-xl shadow-xs transition-all text-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp: {secondaryPhone}</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${whatsappNumber}`}
                  className="inline-flex items-center justify-center space-x-1.5 bg-[#073253] hover:bg-[#0B3556] text-white font-semibold py-2 px-3 rounded-xl transition-all text-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-[#FF850D]" />
                  <span>Call: {businessPhone}</span>
                </a>

                <a
                  href={`tel:${secondaryWhatsappNumber}`}
                  className="inline-flex items-center justify-center space-x-1.5 bg-[#073253] hover:bg-[#0B3556] text-white font-semibold py-2 px-3 rounded-xl transition-all text-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-[#FF850D]" />
                  <span>Call: {secondaryPhone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
