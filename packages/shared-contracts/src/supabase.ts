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
  AboutContent,
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

  // On the server side, allow SUPABASE_SERVICE_ROLE_KEY if present for privileged server operations
  const isServer = typeof window === 'undefined';
  const apiKey =
    (isServer && typeof process !== 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY) ||
    SUPABASE_CONFIG.publishableKey;

  cachedClient = createClient(SUPABASE_CONFIG.url, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

/**
 * Validates Supabase environment variables and returns a diagnostic report.
 */
export function validateSupabaseEnv(): {
  isValid: boolean;
  url: string;
  hasPublishableKey: boolean;
  hasServiceRoleKey: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const url =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      : undefined;
  const pubKey =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.SUPABASE_PUBLISHABLE_KEY ||
        process.env.SUPABASE_ANON_KEY
      : undefined;
  const servKey =
    typeof process !== 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined;

  if (!url) {
    warnings.push('NEXT_PUBLIC_SUPABASE_URL is not set; using project fallback.');
  }
  if (!pubKey) {
    warnings.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set; using project fallback.');
  }

  return {
    isValid: !!(url || SUPABASE_CONFIG.url) && !!(pubKey || SUPABASE_CONFIG.publishableKey),
    url: url || SUPABASE_CONFIG.url,
    hasPublishableKey: !!(pubKey || SUPABASE_CONFIG.publishableKey),
    hasServiceRoleKey: !!servKey,
    warnings,
  };
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
// 2. Catalogue Repository & Seed Defaults (Supabase)
// ─────────────────────────────────────────────────────────────────────────────

export function formatPriceValue(price: number | null | undefined, currency = 'KES'): string {
  if (price === null || price === undefined || isNaN(price) || price <= 0) {
    return 'Contact for Price';
  }
  const prefix = currency === 'KES' ? 'KSh' : currency;
  return `${prefix} ${price.toLocaleString('en-KE')}`;
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    "id": "cat_sanitary_ware",
    "name": "Sanitary Ware",
    "slug": "sanitary-ware",
    "description": "Urinals, Basins, Cisterns & Fittings",
    "iconName": "sanitary",
    "imageUrl": "/images/products/product_synnova_urinal.png",
    "displayOrder": 1,
    "isPublished": true,
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "cat_taps_faucets",
    "name": "Taps, Mixers & Shattafs",
    "slug": "taps-faucets",
    "description": "Kitchen, Basin Taps & Bidet Sprays",
    "iconName": "tap",
    "imageUrl": "/images/products/product_lirlee_basin_tap.png",
    "displayOrder": 2,
    "isPublished": true,
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "cat_shower_systems",
    "name": "Showers & Water Heating",
    "slug": "shower-systems",
    "description": "Instant Showers, Columns & Rain Heads",
    "iconName": "shower",
    "imageUrl": "/images/products/product_milano_instant_heater_shower.png",
    "displayOrder": 3,
    "isPublished": true,
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "cat_kitchen_sinks",
    "name": "Kitchen Sinks & Basins",
    "slug": "kitchen-sinks",
    "description": "Black Nano, Stainless Double & Single",
    "iconName": "sink",
    "imageUrl": "/images/products/product_black_nano_double_bowl_sink_faucet.png",
    "displayOrder": 4,
    "isPublished": true,
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "cat_plumbing_pipes",
    "name": "Pipes, Drainage & Traps",
    "slug": "plumbing-pipes",
    "description": "Magic Bend, Bottle Traps & PPR Kit",
    "iconName": "pipe",
    "imageUrl": "/images/products/product_kensplastic_magic_bend.png",
    "displayOrder": 5,
    "isPublished": true,
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "cat_hardware_items",
    "name": "Hardware, Locks & Accessories",
    "slug": "hardware-items",
    "description": "Mortise Locks, 6pc Sets & Towel Shelves",
    "iconName": "hardware",
    "imageUrl": "/images/products/product_wista_greek_key_mortise_lock.png",
    "displayOrder": 6,
    "isPublished": true,
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  }
];

export const DEFAULT_REAL_PRODUCTS: Product[] = [
  {
    "id": "prd_synnova_urinal",
    "name": "Synnova Wall-Hung Ceramic Urinal",
    "slug": "synnova-wall-hung-ceramic-urinal",
    "sku": "MF-SAN-001",
    "description": "Premium vitreous china white wall-hung urinal manufactured by Synnova. Engineered with a smooth hygienic glaze that resists stains and bacteria buildup. Features a targeted top flush inlet and efficient bottom drain outlet for water conservation in commercial buildings, hotels, institutions, and modern homes.",
    "shortDescription": "Premium vitreous china white wall-hung urinal by Synnova with stain-resistant glaze.",
    "categoryId": "cat_sanitary_ware",
    "unit": "each",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 1,
    "images": [
      {
        "id": "img_synnova_1",
        "url": "/images/products/product_synnova_urinal.png",
        "altText": "Synnova Wall-Hung Ceramic Urinal",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp1",
        "key": "Brand",
        "value": "Synnova"
      },
      {
        "id": "sp2",
        "key": "Mount Type",
        "value": "Wall-Hung / Wall Mounted"
      },
      {
        "id": "sp3",
        "key": "Material",
        "value": "Vitreous China Glazed Ceramic"
      },
      {
        "id": "sp4",
        "key": "Color",
        "value": "Gloss Alpine White"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_orient_urinal",
    "name": "Orient Ceramics Wall-Hung Urinal Bowl",
    "slug": "orient-ceramics-wall-hung-urinal",
    "sku": "MF-SAN-002",
    "description": "High-durability vitreous china ceramic urinal bowl by Orient Ceramics (Made in India). Heavy-duty build with protective edge rim, deep contoured basin to minimize splashing, and ultra-smooth surface for effortless sanitization and lasting gloss in high-traffic restrooms.",
    "shortDescription": "Heavy-duty Orient Ceramics vitreous china wall-hung urinal bowl (Made in India).",
    "categoryId": "cat_sanitary_ware",
    "unit": "each",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 2,
    "images": [
      {
        "id": "img_orient_1",
        "url": "/images/products/product_orient_urinal.png",
        "altText": "Orient Ceramics Wall-Hung Urinal Bowl",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp5",
        "key": "Brand",
        "value": "Orient Ceramics"
      },
      {
        "id": "sp6",
        "key": "Origin",
        "value": "Made in India"
      },
      {
        "id": "sp7",
        "key": "Mount Type",
        "value": "Wall Mounted"
      },
      {
        "id": "sp8",
        "key": "Material",
        "value": "Heavy Duty Vitreous China"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_kensplastic_kp12_flush_kit",
    "name": "Kensplastic KP-12 Dual Flush Cistern Mechanism & Fill Valve Kit",
    "slug": "kensplastic-kp12-dual-flush-cistern-mechanism",
    "sku": "MF-SAN-003",
    "description": "Universal KP-12 toilet cistern repair and replacement mechanism kit from Kensplastic. Includes adjustable height inlet fill valve with float, high-efficiency dual-flush drop valve with chrome push button, and durable silicone seals to prevent leaks and water loss.",
    "shortDescription": "Universal KP-12 dual-flush valve and adjustable fill kit with chrome top push button.",
    "categoryId": "cat_sanitary_ware",
    "unit": "complete kit",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_kens_kp12_1",
        "url": "/images/products/product_kensplastic_kp12_flush_kit.png",
        "altText": "Kensplastic KP-12 Cistern Mechanism Kit",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_kp12_1",
        "key": "Brand",
        "value": "Kensplastic"
      },
      {
        "id": "sp_kp12_2",
        "key": "Model",
        "value": "KP-12 Universal Dual Flush"
      },
      {
        "id": "sp_kp12_3",
        "key": "Water Inflow",
        "value": "Adjustable Float Fill Valve"
      },
      {
        "id": "sp_kp12_4",
        "key": "Button",
        "value": "Dual Top Push Button"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_kensplastic_toilet_seat_cover",
    "name": "Kensplastic Heavy-Duty Standard Toilet Seat Cover",
    "slug": "kensplastic-heavy-duty-standard-toilet-seat-cover",
    "sku": "MF-SAN-004",
    "description": "Sturdy, impact-resistant polypropylene toilet seat and lid manufactured by Kensplastic. Features universal adjustable fixing hinges, smooth ergonomic contouring, and anti-bacterial stain-resistant finish suitable for standard oval toilet pans in residential and commercial bathrooms.",
    "shortDescription": "Heavy-duty white universal toilet seat cover with adjustable top/bottom fixing hinges.",
    "categoryId": "cat_sanitary_ware",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_kens_seat_1",
        "url": "/images/products/product_kensplastic_toilet_seat_cover.png",
        "altText": "Kensplastic Standard Toilet Seat Cover",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_seat_1",
        "key": "Brand",
        "value": "Kensplastic"
      },
      {
        "id": "sp_seat_2",
        "key": "Material",
        "value": "Heavy Duty Polypropylene"
      },
      {
        "id": "sp_seat_3",
        "key": "Color",
        "value": "Alpine Gloss White"
      },
      {
        "id": "sp_seat_4",
        "key": "Fit",
        "value": "Universal Oval Toilet Pans"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_shoshona_cistern_tank",
    "name": "Shoshona Top Flush Plastic Toilet Cistern Tank",
    "slug": "shoshona-top-flush-plastic-toilet-cistern-tank",
    "sku": "MF-SAN-005",
    "description": "Wall-mounted high-gloss plastic toilet cistern tank by Shoshona. Equipped with top-push chrome dual-action flush button, pre-fitted internal flush siphon mechanism and silent water inlet valve. High UV and impact resistance ensures decades of leak-free performance.",
    "shortDescription": "Shoshona surface wall-mounted top push cistern tank with complete internal flush fittings.",
    "categoryId": "cat_sanitary_ware",
    "unit": "each",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 5,
    "images": [
      {
        "id": "img_shoshona_1",
        "url": "/images/products/product_shoshona_cistern_tank.png",
        "altText": "Shoshona Top Flush Toilet Cistern Tank",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_shosh_1",
        "key": "Brand",
        "value": "Shoshona"
      },
      {
        "id": "sp_shosh_2",
        "key": "Capacity",
        "value": "8 Litres"
      },
      {
        "id": "sp_shosh_3",
        "key": "Actuation",
        "value": "Top Chrome Push Button"
      },
      {
        "id": "sp_shosh_4",
        "key": "Material",
        "value": "Reinforced White Thermoplastic"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_kensplastic_kp11_cistern",
    "name": "Kensplastic KP-11 7L Top Flush Plastic Cistern Tank",
    "slug": "kensplastic-kp11-7l-top-flush-plastic-cistern-tank",
    "sku": "MF-SAN-006",
    "description": "Reliable 7-litre water-saving low/medium level wall-mounted toilet cistern tank manufactured by Kensplastic. Built from resilient crack-proof virgin polymers with rapid-fill silent valve and quick-discharge top flush mechanism.",
    "shortDescription": "Kensplastic KP-11 7L water-efficient wall-mount cistern tank with internal fittings.",
    "categoryId": "cat_sanitary_ware",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_kens_kp11_1",
        "url": "/images/products/product_kensplastic_kp11_cistern.png",
        "altText": "Kensplastic KP-11 Cistern Tank",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_kp11_1",
        "key": "Brand",
        "value": "Kensplastic"
      },
      {
        "id": "sp_kp11_2",
        "key": "Model",
        "value": "KP-11 Eco Flush"
      },
      {
        "id": "sp_kp11_3",
        "key": "Capacity",
        "value": "7 Litres"
      },
      {
        "id": "sp_kp11_4",
        "key": "Inlet Entry",
        "value": "Universal Reversible Left/Right"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_foldable_toilet_safety_grab_bar",
    "name": "Elderly & Accessible Foldable Toilet Safety Grab Bar Wall Mount",
    "slug": "elderly-accessible-foldable-toilet-safety-grab-bar",
    "sku": "MF-SAN-007",
    "description": "Heavy-duty wall-mounted handicap and elderly support grab bar for restrooms. Engineered from high-strength stainless steel tube with textured anti-slip grip and smooth 90-degree fold-up mechanism to save space when not in use. Supports up to 200kg.",
    "shortDescription": "Heavy-duty 90° flip-up handicap toilet safety support rail with anti-slip grip.",
    "categoryId": "cat_sanitary_ware",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_grabbar_1",
        "url": "/images/products/product_foldable_toilet_safety_grab_bar.png",
        "altText": "Foldable Toilet Safety Grab Bar",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_grab_1",
        "key": "Material",
        "value": "Heavy Gauge SUS304 / Anti-Microbial Grip"
      },
      {
        "id": "sp_grab_2",
        "key": "Design",
        "value": "90° Space-Saving Vertical Flip-Up"
      },
      {
        "id": "sp_grab_3",
        "key": "Load Capacity",
        "value": "Tested up to 200 KG"
      },
      {
        "id": "sp_grab_4",
        "key": "Mounting",
        "value": "Wall Flange with Heavy Anchor Bolts"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_modern_bathroom_vanity_unit",
    "name": "Modern Bathroom Vanity Cabinet Unit with Ceramic Basin & LED Mirror",
    "slug": "modern-bathroom-vanity-cabinet-basin-mirror",
    "sku": "MF-SAN-008",
    "description": "Luxury floating wall-hung bathroom vanity console featuring water-resistant composite cabinet, glossy vitreous china washbasin with overflow hole, and smart LED backlit mirror. Ample concealed storage keeps toiletries organized and dry.",
    "shortDescription": "Contemporary floating bathroom vanity unit with glazed ceramic basin and mirror.",
    "categoryId": "cat_sanitary_ware",
    "unit": "complete set",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 6,
    "images": [
      {
        "id": "img_vanity_1",
        "url": "/images/products/product_modern_bathroom_vanity_unit.png",
        "altText": "Modern Bathroom Vanity Cabinet Set",
        "displayOrder": 1,
        "isPrimary": true
      },
      {
        "id": "img_vanity_2",
        "url": "/images/products/product_modern_bathroom_vanity_unit_angle.png",
        "altText": "Vanity Cabinet Angled View",
        "displayOrder": 2,
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "id": "sp_van_1",
        "key": "Set Components",
        "value": "Storage Cabinet, Vitreous Basin, Vanity Mirror"
      },
      {
        "id": "sp_van_2",
        "key": "Cabinet Finish",
        "value": "Waterproof Moisture-Resistant Board"
      },
      {
        "id": "sp_van_3",
        "key": "Basin",
        "value": "Integrated High-Gloss Vitreous China"
      },
      {
        "id": "sp_van_4",
        "key": "Mounting",
        "value": "Wall Floating Mount with Hardware"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_lirlee_basin_tap",
    "name": "Lirlee Chrome Basin Pillar Tap",
    "slug": "lirlee-chrome-basin-pillar-tap",
    "sku": "MF-TAP-002",
    "description": "Solid chrome-plated basin pillar tap from Lirlee Fashionable Sanitary Wares & Mixer Taps. Built with a solid brass body, gleaming mirror-chrome corrosion-resistant finish, smooth ergonomic quarter-turn lever, aerated water-saving nozzle, and threaded brass backnut for secure washbasin mounting.",
    "shortDescription": "Mirror-finish solid brass pillar tap with quarter-turn precision control.",
    "categoryId": "cat_taps_faucets",
    "unit": "each",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 3,
    "images": [
      {
        "id": "img_lirlee_tap_1",
        "url": "/images/products/product_lirlee_basin_tap.png",
        "altText": "Lirlee Chrome Basin Pillar Tap",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp9",
        "key": "Brand",
        "value": "Lirlee"
      },
      {
        "id": "sp10",
        "key": "Type",
        "value": "Basin Pillar Tap / Faucet"
      },
      {
        "id": "sp11",
        "key": "Material",
        "value": "Chrome-Plated Solid Brass"
      },
      {
        "id": "sp12",
        "key": "Connection",
        "value": "1/2\" Standard Threaded Base"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_lirlee_chrome_shattaf",
    "name": "Lirlee Tempesta-F Chrome Bidet Spray Set",
    "slug": "lirlee-tempesta-f-chrome-bidet-spray-set",
    "sku": "MF-TAP-003",
    "description": "Complete Tempesta-F hygienic toilet bidet / shattaf spray kit by Lirlee. Includes ergonomic chrome trigger spray head with targeted comfort jet, heavy-duty 1.2m flexible stainless steel hose with leak-proof washers, and matching wall bracket holder for convenient bathroom installation.",
    "shortDescription": "Tempesta-F chrome hygienic trigger spray handset with flexible stainless hose and bracket.",
    "categoryId": "cat_taps_faucets",
    "unit": "complete set",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 4,
    "images": [
      {
        "id": "img_lirlee_chrome_shattaf_1",
        "url": "/images/products/product_lirlee_chrome_shattaf.png",
        "altText": "Lirlee Tempesta-F Chrome Bidet Spray Set",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp13",
        "key": "Brand",
        "value": "Lirlee"
      },
      {
        "id": "sp14",
        "key": "Series",
        "value": "Tempesta-F Trigger Spray 30"
      },
      {
        "id": "sp15",
        "key": "Components",
        "value": "Spray Gun, Flexible Stainless Hose, Wall Holder"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_lirlee_black_shattaf",
    "name": "Lirlee Tempesta-F Matte Black Trigger Spray Set",
    "slug": "lirlee-tempesta-f-matte-black-trigger-spray-set",
    "sku": "MF-TAP-004",
    "description": "Modern matte black toilet shattaf / bidet spray kit (Model LR9218) by Lirlee. Features a contemporary matte black ergonomic trigger spray handset, smooth anti-twist matte black hose, and wall bracket. Adds a stylish modern touch to any modern washroom or luxury bathroom.",
    "shortDescription": "Luxury matte black trigger spray kit (Model LR9218) with matte hose and wall mount.",
    "categoryId": "cat_taps_faucets",
    "unit": "complete set",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 7,
    "images": [
      {
        "id": "img_lirlee_black_shattaf_1",
        "url": "/images/products/product_lirlee_black_shattaf.png",
        "altText": "Lirlee Tempesta-F Matte Black Trigger Spray Set",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp16",
        "key": "Brand",
        "value": "Lirlee"
      },
      {
        "id": "sp17",
        "key": "Model",
        "value": "LR9218 Tempesta-F Trigger Spray 30"
      },
      {
        "id": "sp18",
        "key": "Finish",
        "value": "Matte Black Electrostatic Coat"
      },
      {
        "id": "sp19",
        "key": "Components",
        "value": "Black Handset, Anti-Kink Black Hose, Wall Mount"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_chrome_wall_gooseneck_tap",
    "name": "1/2\" Wall-Mount Chrome Gooseneck Bibcock Kitchen Tap",
    "slug": "half-inch-wall-mount-chrome-gooseneck-bibcock-kitchen-tap",
    "sku": "MF-TAP-005",
    "description": "Classic chrome-plated wall-mounted kitchen sink tap featuring high-rise gooseneck swivel spout and ergonomic crosshead handle. Brass valve core ensures drip-free operation and smooth water stream for dishwashing and sink chores.",
    "shortDescription": "1/2\" wall-mounted gooseneck kitchen sink tap with chrome finish and swivel neck.",
    "categoryId": "cat_taps_faucets",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_tap_goose_1",
        "url": "/images/products/product_chrome_wall_gooseneck_tap.png",
        "altText": "Wall-Mount Chrome Gooseneck Tap",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_g1",
        "key": "Inlet Thread",
        "value": "1/2\" Male BSP Wall Thread"
      },
      {
        "id": "sp_g2",
        "key": "Material",
        "value": "Solid Brass with Chrome Plating"
      },
      {
        "id": "sp_g3",
        "key": "Spout",
        "value": "360° Swivel High Gooseneck"
      },
      {
        "id": "sp_g4",
        "key": "Handle",
        "value": "Four-Point Crosshead Control"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_flexible_silicone_kitchen_mixer",
    "name": "360° Flexible Silicone Neck Kitchen Sink Mixer Tap",
    "slug": "360-flexible-silicone-neck-kitchen-sink-mixer-tap",
    "sku": "MF-TAP-006",
    "description": "Versatile deck-mounted kitchen sink mixer featuring a durable black food-grade silicone flexible neck that bends and holds in any orientation. Switch easily between concentrated stream and wide spray to rinse vegetables, pots, and sink corners.",
    "shortDescription": "Multi-directional 360° flexible silicone neck kitchen sink mixer with dual-mode spray.",
    "categoryId": "cat_taps_faucets",
    "unit": "each",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 8,
    "images": [
      {
        "id": "img_silicone_tap_1",
        "url": "/images/products/product_flexible_silicone_kitchen_mixer.png",
        "altText": "Flexible Silicone Neck Kitchen Mixer",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_sili_1",
        "key": "Neck Type",
        "value": "360° Shape-Retaining Flexible Silicone"
      },
      {
        "id": "sp_sili_2",
        "key": "Modes",
        "value": "Aerated Stream & High Pressure Rinse Spray"
      },
      {
        "id": "sp_sili_3",
        "key": "Body",
        "value": "Polished Chrome Solid Brass Base"
      },
      {
        "id": "sp_sili_4",
        "key": "Cartridge",
        "value": "Precision Ceramic Disc Cartridge"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_sus304_wall_kitchen_tap",
    "name": "SUS304 Brushed Stainless Steel Wall-Mounted Kitchen Tap",
    "slug": "sus304-brushed-stainless-steel-wall-mounted-kitchen-tap",
    "sku": "MF-TAP-007",
    "description": "Lead-free premium SUS304 food-grade stainless steel wall-mount sink tap with brushed satin finish. Highly resistant to corrosion, rust, and water stains. Quarter-turn single lever gives instant effortless flow control.",
    "shortDescription": "Lead-free SUS304 brushed stainless steel wall tap with swivel spout.",
    "categoryId": "cat_taps_faucets",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_sus304_wall_1",
        "url": "/images/products/product_sus304_wall_kitchen_tap.png",
        "altText": "SUS304 Wall-Mounted Kitchen Tap",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_sw_1",
        "key": "Material",
        "value": "SUS304 Food-Grade Stainless Steel"
      },
      {
        "id": "sp_sw_2",
        "key": "Mount",
        "value": "Wall-Mount Single Cold/Hot Inlet"
      },
      {
        "id": "sp_sw_3",
        "key": "Finish",
        "value": "Brushed Nickel Satin"
      },
      {
        "id": "sp_sw_4",
        "key": "Health Standard",
        "value": "100% Lead-Free Drinking Water Safe"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_sus304_deck_kitchen_mixer",
    "name": "High-Arc SUS304 Deck-Mount Kitchen Mixer with Flexible Tails",
    "slug": "high-arc-sus304-deck-mount-kitchen-mixer",
    "sku": "MF-TAP-008",
    "description": "Architectural high-clearance gooseneck deck-mounted kitchen sink mixer tap crafted from heavy SUS304 stainless steel. Single lever provides smooth hot and cold water mixing. Includes two stainless steel braided inlet hoses.",
    "shortDescription": "High-arc SUS304 stainless deck mixer with smooth single lever and braided hoses.",
    "categoryId": "cat_taps_faucets",
    "unit": "complete set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_sus_deck_1",
        "url": "/images/products/product_sus304_deck_kitchen_mixer.png",
        "altText": "High-Arc SUS304 Kitchen Mixer",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_sd_1",
        "key": "Design",
        "value": "High-Arc 360° Swivel Spout"
      },
      {
        "id": "sp_sd_2",
        "key": "Water Supply",
        "value": "Hot & Cold Water Mixing"
      },
      {
        "id": "sp_sd_3",
        "key": "Material",
        "value": "Brushed SUS304 Stainless Steel"
      },
      {
        "id": "sp_sd_4",
        "key": "Included",
        "value": "2x 60cm Braided Flexible Supply Hoses"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_commercial_brushed_kitchen_mixer",
    "name": "Commercial Brushed Stainless Steel Single Lever Kitchen Mixer",
    "slug": "commercial-brushed-stainless-single-lever-kitchen-mixer",
    "sku": "MF-TAP-009",
    "description": "Commercial-grade deck mount kitchen sink faucet featuring heavy cast construction, smooth satin brushed finish, and a tall curved spout. Designed for demanding residential kitchens, cafes, and restaurant prep sinks.",
    "shortDescription": "Heavy-duty commercial brushed stainless single lever kitchen mixer faucet.",
    "categoryId": "cat_taps_faucets",
    "unit": "complete set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_comm_brushed_1",
        "url": "/images/products/product_commercial_brushed_kitchen_mixer.png",
        "altText": "Commercial Brushed Kitchen Mixer",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_cb_1",
        "key": "Finish",
        "value": "Commercial Satin Brushed Nickel"
      },
      {
        "id": "sp_cb_2",
        "key": "Mounting",
        "value": "Single Hole Deck Mount with Heavy Brass Nut"
      },
      {
        "id": "sp_cb_3",
        "key": "Cartridge",
        "value": "Durable Diamond-Hard Ceramic Disc"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_brimix_bridge_kitchen_mixer",
    "name": "Brimix Chrome Dual Crosshead Bridge Kitchen Sink Mixer",
    "slug": "brimix-chrome-dual-crosshead-bridge-kitchen-sink-mixer",
    "sku": "MF-TAP-010",
    "description": "Timeless Victorian bridge-style deck mounted kitchen faucet by Brimix. Features twin crosshead handles with clear Hot & Cold indices, a centrally raised high-arch swivel spout, and heavy solid brass body coated in mirror chrome.",
    "shortDescription": "Classic Brimix twin crosshead bridge kitchen sink mixer in mirror chrome.",
    "categoryId": "cat_taps_faucets",
    "unit": "each",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 9,
    "images": [
      {
        "id": "img_brimix_bridge_1",
        "url": "/images/products/product_brimix_bridge_kitchen_mixer.png",
        "altText": "Brimix Chrome Bridge Kitchen Mixer",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_bb_1",
        "key": "Brand",
        "value": "Brimix"
      },
      {
        "id": "sp_bb_2",
        "key": "Design",
        "value": "Twin-Handle Bridge Deck Mixer"
      },
      {
        "id": "sp_bb_3",
        "key": "Finish",
        "value": "Triple-Plate Polished Chrome"
      },
      {
        "id": "sp_bb_4",
        "key": "Material",
        "value": "High-Purity Cast Brass Body"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_lirlee_wall_mount_kitchen_mixer",
    "name": "Lirlee Chrome Dual-Handle Wall-Mount Kitchen Mixer Tap",
    "slug": "lirlee-chrome-dual-handle-wall-mount-kitchen-mixer-tap",
    "sku": "MF-TAP-011",
    "description": "Heavy brass wall-mount double handle mixer tap from Lirlee. Built for sinks with wall supply plumbing, complete with eccentric S-unions and decorative chrome flanges. Provides generous water flow with individual hot and cold temperature dialing.",
    "shortDescription": "Lirlee heavy brass wall-mounted dual handle kitchen sink mixer with S-unions.",
    "categoryId": "cat_taps_faucets",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_lirlee_wall_1",
        "url": "/images/products/product_lirlee_wall_mount_kitchen_mixer.png",
        "altText": "Lirlee Wall-Mount Kitchen Mixer",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_lw_1",
        "key": "Brand",
        "value": "Lirlee"
      },
      {
        "id": "sp_lw_2",
        "key": "Installation",
        "value": "Wall-Mount Dual Center-to-Center"
      },
      {
        "id": "sp_lw_3",
        "key": "Components Included",
        "value": "Mixer Body, 2x Eccentric S-Connectors, Wall Escutcheons"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_acquaflex_bravo_kitchen_mixer",
    "name": "Acquaflex Bravo Dual Knob Wall-Mount Kitchen Sink Mixer",
    "slug": "acquaflex-bravo-dual-knob-wall-mount-kitchen-sink-mixer",
    "sku": "MF-TAP-012",
    "description": "Italian-style wall-mounted kitchen sink mixer tap from Acquaflex Bravo. Equipped with faceted ergonomic turn knobs, long swivel outlet spout, and heavy brass valve block to withstand tough water pressure.",
    "shortDescription": "Acquaflex Bravo Italian-style wall mount kitchen mixer with dual control knobs.",
    "categoryId": "cat_taps_faucets",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_acq_bravo_1",
        "url": "/images/products/product_acquaflex_bravo_kitchen_mixer.png",
        "altText": "Acquaflex Bravo Wall Kitchen Mixer",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_ab_1",
        "key": "Brand",
        "value": "Acquaflex Bravo"
      },
      {
        "id": "sp_ab_2",
        "key": "Mount",
        "value": "Wall Mounted Dual Feed"
      },
      {
        "id": "sp_ab_3",
        "key": "Finish",
        "value": "Gloss Chrome Plated Brass"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_black_spring_pre_rinse_mixer",
    "name": "Commercial Matte Black Spring Pull-Down Pre-Rinse Kitchen Mixer with Pot Filler",
    "slug": "commercial-matte-black-spring-pull-down-pre-rinse-kitchen-mixer",
    "sku": "MF-TAP-013",
    "description": "Professional chef-grade commercial kitchen sink mixer in matte black. Combines a heavy-duty flexible coil spring pull-down spray wand with an independent lower swivel pot-filler spout. Allows washing dishes and filling large pots at the same time.",
    "shortDescription": "Commercial 52cm matte black pull-down spring mixer with dual spray wand and pot filler.",
    "categoryId": "cat_taps_faucets",
    "unit": "complete set",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 10,
    "images": [
      {
        "id": "img_pre_rinse_black_1",
        "url": "/images/products/product_black_spring_pre_rinse_mixer.png",
        "altText": "Commercial Black Pre-Rinse Mixer",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_pr_1",
        "key": "Height",
        "value": "52cm Professional Spring Height"
      },
      {
        "id": "sp_pr_2",
        "key": "Dual Function",
        "value": "High Pressure Pull-Down Sprayer + Swivel Aerated Pot Filler"
      },
      {
        "id": "sp_pr_3",
        "key": "Finish",
        "value": "Electroplated Velvet Matte Black"
      },
      {
        "id": "sp_pr_4",
        "key": "Valve Body",
        "value": "Solid Forged Brass with Ceramic Cartridge"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_black_spring_pullout_faucet",
    "name": "Matte Black Spring Pull-Out Spray Kitchen Faucet",
    "slug": "matte-black-spring-pull-out-spray-kitchen-faucet",
    "sku": "MF-TAP-014",
    "description": "Striking modern matte black kitchen mixer faucet featuring an open-coil architectural spring neck, magnetic docking pull-out spray head, and single lever temperature control. Ideal for modern kitchen islands and granite countertops.",
    "shortDescription": "Modern spiral spring matte black pull-out kitchen faucet with magnetic docking spray.",
    "categoryId": "cat_taps_faucets",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_black_spring_1",
        "url": "/images/products/product_black_spring_pullout_faucet.png",
        "altText": "Matte Black Spring Kitchen Faucet",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_bsp_1",
        "key": "Style",
        "value": "Contemporary Spiral Spring Neck"
      },
      {
        "id": "sp_bsp_2",
        "key": "Sprayer",
        "value": "Dual-Spray Stream & Jet Rinse Handset"
      },
      {
        "id": "sp_bsp_3",
        "key": "Finish",
        "value": "Corrosion-Resistant Matte Black Coating"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_water_droplet_chrome_spring_mixer",
    "name": "Water Droplet Commercial Chrome High-Arch Spring Pull-Down Kitchen Mixer",
    "slug": "water-droplet-commercial-chrome-high-arch-spring-kitchen-mixer",
    "sku": "MF-TAP-015",
    "description": "Heavy-duty chrome commercial pull-down kitchen faucet from Water Droplet Pro series. Built with a high-tension steel coil spring, lock-on high pressure spray trigger, and polished mirror chrome plating that withstands rigorous daily kitchen usage.",
    "shortDescription": "Water Droplet high-arch commercial chrome pull-down spring kitchen mixer.",
    "categoryId": "cat_taps_faucets",
    "unit": "complete set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_wd_chrome_1",
        "url": "/images/products/product_water_droplet_chrome_spring_mixer.png",
        "altText": "Water Droplet Chrome Spring Mixer",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_wd_1",
        "key": "Brand",
        "value": "Water Droplet Professional Series"
      },
      {
        "id": "sp_wd_2",
        "key": "Finish",
        "value": "Mirror Polish Chrome Plating"
      },
      {
        "id": "sp_wd_3",
        "key": "Sprayer",
        "value": "High Pressure Lockable Rinse Head"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_chrome_commercial_spring_tap",
    "name": "Chrome Single Lever Commercial Spring Pull-Down Tap with Spray Wand",
    "slug": "chrome-single-lever-commercial-spring-pull-down-tap",
    "sku": "MF-TAP-016",
    "description": "Sleek single-lever commercial kitchen faucet with flexible spring arch and ergonomic pull-down spray wand. High clearance easily accommodates stockpots, baking sheets, and heavy kitchenware.",
    "shortDescription": "Commercial high-clearance chrome spring pull-down kitchen tap with spray wand.",
    "categoryId": "cat_taps_faucets",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_chrome_spring_wand_1",
        "url": "/images/products/product_chrome_commercial_spring_tap.png",
        "altText": "Chrome Commercial Spring Tap",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_cst_1",
        "key": "Mounting",
        "value": "Single Hole Deck Mount"
      },
      {
        "id": "sp_cst_2",
        "key": "Spout Rotation",
        "value": "360° Free Swivel"
      },
      {
        "id": "sp_cst_3",
        "key": "Construction",
        "value": "Solid Brass with Reinforced Spring Guide"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_gunmetal_pullout_kitchen_mixer",
    "name": "Modern Brushed Gunmetal L-Shape Kitchen Mixer with Pull-Out Wand",
    "slug": "modern-brushed-gunmetal-l-shape-kitchen-mixer-pullout",
    "sku": "MF-TAP-018",
    "description": "Modern European right-angle L-shape kitchen mixer finished in brushed titanium gunmetal grey. Features a smooth concealed pull-out spray nozzle with weighted gravity return hose and 360° swivel reach.",
    "shortDescription": "European right-angle L-shape kitchen mixer in brushed gunmetal with pull-out wand.",
    "categoryId": "cat_taps_faucets",
    "unit": "complete set",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 11,
    "images": [
      {
        "id": "img_gunmetal_1",
        "url": "/images/products/product_gunmetal_pullout_kitchen_mixer.png",
        "altText": "Brushed Gunmetal Pull-Out Kitchen Mixer",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_gm_1",
        "key": "Design",
        "value": "Geometric Right-Angle L-Spout"
      },
      {
        "id": "sp_gm_2",
        "key": "Finish",
        "value": "Brushed Gunmetal PVD Nano Coating"
      },
      {
        "id": "sp_gm_3",
        "key": "Pull-Out Reach",
        "value": "Up to 60cm with Gravity Weight"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_black_square_shattaf_boxed",
    "name": "Modern Matte Black Square Shattaf Bidet Spray Set (Boxed)",
    "sku": "MF-TAP-019",
    "slug": "modern-matte-black-square-shattaf-bidet-spray-set-boxed",
    "description": "Boxed luxury bidet douche spray set in matte black square profile. Features ergonomic trigger handle, matching kink-resistant black hose, and wall mount holster. High precision water jet ensures optimal personal hygiene.",
    "shortDescription": "Square profile matte black toilet shattaf set in gift box with hose and wall bracket.",
    "categoryId": "cat_taps_faucets",
    "unit": "complete set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_shattaf_sq_b_1",
        "url": "/images/products/product_black_square_shattaf_boxed.png",
        "altText": "Matte Black Square Shattaf Set",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_ssq_1",
        "key": "Profile",
        "value": "Modern Square Minimalist Handset"
      },
      {
        "id": "sp_ssq_2",
        "key": "Finish",
        "value": "Matte Black Satin"
      },
      {
        "id": "sp_ssq_3",
        "key": "Hose",
        "value": "1.2m Anti-Explosion Flexible Hose"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_chrome_ribbed_shattaf_boxed",
    "name": "Chrome Ribbed Handle Shattaf Bidet Spray Set (Boxed)",
    "slug": "chrome-ribbed-handle-shattaf-bidet-spray-set-boxed",
    "sku": "MF-TAP-020",
    "description": "Deluxe chrome bidet sprayer kit with textured non-slip ribbed handle. Delivers comfortable ergonomic control with smooth press trigger, flexible stainless steel hose, and secure wall mounting bracket.",
    "shortDescription": "Ergonomic ribbed chrome toilet shattaf kit in presentation box with hose and bracket.",
    "categoryId": "cat_taps_faucets",
    "unit": "complete set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_shattaf_rib_c_1",
        "url": "/images/products/product_chrome_ribbed_shattaf_boxed.png",
        "altText": "Chrome Ribbed Shattaf Bidet Set",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_srb_1",
        "key": "Grip",
        "value": "Ergonomic Non-Slip Ribbed Handle"
      },
      {
        "id": "sp_srb_2",
        "key": "Finish",
        "value": "Mirror Polish Chrome"
      },
      {
        "id": "sp_srb_3",
        "key": "Hose Length",
        "value": "1.2m Stainless Steel Interlock"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_polished_gold_square_shattaf_set",
    "name": "Luxury Polished Gold Square Shattaf Bidet Spray Set with Flexible Hose",
    "slug": "luxury-polished-gold-square-shattaf-bidet-spray-set",
    "sku": "MF-TAP-021",
    "description": "High-end polished royal gold PVD toilet bidet shattaf kit. Features solid brass square trigger sprayer, matching gold spiral flexible hose, brass wall bracket, and angle valve connector for upscale master bathrooms.",
    "shortDescription": "Mirror-polished royal gold square toilet shattaf set with matching gold hose and bracket.",
    "categoryId": "cat_taps_faucets",
    "unit": "complete set",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 12,
    "images": [
      {
        "id": "img_gold_shattaf_1",
        "url": "/images/products/product_polished_gold_square_shattaf_set.png",
        "altText": "Polished Gold Square Shattaf Set",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_gld_1",
        "key": "Finish",
        "value": "Electroplated Mirror Royal Gold PVD"
      },
      {
        "id": "sp_gld_2",
        "key": "Material",
        "value": "Solid Brass & Reinforced Metal Hose"
      },
      {
        "id": "sp_gld_3",
        "key": "Connection",
        "value": "Universal 1/2\" Thread"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_sus304_brushed_shattaf_set",
    "name": "SUS304 Brushed Stainless Steel Shattaf Bidet Spray Set (Blister Pack)",
    "slug": "sus304-brushed-stainless-steel-shattaf-bidet-spray-set",
    "sku": "MF-TAP-022",
    "description": "Complete heavy-duty hygienic douche spray kit manufactured from genuine SUS304 brushed stainless steel. Rust-proof and leak-resistant with stainless trigger wand, 1.2m braided hose, and wall holster in factory blister pack.",
    "shortDescription": "Genuine SUS304 brushed stainless steel hygienic toilet spray set in blister pack.",
    "categoryId": "cat_taps_faucets",
    "unit": "complete set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_sus_shattaf_1",
        "url": "/images/products/product_sus304_brushed_shattaf_set.png",
        "altText": "SUS304 Brushed Shattaf Spray Set",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_sus_sh_1",
        "key": "Material",
        "value": "Grade 304 Brushed Stainless Steel"
      },
      {
        "id": "sp_sus_sh_2",
        "key": "Packaging",
        "value": "Sealed Retail Blister Pack"
      },
      {
        "id": "sp_sus_sh_3",
        "key": "Durability",
        "value": "High Pressure Water Hammer Resistant"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_milano_instant_heater_shower",
    "name": "Milano Digital Inverter Instant Water Heater Shower Set with Black Rain Shower & Handset",
    "slug": "milano-digital-inverter-instant-water-heater-shower-set",
    "sku": "MF-SHW-001",
    "description": "State-of-the-art Milano digital inverter electric instant water heater shower system. Features rapid dual-element instant heating, intelligent digital temperature display, overhead matte black square rain shower head, telephone handset, and adjustable sliding riser rail. Built-in ELCB earth leakage breaker ensures absolute electrical safety.",
    "shortDescription": "Milano digital inverter instant water heater with overhead black rain shower and handset.",
    "categoryId": "cat_shower_systems",
    "unit": "complete system",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 13,
    "images": [
      {
        "id": "img_milano_1",
        "url": "/images/products/product_milano_instant_heater_shower.png",
        "altText": "Milano Instant Water Heater Shower System",
        "displayOrder": 1,
        "isPrimary": true
      },
      {
        "id": "img_milano_2",
        "url": "/images/products/product_milano_shower_box.png",
        "altText": "Milano Packaging Box",
        "displayOrder": 2,
        "isPrimary": false
      },
      {
        "id": "img_milano_3",
        "url": "/images/products/product_milano_heater_unit.png",
        "altText": "Milano Heater Unit Detail",
        "displayOrder": 3,
        "isPrimary": false
      },
      {
        "id": "img_milano_4",
        "url": "/images/products/product_milano_shower_rail.png",
        "altText": "Milano Shower Riser Rail Kit",
        "displayOrder": 4,
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "id": "sp_mil_1",
        "key": "Brand",
        "value": "Milano"
      },
      {
        "id": "sp_mil_2",
        "key": "Technology",
        "value": "Digital Inverter Instant Heating"
      },
      {
        "id": "sp_mil_3",
        "key": "Shower Heads",
        "value": "Overhead Square Rain Shower + Multi-Mode Handset"
      },
      {
        "id": "sp_mil_4",
        "key": "Safety System",
        "value": "Built-in Double Pole ELCB & Thermal Cut-off"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_concealed_thermostatic_shower_set",
    "name": "Concealed Thermostatic Shower Mixer Valve System with Square Rain Shower Head",
    "slug": "concealed-thermostatic-shower-mixer-valve-system",
    "sku": "MF-SHW-002",
    "description": "In-wall concealed luxury thermostatic shower mixer set. Includes heavy solid brass valve body, chrome square escutcheon faceplate with dual control knobs, and wide ceiling/wall mounted square rain shower head.",
    "shortDescription": "In-wall concealed thermostatic shower valve system with square rain shower head.",
    "categoryId": "cat_shower_systems",
    "unit": "complete set",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 14,
    "images": [
      {
        "id": "img_concealed_1",
        "url": "/images/products/product_concealed_thermostatic_shower_set.png",
        "altText": "Concealed Thermostatic Shower Set",
        "displayOrder": 1,
        "isPrimary": true
      },
      {
        "id": "img_concealed_2",
        "url": "/images/products/product_concealed_shower_valve_box.png",
        "altText": "Concealed Valve Body Boxed",
        "displayOrder": 2,
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "id": "sp_ct_1",
        "key": "Valve Type",
        "value": "Solid Brass In-Wall Thermostatic Diverter"
      },
      {
        "id": "sp_ct_2",
        "key": "Shower Head",
        "value": "Ultra-Slim Square Stainless Steel Rain Head"
      },
      {
        "id": "sp_ct_3",
        "key": "Temperature Safety",
        "value": "Anti-scald 38°C Safety Stop"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_brimix_concealed_shower_mixer",
    "name": "Brimix 4-Way Concealed Shower Mixer Valve Set",
    "slug": "brimix-4-way-concealed-shower-mixer-valve-set",
    "sku": "MF-SHW-003",
    "description": "Heavy forged brass 4-way concealed shower mixer valve from Brimix. Provides versatile multi-outlet routing between overhead rain shower, handset wand, and tub spout with a sleek mirror-chrome trim plate.",
    "shortDescription": "Brimix 4-way heavy brass concealed multi-outlet shower diverter valve.",
    "categoryId": "cat_shower_systems",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_brimix_4way_1",
        "url": "/images/products/product_brimix_concealed_shower_mixer.png",
        "altText": "Brimix 4-Way Concealed Shower Mixer",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_b4w_1",
        "key": "Brand",
        "value": "Brimix"
      },
      {
        "id": "sp_b4w_2",
        "key": "Outlets",
        "value": "4-Way Multi-Port Diverter"
      },
      {
        "id": "sp_b4w_3",
        "key": "Material",
        "value": "Dezincification-Resistant Cast Brass"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_brimix_8807_exposed_shower_column",
    "name": "Brimix Model 8807 Chrome Exposed Shower System (Rain Shower + Hand Wand)",
    "slug": "brimix-8807-chrome-exposed-shower-system",
    "sku": "MF-SHW-004",
    "description": "Full exposed chrome shower column set (Model 8807) by Brimix. Includes rigid vertical riser rail, oversized overhead rainfall plate, telephone hand shower with flexible metal hose, lower tub filler spout, and single lever mixing valve.",
    "shortDescription": "Complete Brimix Model 8807 exposed chrome shower column with rain head and wand.",
    "categoryId": "cat_shower_systems",
    "unit": "complete column",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 15,
    "images": [
      {
        "id": "img_brimix_8807_1",
        "url": "/images/products/product_brimix_8807_exposed_shower_column.png",
        "altText": "Brimix 8807 Exposed Shower Column",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_b88_1",
        "key": "Model",
        "value": "Brimix 8807 Complete Column"
      },
      {
        "id": "sp_b88_2",
        "key": "Outlets",
        "value": "3-Way (Rain Head, Telephone Handset, Tub Spout)"
      },
      {
        "id": "sp_b88_3",
        "key": "Finish",
        "value": "Triple Plated Mirror Chrome"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_round_ultra_slim_rain_shower",
    "name": "Ultra-Slim 8\" Stainless Steel Round Chrome Overhead Rain Shower Head",
    "slug": "ultra-slim-8-inch-stainless-round-chrome-rain-shower-head",
    "sku": "MF-SHW-005",
    "description": "Minimalist 2mm razor-thin 8-inch round overhead rain shower head made from mirror-polished SUS304 stainless steel. Laser-welded leak-proof design with medical-grade easy-clean silicone nozzles.",
    "shortDescription": "Ultra-slim 8\" mirror-chrome stainless steel round rain shower head with swivel joint.",
    "categoryId": "cat_shower_systems",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_round_slim_1",
        "url": "/images/products/product_round_ultra_slim_rain_shower.png",
        "altText": "Ultra-Slim Round Chrome Rain Shower Head",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_rs_1",
        "key": "Diameter",
        "value": "8 Inch (200mm) Round"
      },
      {
        "id": "sp_rs_2",
        "key": "Thickness",
        "value": "2mm Ultra-Thin Air-Injection Plate"
      },
      {
        "id": "sp_rs_3",
        "key": "Connection",
        "value": "Standard 1/2\" Swivel Brass Ball Joint"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_lirlee_lr35202_black_rain_shower",
    "name": "Lirlee LR35202 8\" Matte Black Square Rain Shower Head",
    "slug": "lirlee-lr35202-8-inch-matte-black-square-rain-shower-head",
    "sku": "MF-SHW-006",
    "description": "Designer 8x8 inch square overhead rain shower head (Model LR35202) from Lirlee. Coated in durable electroplated matte black that resists limescale and flaking. Provides a relaxing full-body rainfall cascade.",
    "shortDescription": "Lirlee LR35202 8\" matte black square rain shower head with silicone jet nozzles.",
    "categoryId": "cat_shower_systems",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_lirlee_lr35_1",
        "url": "/images/products/product_lirlee_lr35202_black_rain_shower.png",
        "altText": "Lirlee LR35202 Black Rain Shower Head",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_lr35_1",
        "key": "Brand & Model",
        "value": "Lirlee LR35202"
      },
      {
        "id": "sp_lr35_2",
        "key": "Dimensions",
        "value": "200mm x 200mm (8\" x 8\") Square"
      },
      {
        "id": "sp_lr35_3",
        "key": "Finish",
        "value": "Matte Black Anti-Corrosion"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_black_square_shower_with_arm",
    "name": "Matte Black Square Rain Shower Head with Chrome Swivel Wall Arm",
    "slug": "matte-black-square-rain-shower-head-chrome-wall-arm",
    "sku": "MF-SHW-007",
    "description": "Modern two-tone shower fixture pairing an 8-inch square matte black rain shower faceplate with a sturdy polished chrome wall extension arm and matching decorative wall flange.",
    "shortDescription": "Matte black square rain shower head with chrome wall extension arm and flange.",
    "categoryId": "cat_shower_systems",
    "unit": "complete set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_black_sq_arm_1",
        "url": "/images/products/product_black_square_shower_with_arm.png",
        "altText": "Black Square Shower Head with Wall Arm",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_bsa_1",
        "key": "Plate Size",
        "value": "8\" (200mm) Square Face"
      },
      {
        "id": "sp_bsa_2",
        "key": "Wall Arm",
        "value": "Solid Brass / Chrome Swivel Arm Included"
      },
      {
        "id": "sp_bsa_3",
        "key": "Thread",
        "value": "1/2\" Standard Wall Outlet"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_dual_flow_square_shower_head",
    "name": "Dual-Flow Square Rain Shower Head with Chrome Wall Arm",
    "slug": "dual-flow-square-rain-shower-head-chrome-wall-arm",
    "sku": "MF-SHW-008",
    "description": "High-performance square shower head in chrome with dark faceplate and curved brass wall arm. Engineered with booster chambers to provide strong invigorating water flow even under low water pressure.",
    "shortDescription": "Square booster rain shower head with curved chrome wall extension arm.",
    "categoryId": "cat_shower_systems",
    "unit": "complete set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_dual_flow_1",
        "url": "/images/products/product_dual_flow_square_shower_head.png",
        "altText": "Dual-Flow Square Rain Shower Head",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_df_1",
        "key": "Pressure",
        "value": "Pressure-Boosting Micro-Nozzle Technology"
      },
      {
        "id": "sp_df_2",
        "key": "Finish",
        "value": "Chrome Body with Charcoal Grey Face"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_vado_concealed_shower_mixer",
    "name": "Vado Concealed Shower Mixer Valve Body with Chrome Faceplate",
    "slug": "vado-concealed-shower-mixer-valve-body-chrome",
    "sku": "MF-SHW-009",
    "description": "Precision engineered Vado in-wall concealed single-lever shower mixer valve. Built with high-grade European brass casting, 40mm ceramic cartridge, and circular mirror-chrome wall plate for minimal shower aesthetics.",
    "shortDescription": "Vado in-wall single-lever concealed shower mixer valve with round chrome trim.",
    "categoryId": "cat_shower_systems",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_vado_1",
        "url": "/images/products/product_vado_concealed_shower_mixer.png",
        "altText": "Vado Concealed Shower Mixer Valve",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_vado_1",
        "key": "Brand",
        "value": "Vado"
      },
      {
        "id": "sp_vado_2",
        "key": "Installation",
        "value": "Concealed In-Wall Rough-In"
      },
      {
        "id": "sp_vado_3",
        "key": "Cartridge",
        "value": "40mm High Flow Ceramic Disc"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_anlabeier_instant_shower_heater",
    "name": "Anlabeier Matte Black Electric Instant Shower Water Heater with Handset",
    "slug": "anlabeier-matte-black-electric-instant-shower-water-heater",
    "sku": "MF-SHW-010",
    "description": "Compact, energy-efficient electric instant shower heater unit by Anlabeier in midnight matte black. Heats water in 3 seconds on demand with stepless rotary power control, digital LED temperature readout, multi-spray shower handset, hose, and wall mount.",
    "shortDescription": "Anlabeier 3-second instant electric shower water heater with digital temperature display.",
    "categoryId": "cat_shower_systems",
    "unit": "complete kit",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 16,
    "images": [
      {
        "id": "img_anlabeier_1",
        "url": "/images/products/product_anlabeier_instant_shower_heater.png",
        "altText": "Anlabeier Electric Instant Shower Heater",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_anl_1",
        "key": "Brand",
        "value": "Anlabeier"
      },
      {
        "id": "sp_anl_2",
        "key": "Heating Time",
        "value": "3-Second Instant Endless Hot Water"
      },
      {
        "id": "sp_anl_3",
        "key": "Safety Protection",
        "value": "Anti-Scald, Dry Heat Cutoff & Double Earth Isolation"
      },
      {
        "id": "sp_anl_4",
        "key": "Included Handset",
        "value": "3-Mode Spray Handset with Hose & Holder"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_black_nano_double_bowl_sink_faucet",
    "name": "Black Nano Stainless Steel Double Bowl Kitchen Sink with Pull-Down Faucet",
    "slug": "black-nano-stainless-double-bowl-kitchen-sink-faucet",
    "sku": "MF-SNK-002",
    "description": "Cutting-edge double bowl kitchen sink with bionic lotus-leaf hydrophobic nano coating in charcoal black. Oil, food residue, and water droplets glide off instantly. Complete package includes matching black pull-out mixer faucet, stainless colander, and full drain kit.",
    "shortDescription": "Charcoal black nano double bowl stainless sink set with pull-down spray faucet and colander.",
    "categoryId": "cat_kitchen_sinks",
    "unit": "complete set",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 18,
    "images": [
      {
        "id": "img_nano_sink_faucet_1",
        "url": "/images/products/product_black_nano_double_bowl_sink_faucet.png",
        "altText": "Black Nano Double Bowl Sink with Faucet",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_bn_1",
        "key": "Coating",
        "value": "Hydrophobic Oil-Repelling Nano Bionic Finish"
      },
      {
        "id": "sp_bn_2",
        "key": "Configuration",
        "value": "Double Deep Basins with Integrated Tap Deck"
      },
      {
        "id": "sp_bn_3",
        "key": "Included Accessories",
        "value": "Pull-Down Faucet, Wire Colander Basket, Drain Traps"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_current_italy_single_sink",
    "name": "Current Italy Stainless Steel Single Bowl Inset Kitchen Sink",
    "slug": "current-italy-stainless-steel-single-bowl-inset-kitchen-sink",
    "sku": "MF-SNK-003",
    "description": "Italian design high-grade stainless steel single bowl inset kitchen sink with spacious ribbed side drainer board. Embossed with subtle water grooves to speed up glass drying, plus deep drawn seamless bowl.",
    "shortDescription": "Current Italy high-grade stainless steel single bowl sink with side drainer board.",
    "categoryId": "cat_kitchen_sinks",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_cur_italy_1",
        "url": "/images/products/product_current_italy_single_sink.png",
        "altText": "Current Italy Single Bowl Kitchen Sink",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_ci_1",
        "key": "Brand",
        "value": "Current Italy Design"
      },
      {
        "id": "sp_ci_2",
        "key": "Configuration",
        "value": "Deep Single Bowl + Channeled Drainer Board"
      },
      {
        "id": "sp_ci_3",
        "key": "Material",
        "value": "Polished SUS304 Stainless Steel"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_stainless_double_bowl_radial_drainboard",
    "name": "Stainless Steel Double Bowl Kitchen Sink with Radial Drainboard",
    "slug": "stainless-steel-double-bowl-kitchen-sink-radial-drainboard",
    "sku": "MF-SNK-004",
    "description": "High-capacity double bowl inset kitchen sink featuring an expansive radial ribbed drainboard. Provides twin wash and rinse basins plus full drainage space for dishes and prep. Heavy gauge construction with underbody soundproofing.",
    "shortDescription": "Double bowl stainless kitchen sink with wide radial ribbed drying board.",
    "categoryId": "cat_kitchen_sinks",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_radial_db_1",
        "url": "/images/products/product_stainless_double_bowl_radial_drainboard.png",
        "altText": "Double Bowl Sink with Radial Drainboard",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_rdb_1",
        "key": "Layout",
        "value": "Double Bowl + Side Drainboard"
      },
      {
        "id": "sp_rdb_2",
        "key": "Thickness",
        "value": "1.0mm Heavy Gauge Steel"
      },
      {
        "id": "sp_rdb_3",
        "key": "Sound Dampening",
        "value": "Full Underside Rubber Cushion Pads"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_stainless_equal_double_bowl_sink",
    "name": "Stainless Steel Equal Double Bowl Kitchen Sink (No Drainboard)",
    "slug": "stainless-steel-equal-double-bowl-kitchen-sink-no-drainboard",
    "sku": "MF-SNK-005",
    "description": "Space-saving 50/50 symmetrical double bowl stainless steel kitchen sink. Compact footprint fits countertops and kitchen islands while providing two full-depth basins for washing and sanitizing.",
    "shortDescription": "Symmetrical 50/50 dual basin stainless steel kitchen sink without drainboard.",
    "categoryId": "cat_kitchen_sinks",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_equal_double_1",
        "url": "/images/products/product_stainless_equal_double_bowl_sink.png",
        "altText": "Equal Double Bowl Stainless Sink",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_eqd_1",
        "key": "Bowl Split",
        "value": "50/50 Equal Double Basins"
      },
      {
        "id": "sp_eqd_2",
        "key": "Mounting Style",
        "value": "Topmount Drop-In or Undermount"
      },
      {
        "id": "sp_eqd_3",
        "key": "Waste Outlet",
        "value": "Standard 3.5\" (90mm) Waste Openings"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_stainless_double_bowl_fluted_drainboard",
    "name": "Stainless Steel Double Bowl Kitchen Sink with Fluted Drainboard",
    "slug": "stainless-steel-double-bowl-kitchen-sink-fluted-drainboard",
    "sku": "MF-SNK-006",
    "description": "Heavy duty inset double bowl stainless sink with curved fluted drainer channels. Crafted with rounded internal bowl corners for fast wipe-downs and pre-cut tap deck hole.",
    "shortDescription": "Double bowl stainless sink with curved fluted drainage channels and pre-cut tap hole.",
    "categoryId": "cat_kitchen_sinks",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_fluted_db_1",
        "url": "/images/products/product_stainless_double_bowl_fluted_drainboard.png",
        "altText": "Double Bowl Sink with Fluted Drainboard",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_fdb_1",
        "key": "Drainer Pattern",
        "value": "Curved Fluted Non-Pooling Drainage Grooves"
      },
      {
        "id": "sp_fdb_2",
        "key": "Finish",
        "value": "Brushed Satin Corrosion Proof"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_ks7843_handmade_double_sink",
    "name": "Handmade SUS304 Satin Double Bowl Kitchen Sink (KS7843) with Colander & Dispenser",
    "slug": "handmade-sus304-satin-double-bowl-kitchen-sink-ks7843",
    "sku": "MF-SNK-007",
    "description": "Handcrafted premium kitchen sink model KS7843 constructed from thick 3.0mm SUS304 stainless steel sheets with tight R10 inner corners and X-flume drainage slopes. Includes matching stainless prep colander, top-fill liquid soap dispenser, and dual basket waste strainers.",
    "shortDescription": "Handcrafted 3mm thick SUS304 double bowl sink with colander and soap dispenser.",
    "categoryId": "cat_kitchen_sinks",
    "unit": "complete set",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 19,
    "images": [
      {
        "id": "img_ks7843_1",
        "url": "/images/products/product_ks7843_handmade_double_sink.png",
        "altText": "Handmade SUS304 Double Bowl Sink KS7843",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_ks_1",
        "key": "Model & Size",
        "value": "KS7843 (780mm x 430mm)"
      },
      {
        "id": "sp_ks_2",
        "key": "Thickness",
        "value": "3.0mm Top Flange / 1.2mm Bowl Basin"
      },
      {
        "id": "sp_ks_3",
        "key": "Included Accessories",
        "value": "Stainless Drain Colander + Built-in Soap Dispenser + Waste Traps"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_black_nano_double_sink_drainer_kit",
    "name": "Black Nano Double Bowl Kitchen Sink with Drainer Kit & Waste Pipe",
    "slug": "black-nano-double-bowl-kitchen-sink-drainer-kit",
    "sku": "MF-SNK-009",
    "description": "Deep double basin nano black kitchen sink complete with flexible odor-proof double bottle trap waste pipe, dual basket strainers, and mounting clamps. Scratch resistant, anti-fingerprint, and stain-proof matte charcoal finish.",
    "shortDescription": "Matte black nano double basin sink with complete double waste drainage kit.",
    "categoryId": "cat_kitchen_sinks",
    "unit": "complete set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_nano_drainer_1",
        "url": "/images/products/product_black_nano_double_sink_drainer_kit.png",
        "altText": "Black Nano Double Sink with Drain Kit",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_bnd_1",
        "key": "Finish",
        "value": "Black Nano Particle PVD Coating"
      },
      {
        "id": "sp_bnd_2",
        "key": "Plumbing Kit",
        "value": "Complete Double Bottle Trap & Flexible Pipe Included"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_kensplastic_magic_bend",
    "name": "Kensplastic 4\" Flexible Magic Bend Toilet Waste Connector Pipe",
    "slug": "kensplastic-4-inch-flexible-magic-bend-toilet-waste-connector",
    "sku": "MF-PIP-001",
    "description": "Heavy-duty 4-inch (110mm) extendable flexible magic bend toilet pan waste connector manufactured by Kensplastic. Features accordion expansion, heavy-gauge reinforced polymer walls, and leak-proof multi-fin rubber gasket for effortless toilet pan alignment and odor-tight sealing.",
    "shortDescription": "Kensplastic 4\" extendable flexible magic bend toilet waste connector with rubber gasket.",
    "categoryId": "cat_plumbing_pipes",
    "unit": "each",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 20,
    "images": [
      {
        "id": "img_kens_bend_1",
        "url": "/images/products/product_kensplastic_magic_bend.png",
        "altText": "Kensplastic 4\" Flexible Magic Bend Pipe",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_kb_1",
        "key": "Brand",
        "value": "Kensplastic"
      },
      {
        "id": "sp_kb_2",
        "key": "Diameter",
        "value": "4 Inch (110mm) Standard WC Outlet"
      },
      {
        "id": "sp_kb_3",
        "key": "Type",
        "value": "Flexible Extendable Magic Bend"
      },
      {
        "id": "sp_kb_4",
        "key": "Gasket",
        "value": "Heavy Duty Multi-Lip EPDM Rubber Seal"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_flexible_bottle_trap_waste",
    "name": "Flexible Basin & Sink Bottle Trap Waste Connector with Stainless Strainer",
    "slug": "flexible-basin-sink-bottle-trap-waste-connector-stainless-strainer",
    "sku": "MF-PIP-002",
    "description": "All-in-one universal flexible waste bottle trap for washbasins and kitchen sinks. Features a high-grade stainless steel top strainer with rubber plug, odor-barrier water seal trap, and extendable flexible accordion outlet pipe that bends easily around tight cabinet plumbing.",
    "shortDescription": "Flexible basin bottle trap waste connector with stainless strainer and anti-odor seal.",
    "categoryId": "cat_plumbing_pipes",
    "unit": "complete set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_flex_trap_1",
        "url": "/images/products/product_flexible_bottle_trap_waste.png",
        "altText": "Flexible Basin Bottle Trap Waste Kit",
        "displayOrder": 1,
        "isPrimary": true
      },
      {
        "id": "img_flex_trap_2",
        "url": "/images/products/product_flexible_bottle_trap_waste_box.png",
        "altText": "Flexible Waste Connector Box View",
        "displayOrder": 2,
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "id": "sp_fbt_1",
        "key": "Application",
        "value": "Bathroom Vanity Washbasins & Kitchen Sinks"
      },
      {
        "id": "sp_fbt_2",
        "key": "Top Waste",
        "value": "Stainless Steel Strainer Grate with Rubber Stopper"
      },
      {
        "id": "sp_fbt_3",
        "key": "Odor Control",
        "value": "Built-in Water Trap Barrier"
      },
      {
        "id": "sp_fbt_4",
        "key": "Outlet Pipe",
        "value": "Telescopic Extendable Corrugated Pipe"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_braided_flexible_hoses_pair",
    "name": "Braided Stainless Steel Flexible Water Inflow Hoses (Pair)",
    "slug": "braided-stainless-steel-flexible-water-inflow-hoses-pair",
    "sku": "MF-PIP-003",
    "description": "High-pressure braided stainless steel flexible supply lines sold as a pair (2 pieces). Fitted with 1/2\" brass female nuts and thick rubber washers on both ends for connecting hot and cold water to kitchen taps, vanity basin mixers, toilet cisterns, and water heaters.",
    "shortDescription": "Pair (2 pieces) of heavy-duty braided stainless steel water supply connector hoses.",
    "categoryId": "cat_plumbing_pipes",
    "unit": "pair (2 pcs)",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_braided_pair_1",
        "url": "/images/products/product_braided_flexible_hoses_pair.png",
        "altText": "Braided Stainless Flexible Water Hoses Pair",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_bfh_1",
        "key": "Quantity",
        "value": "2 Pieces (Pair for Hot & Cold)"
      },
      {
        "id": "sp_bfh_2",
        "key": "Fittings",
        "value": "1/2\" Female x 1/2\" Female Solid Brass Hex Nuts"
      },
      {
        "id": "sp_bfh_3",
        "key": "Material",
        "value": "304 Stainless Braided Wire + Non-Toxic EPDM Tube"
      },
      {
        "id": "sp_bfh_4",
        "key": "Pressure Rating",
        "value": "Up to 16 Bar Working Pressure"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_ppr_pipe_welding_machine_kit",
    "name": "Professional PPR Pipe Fusion Welding Machine Kit (Red Metal Case)",
    "slug": "professional-ppr-pipe-fusion-welding-machine-kit",
    "sku": "MF-PIP-004",
    "description": "Complete professional PPR pipe thermal socket fusion welding machine set in a rugged red metal carry case. Features fast dual heating elements, precision thermostat dial (0-300°C), sturdy floor stand, and non-stick golden Teflon welding dies for 20mm, 25mm, and 32mm PPR pipes and fittings.",
    "shortDescription": "Professional 800W PPR thermal pipe fusion welder kit in metal tool case with 20/25/32mm dies.",
    "categoryId": "cat_plumbing_pipes",
    "unit": "complete kit",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 21,
    "images": [
      {
        "id": "img_ppr_welder_1",
        "url": "/images/products/product_ppr_pipe_welding_machine_kit.png",
        "altText": "PPR Pipe Fusion Welding Machine Kit",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_ppr_1",
        "key": "Power & Voltage",
        "value": "800W - 1000W / 220V - 240V"
      },
      {
        "id": "sp_ppr_2",
        "key": "Temperature Range",
        "value": "0°C to 300°C Adjustable Thermostat"
      },
      {
        "id": "sp_ppr_3",
        "key": "Dies Included",
        "value": "20mm, 25mm, 32mm Teflon-Coated Heating Sockets"
      },
      {
        "id": "sp_ppr_4",
        "key": "Case",
        "value": "Heavy Duty Red Steel Toolbox with Floor Stand"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_lirlee_flexible_shower_hose",
    "name": "Lirlee Stainless Steel Flexible Shower & Bidet Replacement Hose (2.0M / 1.5M)",
    "slug": "lirlee-stainless-steel-flexible-shower-bidet-replacement-hose",
    "sku": "MF-PIP-005",
    "description": "Double-interlocked flexible stainless steel replacement shower and shattaf hose from Lirlee. Built with standard 1/2\" brass conical and knurled nuts, anti-burst inner core, and high flexibility that resists kinks and twisting under high bathroom water pressure.",
    "shortDescription": "Lirlee double-interlock stainless steel flexible replacement hose with brass conical nuts.",
    "categoryId": "cat_plumbing_pipes",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_lirlee_hose_1",
        "url": "/images/products/product_lirlee_flexible_shower_hose.png",
        "altText": "Lirlee Flexible Stainless Shower Hose",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_lfh_1",
        "key": "Brand",
        "value": "Lirlee"
      },
      {
        "id": "sp_lfh_2",
        "key": "Length",
        "value": "1.5M / 2.0M Universal Shower & Shattaf Hose"
      },
      {
        "id": "sp_lfh_3",
        "key": "Connections",
        "value": "Standard 1/2\" Brass Conical Nut x 1/2\" Hex Nut"
      },
      {
        "id": "sp_lfh_4",
        "key": "Structure",
        "value": "Double-Locked Spiral Stainless Steel"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_metallic_curtain_rods",
    "name": "Heavy-Duty Metallic Extendable Curtain Rods & Decorative Finials",
    "slug": "heavy-duty-metallic-extendable-curtain-rods-decorative-finials",
    "sku": "MF-HDW-001",
    "description": "Premium electroplated 28mm metallic curtain drapery rods with elegant sculpted end finials. Telescopic design allows easy width adjustment for windows and sliding doors. Includes matching heavy wall mounting brackets, rings, and hardware.",
    "shortDescription": "Heavy-duty 28mm extendable metallic curtain rods with ornate finials and brackets.",
    "categoryId": "cat_hardware_items",
    "unit": "complete set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_curtain_rods_1",
        "url": "/images/products/product_metallic_curtain_rods.png",
        "altText": "Metallic Extendable Curtain Rods",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_cr_1",
        "key": "Diameter",
        "value": "28mm Heavy Gauge Metallic Pipe"
      },
      {
        "id": "sp_cr_2",
        "key": "Function",
        "value": "Telescopic Extendable Length"
      },
      {
        "id": "sp_cr_3",
        "key": "Finish",
        "value": "Antique Brushed Brass & Matte Gunmetal"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_stainless_soap_dish_holder",
    "name": "Stainless Steel Wall Mount Slotted Soap Dish Holder",
    "slug": "stainless-steel-wall-mount-slotted-soap-dish-holder",
    "sku": "MF-HDW-002",
    "description": "Modern wall-mounted slotted soap dish basket manufactured from solid SUS304 stainless steel. Fast self-draining slotted floor prevents soap from melting in standing water. Concealed screws provide clean installation.",
    "shortDescription": "Solid SUS304 stainless steel wall-mounted self-draining slotted soap dish holder.",
    "categoryId": "cat_hardware_items",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_soap_dish_1",
        "url": "/images/products/product_stainless_soap_dish_holder.png",
        "altText": "Stainless Steel Slotted Soap Dish Holder",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_sdh_1",
        "key": "Material",
        "value": "Heavy Duty 304 Polished Stainless Steel"
      },
      {
        "id": "sp_sdh_2",
        "key": "Drainage",
        "value": "Slotted Base for Fast Self-Draining"
      },
      {
        "id": "sp_sdh_3",
        "key": "Mounting",
        "value": "Wall Fixed with Concealed Stainless Screws"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_6pc_matte_black_bathroom_set",
    "name": "6-Piece Matte Black Bathroom Accessories Hardware Set",
    "slug": "6-piece-matte-black-bathroom-accessories-hardware-set",
    "sku": "MF-HDW-003",
    "description": "Complete 6-piece bathroom hardware suite in contemporary matte black. Includes: 60cm towel bar, circular towel ring, toilet paper roll holder with cover flap, double robe/towel hooks, slotted soap basket, and frosted tumbler holder.",
    "shortDescription": "Complete 6-piece matching bathroom accessories hardware set in matte black finish.",
    "categoryId": "cat_hardware_items",
    "unit": "6-piece set",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 22,
    "images": [
      {
        "id": "img_6pc_black_1",
        "url": "/images/products/product_6pc_matte_black_bathroom_set.png",
        "altText": "6-Piece Matte Black Bathroom Accessories Set",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_6pb_1",
        "key": "Items Included",
        "value": "Towel Bar, Hand Towel Ring, Paper Holder, Robe Hooks, Soap Dish, Tumbler"
      },
      {
        "id": "sp_6pb_2",
        "key": "Finish",
        "value": "Corrosion-Proof Electroplated Matte Black"
      },
      {
        "id": "sp_6pb_3",
        "key": "Material",
        "value": "Solid SUS304 Stainless Steel & Zinc Alloy"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_6pc_brushed_stainless_bathroom_set",
    "name": "6-Piece Brushed Stainless Steel Bathroom Accessories Set",
    "slug": "6-piece-brushed-stainless-steel-bathroom-accessories-set",
    "sku": "MF-HDW-004",
    "description": "Commercial-grade 6-piece bathroom hardware set in satin brushed stainless steel. Resists corrosion, water spots, and daily wear in residential and commercial hotel restrooms.",
    "shortDescription": "6-piece brushed satin stainless steel bathroom hardware accessories collection.",
    "categoryId": "cat_hardware_items",
    "unit": "6-piece set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_6pc_brushed_1",
        "url": "/images/products/product_6pc_brushed_stainless_bathroom_set.png",
        "altText": "6-Piece Brushed Stainless Bathroom Set",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_6ps_1",
        "key": "Set Pieces",
        "value": "Full Length Towel Bar, Towel Ring, Paper Holder, 2 Robe Hooks, Soap Dish"
      },
      {
        "id": "sp_6ps_2",
        "key": "Finish",
        "value": "Brushed Satin Nickel"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_6pc_antique_brass_bathroom_set",
    "name": "6-Piece Antique Brass / Brushed Gold Bathroom Accessories Set",
    "slug": "6-piece-antique-brass-brushed-gold-bathroom-accessories-set",
    "sku": "MF-HDW-005",
    "description": "Ornate Victorian vintage 6-piece bathroom accessories collection finished in antique bronze brushed gold. Crafted with intricate embossed wall mount rosettes and solid brass construction.",
    "shortDescription": "Luxury vintage 6-piece antique brass and brushed gold bathroom hardware suite.",
    "categoryId": "cat_hardware_items",
    "unit": "6-piece set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_6pc_gold_1",
        "url": "/images/products/product_6pc_antique_brass_bathroom_set.png",
        "altText": "6-Piece Antique Brass Bathroom Set",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_6pa_1",
        "key": "Style",
        "value": "Vintage Victorian Antique Brass / Gold"
      },
      {
        "id": "sp_6pa_2",
        "key": "Material",
        "value": "Heavy Forged Brass & Zinc Alloy"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_black_gold_bathroom_hardware_set",
    "name": "Luxury Black & Gold Aluminum Bathroom Shelving & Hardware Set",
    "slug": "luxury-black-gold-aluminum-bathroom-shelving-hardware-set",
    "sku": "MF-HDW-006",
    "description": "Upscale two-tone space aluminum bathroom organization set in midnight matte black with brushed champagne gold accents. Includes 2-tier corner shower caddy shelf, towel rail, phone shelf toilet paper holder, and robe hooks.",
    "shortDescription": "Space aluminum black and gold 2-tier bathroom caddy shelf and hardware set.",
    "categoryId": "cat_hardware_items",
    "unit": "complete set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_black_gold_hw_1",
        "url": "/images/products/product_black_gold_bathroom_hardware_set.png",
        "altText": "Black & Gold Bathroom Hardware Set",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_bgh_1",
        "key": "Material",
        "value": "Aviation Space Aluminum (100% Rust-Proof)"
      },
      {
        "id": "sp_bgh_2",
        "key": "Colorway",
        "value": "Matte Black with Brushed Champagne Gold"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_oxford_brass_butt_hinges",
    "name": "Oxford Brass Plated Heavy Duty Butt Hinges (Pack of 3 Pairs)",
    "slug": "oxford-brass-plated-heavy-duty-butt-hinges-3-pairs",
    "sku": "MF-HDW-007",
    "description": "Contractor pack of heavy-duty butt door hinges by Oxford Hardware. Package includes 3 pairs (6 pieces) of 4\" x 3\" electroplated brass hinges with countersunk screw holes and matching mounting wood screws.",
    "shortDescription": "Oxford Hardware heavy-duty 4\" brass plated butt hinges (Pack of 3 pairs / 6 pcs).",
    "categoryId": "cat_hardware_items",
    "unit": "pack (3 pairs)",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_oxford_hinges_1",
        "url": "/images/products/product_oxford_brass_butt_hinges.png",
        "altText": "Oxford Brass Plated Butt Hinges Pack",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_ox_1",
        "key": "Brand",
        "value": "Oxford Hardware"
      },
      {
        "id": "sp_ox_2",
        "key": "Dimensions",
        "value": "4\" x 3\" x 2.5mm Gauge"
      },
      {
        "id": "sp_ox_3",
        "key": "Quantity",
        "value": "3 Pairs (6 Individual Hinges) with Screws"
      },
      {
        "id": "sp_ox_4",
        "key": "Finish",
        "value": "Polished Brass Electroplate"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_abtpure_2stage_water_purifier",
    "name": "ABT-Pure 2-Stage Water Purification System with Faucet & Bracket",
    "slug": "abtpure-2-stage-water-purification-system-faucet-bracket",
    "sku": "MF-HDW-008",
    "description": "Dual-stage under-sink drinking water filtration system by ABT-Pure. Stage 1: 5-micron PP sediment filter removes rust, silt, and sand. Stage 2: Activated carbon block removes chlorine, bad odors, organic impurities, and bacteria. Includes chrome drinking faucet, tubing, and mounting bracket.",
    "shortDescription": "ABT-Pure 2-stage drinking water purifier system with pure water tap and bracket.",
    "categoryId": "cat_hardware_items",
    "unit": "complete system",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 23,
    "images": [
      {
        "id": "img_abtpure_1",
        "url": "/images/products/product_abtpure_2stage_water_purifier.png",
        "altText": "ABT-Pure 2-Stage Water Purifier System",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_abt_1",
        "key": "Brand",
        "value": "ABT-Pure Water Systems"
      },
      {
        "id": "sp_abt_2",
        "key": "Filtration Stages",
        "value": "Stage 1 (PP Sediment) + Stage 2 (CTO Carbon Block)"
      },
      {
        "id": "sp_abt_3",
        "key": "Included Components",
        "value": "Dual 10\" Housings, Wall Bracket, Dedicated Gooseneck Tap, Tubing & Spanner"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_sopure_10inch_water_filter",
    "name": "So-Pure 10\" In-Line Single Water Filter Housing & Sediment Cartridge",
    "slug": "sopure-10-inch-inline-single-water-filter-housing-cartridge",
    "sku": "MF-HDW-009",
    "description": "Heavy duty 10-inch in-line point-of-entry water filter housing by So-Pure. Equipped with 3/4\" brass-threaded ports, pressure relief valve, transparent blue sump bowl, and 5-micron melt-blown polypropylene sediment cartridge.",
    "shortDescription": "So-Pure 10\" single water filter housing with 3/4\" brass ports and sediment cartridge.",
    "categoryId": "cat_hardware_items",
    "unit": "complete unit",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_sopure_1",
        "url": "/images/products/product_sopure_10inch_water_filter.png",
        "altText": "So-Pure 10\" Water Filter Housing",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_spu_1",
        "key": "Brand",
        "value": "So-Pure Filtration"
      },
      {
        "id": "sp_spu_2",
        "key": "Housing Size",
        "value": "Standard 10 Inch In-Line Filter"
      },
      {
        "id": "sp_spu_3",
        "key": "Ports",
        "value": "3/4\" Female Brass-Reinforced In/Out Ports"
      },
      {
        "id": "sp_spu_4",
        "key": "Cartridge",
        "value": "5-Micron Melt-Blown PP Sediment Cartridge Included"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_antique_brass_geometric_mortise_lock",
    "name": "Antique Brass Security Mortise Door Lock with Geometric Lever Handles",
    "slug": "antique-brass-security-mortise-door-lock-geometric-lever",
    "sku": "MF-HDW-010",
    "description": "Solid zinc alloy security mortise door lock set in rich antique brass finish. Features bold geometric rectangular backplates, sculpted ergonomic levers, heavy double-throw deadbolt lockcase, and brass cylinder with 3 precision computer keys.",
    "shortDescription": "Architectural antique brass mortise door lock set with geometric lever backplates.",
    "categoryId": "cat_hardware_items",
    "unit": "complete set",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 24,
    "images": [
      {
        "id": "img_ant_geo_lock_1",
        "url": "/images/products/product_antique_brass_geometric_mortise_lock.png",
        "altText": "Antique Brass Geometric Mortise Lock",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_abg_1",
        "key": "Lock Type",
        "value": "Heavy Duty Mortise Sash Lock Set"
      },
      {
        "id": "sp_abg_2",
        "key": "Finish",
        "value": "Weathered Antique Brushed Brass"
      },
      {
        "id": "sp_abg_3",
        "key": "Security",
        "value": "Solid Brass Double-Cylinder with 3 Dimple Keys"
      },
      {
        "id": "sp_abg_4",
        "key": "Door Thickness",
        "value": "Fits 35mm - 55mm Wooden / Metal Doors"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_classic_antique_curved_mortise_lock",
    "name": "Classic Antique Brass Curved Lever Mortise Door Lock Set",
    "slug": "classic-antique-brass-curved-lever-mortise-door-lock-set",
    "sku": "MF-HDW-011",
    "description": "Traditional antique brass mortise lockset with contoured wave wave lever handles and bevel-edged escutcheon plates. Smooth sprung lever return mechanism with reversible latch bolt for left or right swinging doors.",
    "shortDescription": "Classic curved lever mortise entrance door lock set in antique brass finish.",
    "categoryId": "cat_hardware_items",
    "unit": "complete set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_ant_curved_lock_1",
        "url": "/images/products/product_classic_antique_curved_mortise_lock.png",
        "altText": "Classic Antique Curved Mortise Lock",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_cac_1",
        "key": "Handle Style",
        "value": "Classic Wave Curved Ergonomic Lever"
      },
      {
        "id": "sp_cac_2",
        "key": "Mechanism",
        "value": "Roller Latch & Solid Deadbolt Lockcase"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_wista_greek_key_mortise_lock",
    "name": "Wista Design Greek Key Antique Brass Heavy Duty Mortise Door Lock Set",
    "slug": "wista-design-greek-key-antique-brass-mortise-door-lock",
    "sku": "MF-HDW-012",
    "description": "Elite entrance security mortise lockset from Wista Design. Features embossed Greek Key neoclassical border along the heavy escutcheon plates, luxury scrolled lever handle, and high-security anti-drill brass cylinder with 3 computer keys.",
    "shortDescription": "Wista Design Greek Key neoclassical antique brass security mortise lockset.",
    "categoryId": "cat_hardware_items",
    "unit": "complete set",
    "status": "published",
    "isFeatured": true,
    "featuredOrder": 25,
    "images": [
      {
        "id": "img_wista_greek_1",
        "url": "/images/products/product_wista_greek_key_mortise_lock.png",
        "altText": "Wista Greek Key Mortise Door Lock Set",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_wg_1",
        "key": "Brand",
        "value": "Wista Design"
      },
      {
        "id": "sp_wg_2",
        "key": "Pattern",
        "value": "Neoclassical Greek Key Border Pattern"
      },
      {
        "id": "sp_wg_3",
        "key": "Material",
        "value": "High Density Zinc Alloy / Antique Brass"
      },
      {
        "id": "sp_wg_4",
        "key": "Cylinder",
        "value": "Anti-Pick Solid Brass Core with 3 Dimple Keys"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_wista_victorian_ornate_door_lock",
    "name": "Wista Victorian Ornate Antique Brass Lever Mortise Door Lock Set",
    "slug": "wista-victorian-ornate-antique-brass-lever-mortise-door-lock",
    "sku": "MF-HDW-013",
    "description": "Stunning Victorian-style filigree relief mortise door lockset by Wista Design. Features deep baroque engravings on the long backplate and lever handle, paired with heavy-duty security deadbolts.",
    "shortDescription": "Wista Victorian baroque engraved antique brass entrance mortise lockset.",
    "categoryId": "cat_hardware_items",
    "unit": "complete set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_wista_vic_1",
        "url": "/images/products/product_wista_victorian_ornate_door_lock.png",
        "altText": "Wista Victorian Ornate Door Lock",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_wv_1",
        "key": "Brand",
        "value": "Wista Design"
      },
      {
        "id": "sp_wv_2",
        "key": "Aesthetics",
        "value": "Victorian Baroque Embossed Filigree"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_4deadbolt_security_lockcase",
    "name": "4-Deadbolt High Security Mortise Door Lock Mechanism with Cylinder & Keys",
    "slug": "4-deadbolt-high-security-mortise-door-lock-mechanism-cylinder",
    "sku": "MF-HDW-014",
    "description": "Maximum security mortise sash lockcase equipped with 4 solid round steel deadbolts, heavy reversible brass latch, brass forend plate, Euro-profile double cylinder, and 3 security dimple keys. Designed to withstand forced entry.",
    "shortDescription": "High-security 4-deadbolt solid steel mortise lockcase with brass cylinder and 3 keys.",
    "categoryId": "cat_hardware_items",
    "unit": "complete lockcase",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_4bolt_lock_1",
        "url": "/images/products/product_4deadbolt_security_lockcase.png",
        "altText": "4-Deadbolt High Security Mortise Lock",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_4db_1",
        "key": "Deadbolts",
        "value": "4 Heavy Hardened Steel Round Bolts"
      },
      {
        "id": "sp_4db_2",
        "key": "Cylinder",
        "value": "Anti-Snap Double Euro Cylinder + 3 Keys"
      },
      {
        "id": "sp_4db_3",
        "key": "Forend",
        "value": "Heavy Solid Brass Strike & Faceplate"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_stainless_tubular_lever_door_lock",
    "name": "Stainless Steel Tubular Lever Handle Mortise Lock Set with Rosettes",
    "slug": "stainless-steel-tubular-lever-handle-mortise-lock-set-rosettes",
    "sku": "MF-HDW-015",
    "description": "Clean modern round rosette tubular lever handle mortise lockset in satin brushed stainless steel. Minimalist design ideal for interior doors, office entrances, and apartments. Includes spring-assisted levers, lockcase, and Euro cylinder.",
    "shortDescription": "Modern round rosette satin stainless tubular lever handle mortise lock set.",
    "categoryId": "cat_hardware_items",
    "unit": "complete set",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_tubular_lever_1",
        "url": "/images/products/product_stainless_tubular_lever_door_lock.png",
        "altText": "Stainless Tubular Lever Door Lock",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_stl_1",
        "key": "Design",
        "value": "Split Round Rosette with Tubular L-Handle"
      },
      {
        "id": "sp_stl_2",
        "key": "Material",
        "value": "SUS304 Brushed Stainless Steel"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_black_foldable_towel_shelf",
    "name": "Matte Black Aluminum Double Foldable Towel Shelf Rack with Hooks",
    "slug": "matte-black-aluminum-double-foldable-towel-shelf-rack-hooks",
    "sku": "MF-HDW-016",
    "description": "Space-saving 60cm wide bathroom towel rack constructed from space aluminum in matte black. Features a top shelf that folds 90 degrees flat against the wall, a bottom towel hanging bar, and 5 sliding utility robe hooks.",
    "shortDescription": "60cm matte black aluminum 90° foldable bathroom towel shelf with hooks and towel bar.",
    "categoryId": "cat_hardware_items",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_black_towel_1",
        "url": "/images/products/product_black_foldable_towel_shelf.png",
        "altText": "Matte Black Foldable Towel Shelf",
        "displayOrder": 1,
        "isPrimary": true
      },
      {
        "id": "img_black_towel_2",
        "url": "/images/products/product_black_foldable_towel_shelf_detail.png",
        "altText": "Foldable Towel Shelf Detail View",
        "displayOrder": 2,
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "id": "sp_btr_1",
        "key": "Width",
        "value": "60cm (24 Inch) Full Width"
      },
      {
        "id": "sp_btr_2",
        "key": "Fold Function",
        "value": "Upper Rack Folds 90° Upright When Empty"
      },
      {
        "id": "sp_btr_3",
        "key": "Features",
        "value": "Upper Shelf + Lower Hanging Rod + 5 Sliding Hooks"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prd_stainless_multitier_towel_shelf",
    "name": "Stainless Steel Multi-Tier Towel Shelf with Hanging Bar",
    "slug": "stainless-steel-multi-tier-towel-shelf-hanging-bar",
    "sku": "MF-HDW-017",
    "description": "Heavy duty SUS304 polished stainless steel multi-bar hotel towel rack. Deep upper tier holds multiple folded bath towels and spare linens, while lower hanging bar allows damp towels to air dry quickly.",
    "shortDescription": "SUS304 polished stainless steel multi-tier hotel bathroom towel shelf and hanging bar.",
    "categoryId": "cat_hardware_items",
    "unit": "each",
    "status": "published",
    "isFeatured": false,
    "images": [
      {
        "id": "img_ss_towel_1",
        "url": "/images/products/product_stainless_multitier_towel_shelf.png",
        "altText": "Stainless Multi-Tier Towel Shelf",
        "displayOrder": 1,
        "isPrimary": true
      }
    ],
    "specifications": [
      {
        "id": "sp_str_1",
        "key": "Material",
        "value": "High Polish 304 Stainless Steel"
      },
      {
        "id": "sp_str_2",
        "key": "Capacity",
        "value": "Holds up to 4 Folded Bath Towels + 2 Hanging"
      }
    ],
    "createdAt": "2026-11-05T00:00:00Z",
    "updatedAt": "2026-11-05T00:00:00Z"
  }
];

export const DEFAULT_REAL_PRICES: ProductPrice[] = [
  {
    "id": "prc_synnova_urinal",
    "productId": "prd_synnova_urinal",
    "price": null,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Price on Inquiry",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_orient_urinal",
    "productId": "prd_orient_urinal",
    "price": null,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Price on Inquiry",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_kensplastic_kp12_flush_kit",
    "productId": "prd_kensplastic_kp12_flush_kit",
    "price": 1250,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete kit",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_kensplastic_toilet_seat_cover",
    "productId": "prd_kensplastic_toilet_seat_cover",
    "price": 1150,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_shoshona_cistern_tank",
    "productId": "prd_shoshona_cistern_tank",
    "price": 2800,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_kensplastic_kp11_cistern",
    "productId": "prd_kensplastic_kp11_cistern",
    "price": 2650,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_foldable_toilet_safety_grab_bar",
    "productId": "prd_foldable_toilet_safety_grab_bar",
    "price": 2400,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_modern_bathroom_vanity_unit",
    "productId": "prd_modern_bathroom_vanity_unit",
    "price": 2950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_lirlee_basin_tap",
    "productId": "prd_lirlee_basin_tap",
    "price": 1100,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_lirlee_chrome_shattaf",
    "productId": "prd_lirlee_chrome_shattaf",
    "price": 950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_lirlee_black_shattaf",
    "productId": "prd_lirlee_black_shattaf",
    "price": 850,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_chrome_wall_gooseneck_tap",
    "productId": "prd_chrome_wall_gooseneck_tap",
    "price": 1100,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_flexible_silicone_kitchen_mixer",
    "productId": "prd_flexible_silicone_kitchen_mixer",
    "price": 1850,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_sus304_wall_kitchen_tap",
    "productId": "prd_sus304_wall_kitchen_tap",
    "price": 1450,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_sus304_deck_kitchen_mixer",
    "productId": "prd_sus304_deck_kitchen_mixer",
    "price": 2200,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_commercial_brushed_kitchen_mixer",
    "productId": "prd_commercial_brushed_kitchen_mixer",
    "price": 2500,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_brimix_bridge_kitchen_mixer",
    "productId": "prd_brimix_bridge_kitchen_mixer",
    "price": 2850,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_lirlee_wall_mount_kitchen_mixer",
    "productId": "prd_lirlee_wall_mount_kitchen_mixer",
    "price": 2750,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_acquaflex_bravo_kitchen_mixer",
    "productId": "prd_acquaflex_bravo_kitchen_mixer",
    "price": 2600,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_black_spring_pre_rinse_mixer",
    "productId": "prd_black_spring_pre_rinse_mixer",
    "price": 2950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_black_spring_pullout_faucet",
    "productId": "prd_black_spring_pullout_faucet",
    "price": 2850,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_water_droplet_chrome_spring_mixer",
    "productId": "prd_water_droplet_chrome_spring_mixer",
    "price": 2950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_chrome_commercial_spring_tap",
    "productId": "prd_chrome_commercial_spring_tap",
    "price": 2900,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_gunmetal_pullout_kitchen_mixer",
    "productId": "prd_gunmetal_pullout_kitchen_mixer",
    "price": 2950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_black_square_shattaf_boxed",
    "productId": "prd_black_square_shattaf_boxed",
    "price": 1100,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_chrome_ribbed_shattaf_boxed",
    "productId": "prd_chrome_ribbed_shattaf_boxed",
    "price": 950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_polished_gold_square_shattaf_set",
    "productId": "prd_polished_gold_square_shattaf_set",
    "price": 1450,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_sus304_brushed_shattaf_set",
    "productId": "prd_sus304_brushed_shattaf_set",
    "price": 950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_milano_instant_heater_shower",
    "productId": "prd_milano_instant_heater_shower",
    "price": 2950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete system",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_concealed_thermostatic_shower_set",
    "productId": "prd_concealed_thermostatic_shower_set",
    "price": 2950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_brimix_concealed_shower_mixer",
    "productId": "prd_brimix_concealed_shower_mixer",
    "price": 2900,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_brimix_8807_exposed_shower_column",
    "productId": "prd_brimix_8807_exposed_shower_column",
    "price": 2950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete column",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_round_ultra_slim_rain_shower",
    "productId": "prd_round_ultra_slim_rain_shower",
    "price": 1200,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_lirlee_lr35202_black_rain_shower",
    "productId": "prd_lirlee_lr35202_black_rain_shower",
    "price": 1450,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_black_square_shower_with_arm",
    "productId": "prd_black_square_shower_with_arm",
    "price": 1650,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_dual_flow_square_shower_head",
    "productId": "prd_dual_flow_square_shower_head",
    "price": 1500,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_vado_concealed_shower_mixer",
    "productId": "prd_vado_concealed_shower_mixer",
    "price": 2800,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_anlabeier_instant_shower_heater",
    "productId": "prd_anlabeier_instant_shower_heater",
    "price": 2950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete kit",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_black_nano_double_bowl_sink_faucet",
    "productId": "prd_black_nano_double_bowl_sink_faucet",
    "price": 2950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_current_italy_single_sink",
    "productId": "prd_current_italy_single_sink",
    "price": 2600,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_stainless_double_bowl_radial_drainboard",
    "productId": "prd_stainless_double_bowl_radial_drainboard",
    "price": 2900,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_stainless_equal_double_bowl_sink",
    "productId": "prd_stainless_equal_double_bowl_sink",
    "price": 2800,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_stainless_double_bowl_fluted_drainboard",
    "productId": "prd_stainless_double_bowl_fluted_drainboard",
    "price": 2850,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_ks7843_handmade_double_sink",
    "productId": "prd_ks7843_handmade_double_sink",
    "price": 2950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_black_nano_double_sink_drainer_kit",
    "productId": "prd_black_nano_double_sink_drainer_kit",
    "price": 2950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_kensplastic_magic_bend",
    "productId": "prd_kensplastic_magic_bend",
    "price": 950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_flexible_bottle_trap_waste",
    "productId": "prd_flexible_bottle_trap_waste",
    "price": 900,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_braided_flexible_hoses_pair",
    "productId": "prd_braided_flexible_hoses_pair",
    "price": 900,
    "previousPrice": null,
    "currency": "KES",
    "unit": "pair (2 pcs)",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_ppr_pipe_welding_machine_kit",
    "productId": "prd_ppr_pipe_welding_machine_kit",
    "price": 2850,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete kit",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_lirlee_flexible_shower_hose",
    "productId": "prd_lirlee_flexible_shower_hose",
    "price": 900,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_metallic_curtain_rods",
    "productId": "prd_metallic_curtain_rods",
    "price": 2400,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_stainless_soap_dish_holder",
    "productId": "prd_stainless_soap_dish_holder",
    "price": 950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_6pc_matte_black_bathroom_set",
    "productId": "prd_6pc_matte_black_bathroom_set",
    "price": 2950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "6-piece set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_6pc_brushed_stainless_bathroom_set",
    "productId": "prd_6pc_brushed_stainless_bathroom_set",
    "price": 2850,
    "previousPrice": null,
    "currency": "KES",
    "unit": "6-piece set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_6pc_antique_brass_bathroom_set",
    "productId": "prd_6pc_antique_brass_bathroom_set",
    "price": 2950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "6-piece set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_black_gold_bathroom_hardware_set",
    "productId": "prd_black_gold_bathroom_hardware_set",
    "price": 2900,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_oxford_brass_butt_hinges",
    "productId": "prd_oxford_brass_butt_hinges",
    "price": 950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "pack (3 pairs)",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_abtpure_2stage_water_purifier",
    "productId": "prd_abtpure_2stage_water_purifier",
    "price": 2950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete system",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_sopure_10inch_water_filter",
    "productId": "prd_sopure_10inch_water_filter",
    "price": 1650,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete unit",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_antique_brass_geometric_mortise_lock",
    "productId": "prd_antique_brass_geometric_mortise_lock",
    "price": 2850,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_classic_antique_curved_mortise_lock",
    "productId": "prd_classic_antique_curved_mortise_lock",
    "price": 2750,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_wista_greek_key_mortise_lock",
    "productId": "prd_wista_greek_key_mortise_lock",
    "price": 2950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_wista_victorian_ornate_door_lock",
    "productId": "prd_wista_victorian_ornate_door_lock",
    "price": 2950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_4deadbolt_security_lockcase",
    "productId": "prd_4deadbolt_security_lockcase",
    "price": 2850,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete lockcase",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_stainless_tubular_lever_door_lock",
    "productId": "prd_stainless_tubular_lever_door_lock",
    "price": 2200,
    "previousPrice": null,
    "currency": "KES",
    "unit": "complete set",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_black_foldable_towel_shelf",
    "productId": "prd_black_foldable_towel_shelf",
    "price": 1850,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  },
  {
    "id": "prc_stainless_multitier_towel_shelf",
    "productId": "prd_stainless_multitier_towel_shelf",
    "price": 1950,
    "previousPrice": null,
    "currency": "KES",
    "unit": "each",
    "effectiveDate": "2026-11-05T00:00:00Z",
    "updatedBy": "Store Manager",
    "reason": "Store catalogue price",
    "updatedAt": "2026-11-05T00:00:00Z"
  }
];

export const DEFAULT_CATALOG_ITEMS: CatalogProductItem[] = DEFAULT_REAL_PRODUCTS.map((prod) => {
  const pr = DEFAULT_REAL_PRICES.find((p) => p.productId === prod.id);
  const priceVal = pr ? pr.price : null;
  const currency = pr?.currency || 'KES';
  const hasPrice = priceVal !== null && priceVal !== undefined && priceVal > 0;
  const cat = DEFAULT_CATEGORIES.find((c) => c.id === prod.categoryId);
  return {
    ...prod,
    category: cat,
    price: priceVal,
    previousPrice: null,
    currency,
    priceDisplayState: hasPrice ? 'configured' : 'contact_for_price',
    formattedPrice: formatPriceValue(priceVal, currency),
  };
});

export const supabaseCatalogueRepo = {
  async listCategories(): Promise<Category[]> {
    try {
      const sb = getSupabaseClient();
      const { data, error } = await sb
        .from('categories')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map(mapCategoryRow);
      }
    } catch (_) {}
    return DEFAULT_CATEGORIES;
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
    let items: Product[] = [];
    try {
      const sb = getSupabaseClient();
      const [catRes, prodRes] = await Promise.all([
        sb.from('categories').select('*'),
        sb.from('products').select('*').order('featured_order', { ascending: true, nullsFirst: false }),
      ]);

      const catMap: Record<string, Category> = {};
      if (catRes.data && catRes.data.length > 0) {
        for (const c of catRes.data) {
          catMap[c.id] = mapCategoryRow(c);
        }
      } else {
        DEFAULT_CATEGORIES.forEach((c) => (catMap[c.id] = c));
      }

      if (prodRes.data && prodRes.data.length > 0) {
        items = prodRes.data.map((r) => mapProductRow(r, catMap));
      }
      if (prodRes.error) {
        console.error('[supabaseCatalogueRepo.listProducts] Error:', prodRes.error.message);
      }
    } catch (err: any) {
      console.error('[supabaseCatalogueRepo.listProducts] Exception:', err.message);
    }

    if (filters?.status) {
      items = items.filter((p) => p.status === filters.status);
    }
    if (filters?.categoryId) {
      const target = filters.categoryId.trim().toLowerCase();
      items = items.filter(
        (p) =>
          (p.categoryId && p.categoryId.toLowerCase() === target) ||
          (p.category?.id && p.category.id.toLowerCase() === target) ||
          (p.category?.slug && p.category.slug.toLowerCase() === target)
      );
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
    try {
      const sb = getSupabaseClient();
      const { data, error } = await sb.from('products').select('*').eq('id', id).maybeSingle();
      if (!error && data) {
        const categories = await this.listCategories();
        const catMap: Record<string, Category> = {};
        categories.forEach((c) => (catMap[c.id] = c));
        return mapProductRow(data, catMap);
      }
    } catch (_) {}
    return null;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const sb = getSupabaseClient();
      const { data, error } = await sb.from('products').select('*').eq('slug', slug).maybeSingle();
      if (!error && data) {
        const categories = await this.listCategories();
        const catMap: Record<string, Category> = {};
        categories.forEach((c) => (catMap[c.id] = c));
        return mapProductRow(data, catMap);
      }
    } catch (_) {}
    return null;
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

  async deleteProduct(id: string): Promise<boolean> {
    const sb = getSupabaseClient();
    await sb.from('price_history').delete().eq('product_id', id);
    await sb.from('product_prices').delete().eq('product_id', id);
    const { data, error } = await sb
      .from('products')
      .delete()
      .eq('id', id)
      .select('id');
    if (error) throw new Error(error.message);
    return !!(data && data.length > 0);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Pricing Repository (Supabase)
// ─────────────────────────────────────────────────────────────────────────────

export const supabasePricingRepo = {
  async listPrices(): Promise<ProductPrice[]> {
    try {
      const sb = getSupabaseClient();
      const { data, error } = await sb.from('product_prices').select('*');
      if (!error && data && data.length > 0) {
        return data.map(mapPriceRow);
      }
    } catch (_) {}
    return DEFAULT_REAL_PRICES;
  },

  async getPriceByProductId(productId: string): Promise<ProductPrice | null> {
    try {
      const sb = getSupabaseClient();
      const { data, error } = await sb
        .from('product_prices')
        .select('*')
        .eq('product_id', productId)
        .maybeSingle();
      if (!error && data) {
        return mapPriceRow(data);
      }
    } catch (_) {}
    return DEFAULT_REAL_PRICES.find((p) => p.productId === productId) || null;
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

  listAssets(filters?: { category?: string; search?: string }): Promise<MediaAsset[]> {
    return this.listMediaAssets(filters);
  },

  createAsset(asset: MediaAsset): Promise<MediaAsset> {
    return this.createMediaAsset(asset);
  },

  updateAsset(
    id: string,
    updates: { altText?: string; category?: MediaAsset['category'] }
  ): Promise<MediaAsset | null> {
    return this.updateMediaAsset(id, updates);
  },

  deleteAsset(id: string): Promise<MediaAsset | null> {
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
  secondaryPhone: '0721435772',
  secondaryPhoneFormatted: '+254721435772',
  secondaryWhatsappNumber: '+254721435772',
  smsNumber: '+254714843208',
  email: 'info@michaforge.co.ke',
  address: 'Kombo Munyiri Rd, Gikomba, next to Gold Stone Plaza, Nairobi, Kenya',
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

const DEFAULT_ABOUT: AboutContent = {
  title: 'About Us',
  description:
    'Michaforge Enterprises is a trusted supplier and dealer in plumbing and hardware materials, committed to providing quality products at competitive prices. We pride ourselves on offering a wide range of reliable products to meet the needs of homeowners, contractors, builders and other industry professionals. Our focus is on quality, affordability and excellent customer service. At Michaforge Enterprises, our goal is to deliver value and earn the trust of every customer we serve. Our commitment is simple: Quality products, fair prices and customer satisfaction.',
  paragraphs: [
    'Michaforge Enterprises is a trusted supplier and dealer in plumbing and hardware materials, committed to providing quality products at competitive prices.',
    'We pride ourselves on offering a wide range of reliable products to meet the needs of homeowners, contractors, builders and other industry professionals. Our focus is on quality, affordability and excellent customer service.',
    'At Michaforge Enterprises, our goal is to deliver value and earn the trust of every customer we serve. Our commitment is simple: Quality products, fair prices and customer satisfaction.',
  ],
  valuesLead:
    'Our values are built on honesty, quality, affordability and excellent customer service:',
  features: [
    {
      title: 'Quality',
      desc: 'Reliable products you can trust.',
    },
    {
      title: 'Affordability',
      desc: 'Competitive prices that offer value for money.',
    },
    {
      title: 'Customer Service',
      desc: 'Friendly, dependable and professional service.',
    },
  ],
  mission: 'To provide quality plumbing and hardware materials at affordable prices.',
  vision:
    'To be the leading destination for plumbing and hardware solutions in quality, affordability and excellence.',
  slogan: '"Building Trust Through Quality and Reliability."',
  location: 'Kombo Munyiri Rd, Gikomba, next to Gold Stone Plaza, Nairobi, Kenya',
};

export const supabaseContentRepo = {
  async getSiteContent(): Promise<{ brand: BrandSettings; aboutContent: AboutContent }> {
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
    const { brand } = await this.getSiteContent();
    return brand;
  },

  async getAboutContent(): Promise<typeof DEFAULT_ABOUT> {
    const { aboutContent } = await this.getSiteContent();
    return aboutContent;
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
        previousPrice: null,
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
      previousPrice: null,
      currency,
      priceDisplayState: hasPrice ? 'configured' : 'contact_for_price',
      formattedPrice: formatPriceValue(priceVal, currency),
    };
  },
};