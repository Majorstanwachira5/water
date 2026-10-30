/**
 * MICHAFORGE ENTERPRISES — Shared Contracts & Data Types
 */

// --- API Standard Envelopes ---
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    requestId?: string;
    timestamp?: string;
  };
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    requestId: string;
    timestamp: string;
  };
}

// --- Auth & Identity ---
export type UserRole =
  | 'Super Admin'
  | 'Catalogue Manager'
  | 'Content Manager'
  | 'Enquiry Manager'
  | 'Viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// --- Catalogue ---
export type ProductStatus = 'draft' | 'published' | 'archived';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  imageUrl?: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSpecification {
  id: string;
  key: string;
  value: string;
}

export interface ProductMedia {
  id: string;
  url: string;
  altText: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  category?: Category;
  unit: string; // e.g. 'per 6m length', 'per piece', 'each', 'per item'
  status: ProductStatus;
  isFeatured: boolean;
  featuredOrder?: number;
  images: ProductMedia[];
  specifications: ProductSpecification[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

// Aggregated Product for Public Display (Includes dynamic price from Pricing Service)
export interface CatalogProductItem extends Product {
  price?: number | null; // null if unpriced
  previousPrice?: number | null;
  currency: string; // e.g. 'KES'
  priceDisplayState: 'configured' | 'contact_for_price';
  formattedPrice: string; // e.g. "KSh 650" or "Contact for Price"
}

// --- Pricing ---
export interface ProductPrice {
  id: string;
  productId: string;
  price: number | null; // In KES, integer or decimal representation
  previousPrice: number | null;
  currency: string;
  unit: string;
  effectiveDate: string;
  updatedBy: string;
  reason?: string;
  updatedAt: string;
}

export interface PriceHistoryEntry {
  id: string;
  productId: string;
  productName?: string;
  sku?: string;
  previousPrice: number | null;
  newPrice: number | null;
  currency: string;
  changedBy: string;
  reason?: string;
  timestamp: string;
}

export interface BulkPriceImportRow {
  sku: string;
  newPrice: number;
  unit?: string;
  reason?: string;
}

export interface BulkPriceImportResult {
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: { row: number; sku: string; error: string }[];
}

// --- Media ---
export interface MediaAsset {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  altText: string;
  category?: 'product' | 'brand' | 'banner' | 'category' | 'general';
  uploadedBy: string;
  createdAt: string;
}

// --- Enquiries ---
export type EnquiryStatus =
  | 'New'
  | 'Contacted'
  | 'Quoted'
  | 'Awaiting Customer'
  | 'Completed'
  | 'Closed';

export interface EnquiryNote {
  id: string;
  enquiryId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface EnquiryFollowUp {
  id: string;
  enquiryId: string;
  scheduledDate: string;
  notes: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  customerName: string;
  phoneNumber: string; // E.164 Kenyan format: +254...
  email?: string;
  enquiryType: 'product' | 'bulk_quote' | 'general';
  productId?: string;
  productName?: string;
  productSku?: string;
  message: string;
  status: EnquiryStatus;
  assignedTo?: string;
  notes?: EnquiryNote[];
  followUps?: EnquiryFollowUp[];
  source: 'website_form' | 'whatsapp_click' | 'phone_call' | 'sms_click';
  createdAt: string;
  updatedAt: string;
}

// --- Content & Brand Settings ---
export interface BrandSettings {
  businessName: string;
  tagline: string;
  primaryPhone: string; // e.g. "0714843208"
  primaryPhoneFormatted: string; // e.g. "+254714843208"
  whatsappNumber: string; // "+254714843208"
  smsNumber: string; // "+254714843208"
  email?: string;
  address?: string;
  country: string; // "Kenya"
  currency: string; // "KES"
  timezone: string; // "Africa/Nairobi"
  logoUrl: string;
  logoWhiteUrl?: string;
  faviconUrl: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroDescription: string;
  heroImageUrl: string;
  announcementText: string;
  colors: {
    deepNavy: string;
    primaryNavy: string;
    orange: string;
    redLogoAccent: string;
    white: string;
    lightGrey: string;
    borderGrey: string;
    whatsAppGreen: string;
    darkText: string;
    mutedText: string;
  };
}

// --- Audit & Reports ---
export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface DashboardMetrics {
  totalProducts: number;
  publishedProducts: number;
  archivedProducts: number;
  categoriesCount: number;
  unpricedProductsCount: number;
  recentPriceChangesCount: number;
  newEnquiriesCount: number;
  pendingEnquiriesCount: number;
  totalEnquiries: number;
}

// --- Domain Events ---
export interface DomainEvent<T = unknown> {
  eventId: string;
  eventType: string;
  timestamp: string;
  correlationId: string;
  payload: T;
}
