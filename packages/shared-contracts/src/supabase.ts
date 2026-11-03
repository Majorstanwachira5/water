import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  User,
  UserRole,
  Category,
  Product,
  CatalogProductItem,
  ProductPrice,
  PriceHistoryEntry,
  MediaAsset,
  Enquiry,
  EnquiryStatus,
  EnquiryNote,
  BrandSettings,
  AuditLog,
  DashboardMetrics,
} from './index';

// Default Supabase project configuration for Michaforge Enterprises
export const SUPABASE_CONFIG = {
  url:
    (typeof process !== 'undefined' &&
      (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)) ||
    'https://trpyjeeazksjecdsfnld.supabase.co',
  publishableKey:
    (typeof process !== 'undefined' &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.SUPABASE_PUBLISHABLE_KEY ||
        process.env.SUPABASE_ANON_KEY)) ||
    'sb_publishable_FX8pWAYEbdCwwp6-VxXUCw_nElYevkZ',
};

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  // Ensure Node 20 without global WebSocket doesn't throw when initializing RealtimeClient
  if (typeof globalThis !== 'undefined' && typeof (globalThis as any).WebSocket === 'undefined') {
    (globalThis as any).WebSocket = class DummyWebSocket {};
  }

  cachedClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

// ─────────────────────────────────────────────────────────────────────────────
// Row Mappers (snake_case DB rows <-> camelCase Shared Contracts)
// ─────────────────────────────────────────────────────────────────────────────

export interface UserDbRecord extends User {
  passwordHash: string;
  salt: string;
}

function mapUserRow(row: any): UserDbRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as UserRole,
    isActive: row.is_active,
    passwordHash: row.password_hash,
    salt: row.salt,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at || undefined,
  };
}

export function toSafeUser(u: UserDbRecord): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    lastLoginAt: u.lastLoginAt,
  };
}

function mapCategoryRow(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    iconName: row.icon_name || 'pipe',
    imageUrl: row.image_url || '',
    displayOrder: Number(row.display_order ?? 1),
    isPublished: Boolean(row.is_published ?? true),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProductRow(row: any, categoriesMap?: Record<string, Category>): Product {
  const catId = row.category_id || '';
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    description: row.description || '',
    shortDescription: row.short_description || '',
    categoryId: catId,
    category: categoriesMap ? categoriesMap[catId] : undefined,
    unit: row.unit || 'each',
    status: row.status || 'published',
    isFeatured: Boolean(row.is_featured),
    featuredOrder: row.featured_order !== null ? Number(row.featured_order) : undefined,
    images: Array.isArray(row.images) ? row.images : [],
    specifications: Array.isArray(row.specifications) ? row.specifications : [],
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at || undefined,
  };
}

function mapPriceRow(row: any): ProductPrice {
  return {
    id: row.id,
    productId: row.product_id,
    price: row.price !== null && row.price !== undefined ? Number(row.price) : null,
    previousPrice:
      row.previous_price !== null && row.previous_price !== undefined
        ? Number(row.previous_price)
        : null,
    currency: row.currency || 'KES',
    unit: row.unit || 'each',
    effectiveDate: row.effective_date,
    updatedBy: row.updated_by || 'Administrator',
    reason: row.reason || undefined,
    updatedAt: row.updated_at,
  };
}

function mapPriceHistoryRow(row: any): PriceHistoryEntry {
  return {
    id: row.id,
    productId: row.product_id,
    previousPrice:
      row.previous_price !== null && row.previous_price !== undefined
        ? Number(row.previous_price)
        : null,
    newPrice:
      row.new_price !== null && row.new_price !== undefined ? Number(row.new_price) : null,
    currency: row.currency || 'KES',
    changedBy: row.changed_by || 'Administrator',
    reason: row.reason || undefined,
    timestamp: row.timestamp,
  };
}

function mapMediaRow(row: any): MediaAsset {
  return {
    id: row.id,
    fileName: row.file_name,
    originalName: row.original_name,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes ?? 0),
    url: row.url,
    altText: row.alt_text || '',
    category: row.category || 'general',
    uploadedBy: row.uploaded_by || 'Administrator',
    createdAt: row.created_at,
  };
}

function mapEnquiryRow(row: any): Enquiry {
  return {
    id: row.id,
    customerName: row.customer_name,
    phoneNumber: row.phone_number,
    email: row.email || undefined,
    enquiryType: row.enquiry_type || 'general',
    productId: row.product_id || undefined,
    productName: row.product_name || undefined,
    productSku: row.product_sku || undefined,
    message: row.message,
    status: (row.status || 'New') as EnquiryStatus,
    assignedTo: row.assigned_to || undefined,
    notes: Array.isArray(row.notes) ? row.notes : [],
    followUps: Array.isArray(row.follow_ups) ? row.follow_ups : [],
    source: row.source || 'website_form',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAuditRow(row: any): AuditLog {
  return {
    id: row.id,
    actorId: row.actor_id,
    actorName: row.actor_name,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id || '',
    details: row.details || undefined,
    timestamp: row.timestamp,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Auth Repository (Supabase)
// ─────────────────────────────────────────────────────────────────────────────

export const supabaseAuthRepo = {
  async findUserByEmail(email: string): Promise<UserDbRecord | null> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('users')
      .select('*')
      .ilike('email', email.trim())
      .maybeSingle();
    if (error || !data) return null;
    return mapUserRow(data);
  },

  async findUserById(id: string): Promise<UserDbRecord | null> {
    const sb = getSupabaseClient();
    const { data, error } = await sb.from('users').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return mapUserRow(data);
  },

  async listUsers(): Promise<User[]> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });
    if (error || !data) return [];
    return data.map((r) => toSafeUser(mapUserRow(r)));
  },

  async createUser(record: UserDbRecord): Promise<User> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('users')
      .insert({
        id: record.id,
        email: record.email,
        name: record.name,
        role: record.role,
        is_active: record.isActive,
        password_hash: record.passwordHash,
        salt: record.salt,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return toSafeUser(mapUserRow(data));
  },

  async updateLastLogin(id: string): Promise<string> {
    const sb = getSupabaseClient();
    const now = new Date().toISOString();
    await sb.from('users').update({ last_login_at: now, updated_at: now }).eq('id', id);
    return now;
  },

  async saveRefreshToken(token: string, userId: string): Promise<void> {
    const sb = getSupabaseClient();
    await sb.from('refresh_tokens').upsert({ token, user_id: userId });
  },

  async hasRefreshToken(token: string): Promise<boolean> {
    const sb = getSupabaseClient();
    const { data } = await sb
      .from('refresh_tokens')
      .select('token')
      .eq('token', token)
      .maybeSingle();
    return !!data;
  },

  async removeRefreshToken(token: string): Promise<void> {
    const sb = getSupabaseClient();
    await sb.from('refresh_tokens').delete().eq('token', token);
  },

  async deleteRefreshToken(token: string): Promise<void> {
    return this.removeRefreshToken(token);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Catalogue Repository (Supabase)
// ─────────────────────────────────────────────────────────────────────────────

export const supabaseCatalogueRepo = {
  async listCategories(): Promise<Category[]> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    if (error || !data) return [];
    return data.map(mapCategoryRow);
  },

  async createCategory(cat: Category): Promise<Category> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('categories')
      .insert({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon_name: cat.iconName,
        image_url: cat.imageUrl || '',
        display_order: cat.displayOrder,
        is_published: cat.isPublished,
        created_at: cat.createdAt,
        updated_at: cat.updatedAt,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return mapCategoryRow(data);
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const sb = getSupabaseClient();
    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.iconName !== undefined) payload.icon_name = updates.iconName;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
    if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
    if (updates.isPublished !== undefined) payload.is_published = updates.isPublished;

    const { data, error } = await sb
      .from('categories')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error || !data) return null;
    return mapCategoryRow(data);
  },

  async deleteCategory(id: string): Promise<void> {
    const sb = getSupabaseClient();
    await sb.from('categories').delete().eq('id', id);
  },

  async listProducts(filters?: {
    categoryId?: string;
    status?: string;
    search?: string;
    featured?: boolean;
  }): Promise<Product[]> {
    const sb = getSupabaseClient();
    const [catRes, prodRes] = await Promise.all([
      sb.from('categories').select('*'),
      sb.from('products').select('*').order('featured_order', { ascending: true, nullsFirst: false }),
    ]);

    const catMap: Record<string, Category> = {};
    if (catRes.data) {
      for (const c of catRes.data) {
        catMap[c.id] = mapCategoryRow(c);
      }
    }

    let items = (prodRes.data || []).map((r) => mapProductRow(r, catMap));

    if (filters?.status) {
      items = items.filter((p) => p.status === filters.status);
    }
    if (filters?.categoryId) {
      items = items.filter((p) => p.categoryId === filters.categoryId);
    }
    if (filters?.featured) {
      items = items.filter((p) => p.isFeatured);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return items;
  },

  async getProductById(id: string): Promise<Product | null> {
    const sb = getSupabaseClient();
    const { data, error } = await sb.from('products').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    const categories = await this.listCategories();
    const catMap: Record<string, Category> = {};
    categories.forEach((c) => (catMap[c.id] = c));
    return mapProductRow(data, catMap);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const sb = getSupabaseClient();
    const { data, error } = await sb.from('products').select('*').eq('slug', slug).maybeSingle();
    if (error || !data) return null;
    const categories = await this.listCategories();
    const catMap: Record<string, Category> = {};
    categories.forEach((c) => (catMap[c.id] = c));
    return mapProductRow(data, catMap);
  },

  async createProduct(prod: Product): Promise<Product> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('products')
      .insert({
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        description: prod.description || '',
        short_description: prod.shortDescription || '',
        category_id: prod.categoryId,
        unit: prod.unit,
        status: prod.status || 'published',
        is_featured: prod.isFeatured,
        featured_order: prod.featuredOrder ?? null,
        images: prod.images || [],
        specifications: prod.specifications || [],
        seo_title: prod.seoTitle ?? null,
        seo_description: prod.seoDescription ?? null,
        created_at: prod.createdAt,
        updated_at: prod.updatedAt,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return mapProductRow(data);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const sb = getSupabaseClient();
    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.sku !== undefined) payload.sku = updates.sku;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.shortDescription !== undefined) payload.short_description = updates.shortDescription;
    if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
    if (updates.unit !== undefined) payload.unit = updates.unit;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.isFeatured !== undefined) payload.is_featured = updates.isFeatured;
    if (updates.featuredOrder !== undefined) payload.featured_order = updates.featuredOrder;
    if (updates.images !== undefined) payload.images = updates.images;
    if (updates.specifications !== undefined) payload.specifications = updates.specifications;
    if (updates.archivedAt !== undefined) payload.archived_at = updates.archivedAt;

    const { data, error } = await sb
      .from('products')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error || !data) return null;
    return mapProductRow(data);
  },

  async archiveProduct(id: string): Promise<boolean> {
    const now = new Date().toISOString();
    const updated = await this.updateProduct(id, {
      status: 'archived',
      archivedAt: now,
    });
    return !!updated;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Pricing Repository (Supabase)
// ─────────────────────────────────────────────────────────────────────────────

export const supabasePricingRepo = {
  async listPrices(): Promise<ProductPrice[]> {
    const sb = getSupabaseClient();
    const { data, error } = await sb.from('product_prices').select('*');
    if (error || !data) return [];
    return data.map(mapPriceRow);
  },

  async getPriceByProductId(productId: string): Promise<ProductPrice | null> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('product_prices')
      .select('*')
      .eq('product_id', productId)
      .maybeSingle();
    if (error || !data) return null;
    return mapPriceRow(data);
  },

  async upsertPrice(
    record: ProductPrice,
    historyEntry?: PriceHistoryEntry
  ): Promise<ProductPrice> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('product_prices')
      .upsert(
        {
          id: record.id,
          product_id: record.productId,
          price: record.price,
          previous_price: record.previousPrice,
          currency: record.currency || 'KES',
          unit: record.unit || 'each',
          effective_date: record.effectiveDate,
          updated_by: record.updatedBy,
          reason: record.reason || null,
          updated_at: record.updatedAt,
        },
        { onConflict: 'product_id' }
      )
      .select('*')
      .single();

    if (error) throw new Error(error.message);

    if (historyEntry) {
      await sb.from('price_history').insert({
        id: historyEntry.id,
        product_id: historyEntry.productId,
        previous_price: historyEntry.previousPrice,
        new_price: historyEntry.newPrice,
        currency: historyEntry.currency || 'KES',
        changed_by: historyEntry.changedBy,
        reason: historyEntry.reason || null,
        timestamp: historyEntry.timestamp,
      });
    }

    return mapPriceRow(data);
  },

  async getProductPriceHistory(productId: string): Promise<PriceHistoryEntry[]> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('price_history')
      .select('*')
      .eq('product_id', productId)
      .order('timestamp', { ascending: false });
    if (error || !data) return [];
    return data.map(mapPriceHistoryRow);
  },

  async listPriceHistory(limit = 100): Promise<PriceHistoryEntry[]> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('price_history')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map(mapPriceHistoryRow);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Media Repository (Supabase)
// ─────────────────────────────────────────────────────────────────────────────

export const supabaseMediaRepo = {
  async listMediaAssets(filters?: { category?: string; search?: string }): Promise<MediaAsset[]> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    let list = data.map(mapMediaRow);
    if (filters?.category) {
      list = list.filter((a) => a.category === filters.category);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.altText.toLowerCase().includes(q) || a.originalName.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async createMediaAsset(asset: MediaAsset): Promise<MediaAsset> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('media_assets')
      .insert({
        id: asset.id,
        file_name: asset.fileName,
        original_name: asset.originalName,
        mime_type: asset.mimeType,
        size_bytes: asset.sizeBytes,
        url: asset.url,
        alt_text: asset.altText,
        category: asset.category || 'general',
        uploaded_by: asset.uploadedBy,
        created_at: asset.createdAt,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return mapMediaRow(data);
  },

  async updateMediaAsset(
    id: string,
    updates: { altText?: string; category?: MediaAsset['category'] }
  ): Promise<MediaAsset | null> {
    const sb = getSupabaseClient();
    const payload: Record<string, any> = {};
    if (updates.altText !== undefined) payload.alt_text = updates.altText;
    if (updates.category !== undefined) payload.category = updates.category;
    const { data, error } = await sb
      .from('media_assets')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error || !data) return null;
    return mapMediaRow(data);
  },

  async deleteMediaAsset(id: string): Promise<MediaAsset | null> {
    const sb = getSupabaseClient();
    const { data } = await sb.from('media_assets').select('*').eq('id', id).maybeSingle();
    if (!data) return null;
    await sb.from('media_assets').delete().eq('id', id);
    return mapMediaRow(data);
  },

  async listAssets(filters?: { category?: string; search?: string }): Promise<MediaAsset[]> {
    return this.listMediaAssets(filters);
  },

  async createAsset(asset: MediaAsset): Promise<MediaAsset> {
    return this.createMediaAsset(asset);
  },

  async updateAsset(
    id: string,
    updates: { altText?: string; category?: MediaAsset['category'] }
  ): Promise<MediaAsset | null> {
    return this.updateMediaAsset(id, updates);
  },

  async deleteAsset(id: string): Promise<MediaAsset | null> {
    return this.deleteMediaAsset(id);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Enquiry Repository (Supabase)
// ─────────────────────────────────────────────────────────────────────────────

export const supabaseEnquiryRepo = {
  async listEnquiries(filters?: { status?: string; search?: string }): Promise<Enquiry[]> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    let list = data.map(mapEnquiryRow);
    if (filters?.status) {
      list = list.filter((e) => e.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.customerName.toLowerCase().includes(q) ||
          e.phoneNumber.includes(q) ||
          (e.productName && e.productName.toLowerCase().includes(q))
      );
    }
    return list;
  },

  async getEnquiryById(id: string): Promise<Enquiry | null> {
    const sb = getSupabaseClient();
    const { data, error } = await sb.from('enquiries').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return mapEnquiryRow(data);
  },

  async createEnquiry(enq: Enquiry): Promise<Enquiry> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('enquiries')
      .insert({
        id: enq.id,
        customer_name: enq.customerName,
        phone_number: enq.phoneNumber,
        email: enq.email || null,
        enquiry_type: enq.enquiryType,
        product_id: enq.productId || null,
        product_name: enq.productName || null,
        product_sku: enq.productSku || null,
        message: enq.message,
        status: enq.status,
        source: enq.source,
        notes: enq.notes || [],
        follow_ups: enq.followUps || [],
        created_at: enq.createdAt,
        updated_at: enq.updatedAt,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return mapEnquiryRow(data);
  },

  async updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<Enquiry | null> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('enquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error || !data) return null;
    return mapEnquiryRow(data);
  },

  async addEnquiryNote(id: string, note: EnquiryNote): Promise<EnquiryNote | null> {
    const existing = await this.getEnquiryById(id);
    if (!existing) return null;
    const updatedNotes = [note, ...(existing.notes || [])];
    const sb = getSupabaseClient();
    const { error } = await sb
      .from('enquiries')
      .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return null;
    return note;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Content & Brand Settings Repository (Supabase)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_BRAND: BrandSettings = {
  businessName: 'MICHAFORGE ENTERPRISES',
  tagline: 'DEALERS IN ALL PLUMBING MATERIALS',
  primaryPhone: '0714843208',
  primaryPhoneFormatted: '+254714843208',
  whatsappNumber: '+254714843208',
  smsNumber: '+254714843208',
  email: 'info@michaforge.co.ke',
  address: 'Nairobi, Kenya',
  country: 'Kenya',
  currency: 'KES',
  timezone: 'Africa/Nairobi',
  logoUrl: '/images/logo_clean.svg',
  logoWhiteUrl: '/images/logo_clean_white.svg',
  faviconUrl: '/favicon.ico',
  heroHeadline: 'Quality Plumbing & Hardware Materials',
  heroSubheadline: 'WELCOME TO MICHAFORGE ENTERPRISES',
  heroDescription:
    'Your trusted supplier of plumbing materials, pipes, fittings, taps, valves and all hardware essentials.',
  heroImageUrl: '/images/modern_hardware_hero.png',
  announcementText: 'Quality Plumbing & Hardware Solutions',
  colors: {
    deepNavy: '#073253',
    primaryNavy: '#0B3556',
    orange: '#FF850D',
    redLogoAccent: '#D92D36',
    white: '#FFFFFF',
    lightGrey: '#F5F7FA',
    borderGrey: '#DFE5EB',
    whatsAppGreen: '#0BAA58',
    darkText: '#172B3A',
    mutedText: '#667585',
  },
};

const DEFAULT_ABOUT = {
  title: 'About Michaforge Enterprises',
  description:
    'Michaforge Enterprises is a premier supplier of quality plumbing materials and hardware essentials in Kenya. We provide dependable, contractor-grade piping solutions, precision fittings, reliable taps, and flow control valves to builders, homeowners, and trade professionals.',
  features: [
    {
      title: 'Genuine Quality',
      desc: 'High standard pipes and fittings engineered for durability and reliable performance.',
    },
    {
      title: 'Comprehensive Stock',
      desc: 'Full range of PVC, PPR, taps, valves, water tanks, and essential hardware items.',
    },
    {
      title: 'Direct WhatsApp Support',
      desc: 'Instant quotations, technical sizing advice, and responsive customer assistance.',
    },
  ],
};

export const supabaseContentRepo = {
  async getSiteContent(): Promise<{ brand: BrandSettings; aboutContent: typeof DEFAULT_ABOUT }> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('site_content')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();
    if (error || !data) {
      return { brand: DEFAULT_BRAND, aboutContent: DEFAULT_ABOUT };
    }
    return {
      brand: { ...DEFAULT_BRAND, ...(data.brand || {}) },
      aboutContent: { ...DEFAULT_ABOUT, ...(data.about_content || {}) },
    };
  },

  async updateBranding(updates: Partial<BrandSettings>): Promise<BrandSettings> {
    const current = await this.getSiteContent();
    const updatedBrand = { ...current.brand, ...updates };
    const sb = getSupabaseClient();
    await sb.from('site_content').upsert({
      id: 'default',
      brand: updatedBrand,
      about_content: current.aboutContent,
      updated_at: new Date().toISOString(),
    });
    return updatedBrand;
  },

  async updateHomepageContent(updates: {
    heroHeadline?: string;
    heroSubheadline?: string;
    heroDescription?: string;
    heroImageUrl?: string;
    announcementText?: string;
    about?: Partial<typeof DEFAULT_ABOUT>;
  }): Promise<{ brand: BrandSettings; about: typeof DEFAULT_ABOUT }> {
    const current = await this.getSiteContent();
    const brand = { ...current.brand };
    if (updates.heroHeadline !== undefined) brand.heroHeadline = updates.heroHeadline;
    if (updates.heroSubheadline !== undefined) brand.heroSubheadline = updates.heroSubheadline;
    if (updates.heroDescription !== undefined) brand.heroDescription = updates.heroDescription;
    if (updates.heroImageUrl !== undefined) brand.heroImageUrl = updates.heroImageUrl;
    if (updates.announcementText !== undefined) brand.announcementText = updates.announcementText;

    const aboutContent = updates.about
      ? { ...current.aboutContent, ...updates.about }
      : current.aboutContent;

    const sb = getSupabaseClient();
    await sb.from('site_content').upsert({
      id: 'default',
      brand,
      about_content: aboutContent,
      updated_at: new Date().toISOString(),
    });
    return { brand, about: aboutContent };
  },

  async getBrandSettings(): Promise<BrandSettings> {
    const content = await this.getSiteContent();
    return content.brand;
  },

  async getAboutContent(): Promise<typeof DEFAULT_ABOUT> {
    const content = await this.getSiteContent();
    return content.aboutContent;
  },

  async updateBrandSettings(updates: Partial<BrandSettings>): Promise<BrandSettings> {
    return this.updateBranding(updates);
  },

  async updateAboutContent(updates: Partial<typeof DEFAULT_ABOUT>): Promise<typeof DEFAULT_ABOUT> {
    const res = await this.updateHomepageContent({ about: updates });
    return res.about;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. Reporting & Audit Repository (Supabase)
// ─────────────────────────────────────────────────────────────────────────────

export const supabaseReportingRepo = {
  async getOverviewMetrics(): Promise<DashboardMetrics> {
    const [products, categories, prices, history, enquiries] = await Promise.all([
      supabaseCatalogueRepo.listProducts(),
      supabaseCatalogueRepo.listCategories(),
      supabasePricingRepo.listPrices(),
      supabasePricingRepo.listPriceHistory(100),
      supabaseEnquiryRepo.listEnquiries(),
    ]);

    const priceMap: Record<string, ProductPrice> = {};
    for (const p of prices) {
      priceMap[p.productId] = p;
    }

    const publishedProducts = products.filter((p) => p.status === 'published');
    const archivedProducts = products.filter((p) => p.status === 'archived');
    const unpricedProductsCount = publishedProducts.filter((p) => {
      const prc = priceMap[p.id];
      return !prc || prc.price === null || prc.price === undefined || prc.price <= 0;
    }).length;

    return {
      totalProducts: products.length,
      publishedProducts: publishedProducts.length,
      archivedProducts: archivedProducts.length,
      categoriesCount: categories.length,
      unpricedProductsCount,
      recentPriceChangesCount: history.length,
      newEnquiriesCount: enquiries.filter((e) => e.status === 'New').length,
      pendingEnquiriesCount: enquiries.filter((e) =>
        ['New', 'Contacted', 'Awaiting Customer'].includes(e.status)
      ).length,
      totalEnquiries: enquiries.length,
    };
  },

  async listAuditLogs(limit = 100): Promise<AuditLog[]> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map(mapAuditRow);
  },

  async createAuditLog(entry: AuditLog): Promise<AuditLog> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('audit_logs')
      .insert({
        id: entry.id,
        actor_id: entry.actorId,
        actor_name: entry.actorName,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        details: entry.details || null,
        timestamp: entry.timestamp,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return mapAuditRow(data);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Notification Repository (Supabase)
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationDbRecord {
  id: string;
  channel: 'email' | 'sms' | 'whatsapp';
  recipient: string;
  subject?: string;
  message: string;
  status: 'sent' | 'queued' | 'failed' | 'simulated';
  provider: string;
  createdAt: string;
}

export const supabaseNotificationRepo = {
  async listNotifications(limit = 50): Promise<NotificationDbRecord[]> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      channel: r.channel,
      recipient: r.recipient,
      subject: r.subject || undefined,
      message: r.message,
      status: r.status,
      provider: r.provider,
      createdAt: r.created_at,
    }));
  },

  async createNotification(record: NotificationDbRecord): Promise<NotificationDbRecord> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('notifications')
      .insert({
        id: record.id,
        channel: record.channel,
        recipient: record.recipient,
        subject: record.subject || null,
        message: record.message,
        status: record.status,
        provider: record.provider,
        created_at: record.createdAt,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      channel: data.channel,
      recipient: data.recipient,
      subject: data.subject || undefined,
      message: data.message,
      status: data.status,
      provider: data.provider,
      createdAt: data.created_at,
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. Catalog Aggregator (Combines Products + Categories + Pricing from Supabase)
// ─────────────────────────────────────────────────────────────────────────────

function formatPriceValue(price: number | null | undefined, currency = 'KES'): string {
  if (price === null || price === undefined || isNaN(price) || price <= 0) {
    return 'Contact for Price';
  }
  const prefix = currency === 'KES' ? 'KSh' : currency;
  return `${prefix} ${price.toLocaleString('en-KE')}`;
}

export const supabaseCatalogAggregator = {
  async getAggregatedProducts(opts?: {
    categoryId?: string;
    search?: string;
    featured?: string | boolean;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: CatalogProductItem[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const isFeatured =
      opts?.featured === true || opts?.featured === 'true' ? true : undefined;
    const [productsList, prices] = await Promise.all([
      supabaseCatalogueRepo.listProducts({
        categoryId: opts?.categoryId,
        search: opts?.search,
        featured: isFeatured,
        status: opts?.status || 'published',
      }),
      supabasePricingRepo.listPrices(),
    ]);

    const priceMap = new Map<string, ProductPrice>();
    for (const p of prices) {
      priceMap.set(p.productId, p);
    }

    const aggregated: CatalogProductItem[] = productsList.map((prod) => {
      const pr = priceMap.get(prod.id);
      const priceVal = pr ? pr.price : null;
      const currency = pr?.currency || 'KES';
      const hasPrice = priceVal !== null && priceVal !== undefined && priceVal > 0;
      return {
        ...prod,
        price: priceVal,
        previousPrice: pr ? pr.previousPrice : null,
        currency,
        priceDisplayState: hasPrice ? 'configured' : 'contact_for_price',
        formattedPrice: formatPriceValue(priceVal, currency),
      };
    });

    const page = Number(opts?.page || 1);
    const limit = Number(opts?.limit || 50);
    const start = (page - 1) * limit;
    const paginated = aggregated.slice(start, start + limit);

    return {
      data: paginated,
      meta: {
        page,
        limit,
        total: aggregated.length,
        totalPages: Math.max(1, Math.ceil(aggregated.length / limit)),
      },
    };
  },

  async getAggregatedProductBySlug(slug: string): Promise<CatalogProductItem | null> {
    const prod = await supabaseCatalogueRepo.getProductBySlug(slug);
    if (!prod) return null;
    const pr = await supabasePricingRepo.getPriceByProductId(prod.id);
    const priceVal = pr ? pr.price : null;
    const currency = pr?.currency || 'KES';
    const hasPrice = priceVal !== null && priceVal !== undefined && priceVal > 0;
    return {
      ...prod,
      price: priceVal,
      previousPrice: pr ? pr.previousPrice : null,
      currency,
      priceDisplayState: hasPrice ? 'configured' : 'contact_for_price',
      formattedPrice: formatPriceValue(priceVal, currency),
    };
  },
};
