'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CategoryStrip from '../components/CategoryStrip';
import FeaturedProducts from '../components/FeaturedProducts';
import AboutSection from '../components/AboutSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import ProductDetailModal from '../components/ProductDetailModal';
import { CatalogProductItem, Category, BrandSettings } from '@michaforge/shared-contracts';

export default function HomePage() {
  const [products, setProducts] = useState<CatalogProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProductItem | null>(null);

  useEffect(() => {
    // 1. Fetch Aggregated Products from Supabase-backed API
    fetch('/api/v1/catalog/products?featured=true')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data);
        }
      })
      .catch((err) => console.error('[HomePage] Failed to fetch featured products:', err));

    // 2. Fetch Categories directly from Supabase
    fetch('/api/v1/categories')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      })
      .catch((err) => console.error('[HomePage] Failed to fetch categories:', err));

    // 3. Fetch Brand Settings directly from Supabase
    fetch('/api/v1/settings/public')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setBrand(json.data);
        }
      })
      .catch((err) => console.error('[HomePage] Failed to fetch site settings:', err));
  }, []);

  const phone = brand?.primaryPhone || '0714843208';
  const whatsapp = brand?.whatsappNumber || '+254714843208';
  const secondaryPhone = brand?.secondaryPhone || '0721435772';
  const secondaryWhatsapp = brand?.secondaryWhatsappNumber || '+254721435772';

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Header with Announcement Bar & Nav */}
      <Navbar
        businessPhone={phone}
        whatsappNumber={whatsapp}
        secondaryPhone={secondaryPhone}
        secondaryWhatsappNumber={secondaryWhatsapp}
        activePage="home"
      />

      {/* 2. Hero Section */}
      <main className="flex-grow">
        <Hero
          headline={brand?.heroHeadline}
          subheadline={brand?.heroSubheadline}
          description={brand?.heroDescription}
          whatsappNumber={whatsapp}
          heroImageUrl={brand?.heroImageUrl || '/images/about/showroom_display.png'}
        />

        {/* 3. Category Strip with Circular Icons */}
        <CategoryStrip categories={categories.length > 0 ? categories : undefined} />

        {/* 4. Featured Products Section */}
        <FeaturedProducts
          products={products}
          whatsappNumber={whatsapp}
          onOpenProductModal={(p) => setSelectedProduct(p)}
        />

        {/* 5. About Section */}
        <AboutSection />

        {/* 6. Contact Section with Call, SMS, WhatsApp & Enquiry Form */}
        <ContactSection
          businessPhone={phone}
          whatsappNumber={whatsapp}
          secondaryPhone={secondaryPhone}
          secondaryWhatsappNumber={secondaryWhatsapp}
        />
      </main>

      {/* 7. Compact Deep Navy Footer with M-PESA / VISA / Mastercard Badges */}
      <Footer
        businessPhone={phone}
        whatsappNumber={whatsapp}
        secondaryPhone={secondaryPhone}
        secondaryWhatsappNumber={secondaryWhatsapp}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        whatsappNumber={whatsapp}
        businessPhone={phone}
        secondaryPhone={secondaryPhone}
        secondaryWhatsappNumber={secondaryWhatsapp}
      />
    </div>
  );
}
