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

// Fallback products matching the flyer if network cold-starts
const FALLBACK_PRODUCTS: CatalogProductItem[] = [
  {
    id: 'prd_pvc_4in',
    name: 'PVC Pipes (4")',
    slug: 'pvc-pipes-4-inch',
    sku: 'MF-PVC-004',
    description: 'High-grade 4-inch heavy duty PVC drainage and waste water pipe. Weather resistant, durable and reliable.',
    categoryId: 'cat_pvc_pipes',
    unit: 'per 6 m length',
    status: 'published',
    isFeatured: true,
    price: null, // "Contact for Price" until owner inputs
    currency: 'KES',
    priceDisplayState: 'contact_for_price',
    formattedPrice: 'Contact for Price',
    images: [{ id: '1', url: '/images/products/product_pvc_pipes.png', altText: 'PVC Pipes', displayOrder: 1, isPrimary: true }],
    specifications: [{ id: 's1', key: 'Diameter', value: '4" (110mm)' }],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'prd_pipe_fittings_ast',
    name: 'Pipe Fittings (Assorted)',
    slug: 'pipe-fittings-assorted',
    sku: 'MF-FIT-001',
    description: 'Wide selection of assorted PVC, PPR, and HDPE pipe fittings: elbows, tees, couplers, and reducers.',
    categoryId: 'cat_pipe_fittings',
    unit: 'per piece',
    status: 'published',
    isFeatured: true,
    price: null,
    currency: 'KES',
    priceDisplayState: 'contact_for_price',
    formattedPrice: 'Contact for Price',
    images: [{ id: '2', url: '/images/products/product_pipe_fittings.png', altText: 'Pipe Fittings', displayOrder: 1, isPrimary: true }],
    specifications: [{ id: 's2', key: 'Types', value: 'Elbows, Tees, Unions' }],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'prd_bib_cock_tap',
    name: 'Bib Cock Tap',
    slug: 'bib-cock-tap',
    sku: 'MF-TAP-001',
    description: 'Solid chrome-plated brass bib cock tap. Corrosion resistant with smooth quarter-turn water control.',
    categoryId: 'cat_taps_faucets',
    unit: 'each',
    status: 'published',
    isFeatured: true,
    price: null,
    currency: 'KES',
    priceDisplayState: 'contact_for_price',
    formattedPrice: 'Contact for Price',
    images: [{ id: '3', url: '/images/products/product_bib_cock.png', altText: 'Bib Cock Tap', displayOrder: 1, isPrimary: true }],
    specifications: [{ id: 's3', key: 'Material', value: 'Chrome Plated Brass' }],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'prd_brass_ball_valve',
    name: 'Brass Ball Valve',
    slug: 'brass-ball-valve',
    sku: 'MF-VLV-001',
    description: 'Heavy duty brass ball valve with lever handle. Perfect for main water line shut-off and high pressure flow control.',
    categoryId: 'cat_valves',
    unit: 'each',
    status: 'published',
    isFeatured: true,
    price: null,
    currency: 'KES',
    priceDisplayState: 'contact_for_price',
    formattedPrice: 'Contact for Price',
    images: [{ id: '4', url: '/images/products/product_brass_valve.png', altText: 'Brass Ball Valve', displayOrder: 1, isPrimary: true }],
    specifications: [{ id: 's4', key: 'Pressure', value: 'PN25 High Pressure' }],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'prd_water_tank_1000l',
    name: 'Water Tank (1,000L)',
    slug: 'water-tank-1000l',
    sku: 'MF-TNK-001',
    description: 'Heavy duty cylindrical food-grade polyethylene water storage tank with UV protection.',
    categoryId: 'cat_water_tanks',
    unit: 'each',
    status: 'published',
    isFeatured: true,
    price: null,
    currency: 'KES',
    priceDisplayState: 'contact_for_price',
    formattedPrice: 'Contact for Price',
    images: [{ id: '5', url: '/images/products/product_water_tank.png', altText: 'Water Tank 1,000L', displayOrder: 1, isPrimary: true }],
    specifications: [{ id: 's5', key: 'Capacity', value: '1,000 Litres' }],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'prd_hardware_accessories',
    name: 'Hardware Accessories',
    slug: 'hardware-accessories',
    sku: 'MF-HDW-001',
    description: 'Essential plumbing installation hardware: PTFE thread tape, pipe wrenches, hacksaws, and solvent cement.',
    categoryId: 'cat_hardware_items',
    unit: 'per item',
    status: 'published',
    isFeatured: true,
    price: null,
    currency: 'KES',
    priceDisplayState: 'contact_for_price',
    formattedPrice: 'Contact for Price',
    images: [{ id: '6', url: '/images/products/product_hardware_accessories.png', altText: 'Hardware Accessories', displayOrder: 1, isPrimary: true }],
    specifications: [{ id: 's6', key: 'Application', value: 'Plumbing & Hardware' }],
    createdAt: '',
    updatedAt: '',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<CatalogProductItem[]>(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProductItem | null>(null);

  useEffect(() => {
    // 1. Fetch Aggregated Products
    fetch('/api/v1/catalog/products?featured=true')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          setProducts(json.data);
        }
      })
      .catch(() => {
        // Fallback already pre-set
      });

    // 2. Fetch Categories
    fetch('/api/v1/categories')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setCategories(json.data);
        }
      })
      .catch(() => {});

    // 3. Fetch Brand Settings
    fetch('/api/v1/settings/public')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setBrand(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const phone = brand?.primaryPhone || '0714843208';
  const whatsapp = brand?.whatsappNumber || '+254714843208';

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Header with Announcement Bar & Nav */}
      <Navbar businessPhone={phone} whatsappNumber={whatsapp} activePage="home" />

      {/* 2. Hero Section replicating flyer */}
      <main className="flex-grow">
        <Hero
          headline={brand?.heroHeadline}
          subheadline={brand?.heroSubheadline}
          description={brand?.heroDescription}
          whatsappNumber={whatsapp}
          heroImageUrl={brand?.heroImageUrl || '/images/hero_plumbing_supplies.png'}
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
        <ContactSection businessPhone={phone} whatsappNumber={whatsapp} />
      </main>

      {/* 7. Deep Navy Footer with M-PESA / VISA / Mastercard Badges */}
      <Footer businessPhone={phone} whatsappNumber={whatsapp} />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        whatsappNumber={whatsapp}
      />
    </div>
  );
}
