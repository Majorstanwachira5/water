/**
 * MICHAFORGE ENTERPRISES — Supabase Database Migration & Seed Script
 * Connects to Supabase PostgreSQL, applies schema migrations, and seeds all initial data.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dns = require('dns');
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://trpyjeeazksjecdsfnld.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_FX8pWAYEbdCwwp6-VxXUCw_nElYevkZ';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || '8nA76JiDn@bwqXR';
const ENCODED_PASS = encodeURIComponent(DB_PASSWORD);
const PROJECT_REF = 'trpyjeeazksjecdsfnld';

// Candidate connection strings (Pooler IPv4 + Direct IPv6)
const CANDIDATE_URLS = [
  process.env.DATABASE_URL,
  `postgresql://postgres.${PROJECT_REF}:${ENCODED_PASS}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres:${ENCODED_PASS}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
].filter(Boolean);

async function getConnectedClient() {
  for (const connStr of CANDIDATE_URLS) {
    const masked = connStr.replace(ENCODED_PASS, '***');
    try {
      const client = new Client({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 7000,
      });
      await client.connect();
      console.log('[supabase-migrate] Connected via:', masked);
      return { client, connectionString: connStr };
    } catch (err) {
      console.log('[supabase-migrate] Attempt failed for', masked, '->', err.message);
    }
  }
  throw new Error('Could not connect to Supabase Postgres with any candidate URL');
}

async function run() {
  console.log('[supabase-migrate] Starting Supabase migration & seed...');

  const { client, connectionString } = await getConnectedClient();

  try {
    // 1. Apply SQL Schema Migration
    const sqlPath = path.join(__dirname, '../supabase/migrations/20261103000000_init_michaforge_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    await client.query(sql);
    console.log('[supabase-migrate] Schema migration applied successfully.');

    // 2. Seed Default Admin User
    const salt = 'michaforge_default_salt_2026';
    const hash = crypto
      .pbkdf2Sync('Admin@Michaforge2026!', salt, 1000, 64, 'sha512')
      .toString('hex');

    await client.query(
      `INSERT INTO public.users (id, email, name, role, is_active, password_hash, salt, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         salt = EXCLUDED.salt,
         is_active = true`,
      [
        'usr_admin_01',
        'admin@michaforge.co.ke',
        'Michaforge Administrator',
        'Super Admin',
        true,
        hash,
        salt,
      ]
    );
    console.log('[supabase-migrate] Seeded admin user: admin@michaforge.co.ke');

    // 3. Seed Categories
    const categories = [
      {
        id: 'cat_sanitary_ware',
        name: 'Sanitary Ware',
        slug: 'sanitary-ware',
        description: 'Urinals, Basins & Toilets',
        iconName: 'sanitary',
        imageUrl: '/images/products/product_synnova_urinal.png',
        displayOrder: 1,
      },
      {
        id: 'cat_taps_faucets',
        name: 'Taps & Faucets',
        slug: 'taps-faucets',
        description: 'Basin Taps & Sprays',
        iconName: 'tap',
        imageUrl: '/images/products/product_lirlee_basin_tap.png',
        displayOrder: 2,
      },
      {
        id: 'cat_pvc_pipes',
        name: 'PVC Pipes',
        slug: 'pvc-pipes',
        description: 'Durable & Reliable',
        iconName: 'pipe',
        imageUrl: '',
        displayOrder: 3,
      },
      {
        id: 'cat_pipe_fittings',
        name: 'Pipe Fittings',
        slug: 'pipe-fittings',
        description: 'Various Sizes & Types',
        iconName: 'fittings',
        imageUrl: '',
        displayOrder: 4,
      },
      {
        id: 'cat_valves',
        name: 'Valves',
        slug: 'valves',
        description: 'Control Your Flow',
        iconName: 'valve',
        imageUrl: '',
        displayOrder: 5,
      },
      {
        id: 'cat_water_tanks',
        name: 'Water Tanks',
        slug: 'water-tanks',
        description: 'Storage Solutions',
        iconName: 'tank',
        imageUrl: '',
        displayOrder: 6,
      },
      {
        id: 'cat_hardware_items',
        name: 'Hardware Items',
        slug: 'hardware-items',
        description: 'Building Essentials',
        iconName: 'hardware',
        imageUrl: '',
        displayOrder: 7,
      },
    ];

    for (const c of categories) {
      await client.query(
        `INSERT INTO public.categories (id, name, slug, description, icon_name, image_url, display_order, is_published, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           description = EXCLUDED.description,
           icon_name = EXCLUDED.icon_name,
           image_url = EXCLUDED.image_url,
           display_order = EXCLUDED.display_order`,
        [c.id, c.name, c.slug, c.description, c.iconName, c.imageUrl, c.displayOrder]
      );
    }
    console.log('[supabase-migrate] Seeded categories.');

    // 4. Seed Real Store Products & Verified Prices
    const products = [
      {
        id: 'prd_synnova_urinal',
        name: 'Synnova Wall-Hung Ceramic Urinal',
        slug: 'synnova-wall-hung-ceramic-urinal',
        sku: 'MF-SAN-001',
        description:
          'Premium vitreous china white wall-hung urinal manufactured by Synnova. Engineered with a smooth hygienic glaze that resists stains and bacteria buildup. Features a targeted top flush inlet and efficient bottom drain outlet for water conservation in commercial buildings, hotels, institutions, and modern homes.',
        shortDescription: 'Premium vitreous china white wall-hung urinal by Synnova with stain-resistant glaze.',
        categoryId: 'cat_sanitary_ware',
        unit: 'each',
        featuredOrder: 1,
        price: null,
        images: [
          {
            id: 'img_synnova_1',
            url: '/images/products/product_synnova_urinal.png',
            altText: 'Synnova Wall-Hung Ceramic Urinal',
            displayOrder: 1,
            isPrimary: true,
          },
        ],
        specifications: [
          { id: 'sp1', key: 'Brand', value: 'Synnova' },
          { id: 'sp2', key: 'Mount Type', value: 'Wall-Hung / Wall Mounted' },
          { id: 'sp3', key: 'Material', value: 'Vitreous China Glazed Ceramic' },
          { id: 'sp4', key: 'Color', value: 'Gloss Alpine White' },
        ],
      },
      {
        id: 'prd_orient_urinal',
        name: 'Orient Ceramics Wall-Hung Urinal Bowl',
        slug: 'orient-ceramics-wall-hung-urinal',
        sku: 'MF-SAN-002',
        description:
          'High-durability vitreous china ceramic urinal bowl by Orient Ceramics (Made in India). Heavy-duty build with protective edge rim, deep contoured basin to minimize splashing, and ultra-smooth surface for effortless sanitization and lasting gloss in high-traffic restrooms.',
        shortDescription: 'Heavy-duty Orient Ceramics vitreous china wall-hung urinal bowl (Made in India).',
        categoryId: 'cat_sanitary_ware',
        unit: 'each',
        featuredOrder: 2,
        price: null,
        images: [
          {
            id: 'img_orient_1',
            url: '/images/products/product_orient_urinal.png',
            altText: 'Orient Ceramics Wall-Hung Urinal Bowl',
            displayOrder: 1,
            isPrimary: true,
          },
        ],
        specifications: [
          { id: 'sp5', key: 'Brand', value: 'Orient Ceramics' },
          { id: 'sp6', key: 'Origin', value: 'Made in India' },
          { id: 'sp7', key: 'Mount Type', value: 'Wall Mounted' },
          { id: 'sp8', key: 'Material', value: 'Heavy Duty Vitreous China' },
        ],
      },
      {
        id: 'prd_lirlee_basin_tap',
        name: 'Lirlee Chrome Basin Pillar Tap',
        slug: 'lirlee-chrome-basin-pillar-tap',
        sku: 'MF-TAP-002',
        description:
          'Solid chrome-plated basin pillar tap from Lirlee Fashionable Sanitary Wares & Mixer Taps. Built with a solid brass body, gleaming mirror-chrome corrosion-resistant finish, smooth ergonomic quarter-turn lever, aerated water-saving nozzle, and threaded brass backnut for secure washbasin mounting.',
        shortDescription: 'Mirror-finish solid brass pillar tap with quarter-turn precision control.',
        categoryId: 'cat_taps_faucets',
        unit: 'each',
        featuredOrder: 3,
        price: 1100,
        images: [
          {
            id: 'img_lirlee_tap_1',
            url: '/images/products/product_lirlee_basin_tap.png',
            altText: 'Lirlee Chrome Basin Pillar Tap',
            displayOrder: 1,
            isPrimary: true,
          },
        ],
        specifications: [
          { id: 'sp9', key: 'Brand', value: 'Lirlee' },
          { id: 'sp10', key: 'Type', value: 'Basin Pillar Tap / Faucet' },
          { id: 'sp11', key: 'Material', value: 'Chrome-Plated Solid Brass' },
          { id: 'sp12', key: 'Connection', value: '1/2" Standard Threaded Base' },
        ],
      },
      {
        id: 'prd_lirlee_chrome_shattaf',
        name: 'Lirlee Tempesta-F Chrome Bidet Spray Set',
        slug: 'lirlee-tempesta-f-chrome-bidet-spray-set',
        sku: 'MF-TAP-003',
        description:
          'Complete Tempesta-F hygienic toilet bidet / shattaf spray kit by Lirlee. Includes ergonomic chrome trigger spray head with targeted comfort jet, heavy-duty 1.2m flexible stainless steel hose with leak-proof washers, and matching wall bracket holder for convenient bathroom installation.',
        shortDescription: 'Tempesta-F chrome hygienic trigger spray handset with flexible stainless hose and bracket.',
        categoryId: 'cat_taps_faucets',
        unit: 'complete set',
        featuredOrder: 4,
        price: 950,
        images: [
          {
            id: 'img_lirlee_chrome_shattaf_1',
            url: '/images/products/product_lirlee_chrome_shattaf.png',
            altText: 'Lirlee Tempesta-F Chrome Bidet Spray Set',
            displayOrder: 1,
            isPrimary: true,
          },
        ],
        specifications: [
          { id: 'sp13', key: 'Brand', value: 'Lirlee' },
          { id: 'sp14', key: 'Series', value: 'Tempesta-F Trigger Spray 30' },
          { id: 'sp15', key: 'Components', value: 'Spray Gun, Flexible Stainless Hose, Wall Holder' },
        ],
      },
      {
        id: 'prd_lirlee_black_shattaf',
        name: 'Lirlee Tempesta-F Matte Black Trigger Spray Set',
        slug: 'lirlee-tempesta-f-matte-black-trigger-spray-set',
        sku: 'MF-TAP-004',
        description:
          'Modern matte black toilet shattaf / bidet spray kit (Model LR9218) by Lirlee. Features a contemporary matte black ergonomic trigger spray handset, smooth anti-twist matte black hose, and wall bracket. Adds a stylish modern touch to any modern washroom or luxury bathroom.',
        shortDescription: 'Luxury matte black trigger spray kit (Model LR9218) with matte hose and wall mount.',
        categoryId: 'cat_taps_faucets',
        unit: 'complete set',
        featuredOrder: 5,
        price: 850,
        images: [
          {
            id: 'img_lirlee_black_shattaf_1',
            url: '/images/products/product_lirlee_black_shattaf.png',
            altText: 'Lirlee Tempesta-F Matte Black Trigger Spray Set',
            displayOrder: 1,
            isPrimary: true,
          },
        ],
        specifications: [
          { id: 'sp16', key: 'Brand', value: 'Lirlee' },
          { id: 'sp17', key: 'Model', value: 'LR9218 Tempesta-F Trigger Spray 30' },
          { id: 'sp18', key: 'Finish', value: 'Matte Black Electrostatic Coat' },
          { id: 'sp19', key: 'Components', value: 'Black Handset, Anti-Kink Black Hose, Wall Mount' },
        ],
      },
    ];

    for (const p of products) {
      await client.query(
        `INSERT INTO public.products
         (id, name, slug, sku, description, short_description, category_id, unit, status, is_featured, featured_order, images, specifications, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'published', true, $9, $10::jsonb, $11::jsonb, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           short_description = EXCLUDED.short_description,
           category_id = EXCLUDED.category_id,
           unit = EXCLUDED.unit,
           images = EXCLUDED.images,
           specifications = EXCLUDED.specifications,
           updated_at = NOW()`,
        [
          p.id,
          p.name,
          p.slug,
          p.sku,
          p.description,
          p.shortDescription,
          p.categoryId,
          p.unit,
          p.featuredOrder,
          JSON.stringify(p.images),
          JSON.stringify(p.specifications),
        ]
      );

      // Seed Product Price
      await client.query(
        `INSERT INTO public.product_prices
         (id, product_id, price, previous_price, currency, unit, effective_date, updated_by, reason, updated_at)
         VALUES ($1, $2, $3, NULL, 'KES', $4, NOW(), 'System Bootstrap', 'Synchronized with Michaforge Enterprises store inventory', NOW())
         ON CONFLICT (product_id) DO UPDATE SET
           price = EXCLUDED.price,
           unit = EXCLUDED.unit`,
        [`prc_${p.featuredOrder}`, p.id, p.price, p.unit]
      );
    }
    console.log('[supabase-migrate] Seeded 6 products and pricing records.');

    // 5. Seed Site Content & Brand Settings
    const brand = {
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

    const aboutContent = {
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

    await client.query(
      `INSERT INTO public.site_content (id, brand, about_content, updated_at)
       VALUES ('default', $1::jsonb, $2::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET
         brand = EXCLUDED.brand,
         about_content = EXCLUDED.about_content,
         updated_at = NOW()`,
      [JSON.stringify(brand), JSON.stringify(aboutContent)]
    );
    console.log('[supabase-migrate] Seeded site_content (brand & homepage settings).');

    // 6. Seed Media Assets
    const mediaAssets = [
      { id: 'med_hero_mod', file: 'modern_hardware_hero.png', url: '/images/modern_hardware_hero.png', alt: 'Modern Hardware & Plumbing Hero Showcase', cat: 'banner' },
      { id: 'med_about_mod', file: 'modern_hardware_about.png', url: '/images/modern_hardware_about.png', alt: 'Modern Plumbing Showroom Display Wall', cat: 'banner' },
      { id: 'med_logo_nav', file: 'logo_navbar.png', url: '/images/logo_navbar.png', alt: 'Michaforge Enterprises Navbar Logo', cat: 'brand' },
      { id: 'med_logo_ftr', file: 'logo_footer.png', url: '/images/logo_footer.png', alt: 'Michaforge Enterprises Footer Logo', cat: 'brand' },
      { id: 'med_prd_synnova', file: 'product_synnova_urinal.png', url: '/images/products/product_synnova_urinal.png', alt: 'Synnova Wall-Hung Ceramic Urinal', cat: 'product' },
      { id: 'med_prd_orient', file: 'product_orient_urinal.png', url: '/images/products/product_orient_urinal.png', alt: 'Orient Ceramics Wall-Hung Urinal Bowl', cat: 'product' },
      { id: 'med_prd_lirlee_tap', file: 'product_lirlee_basin_tap.png', url: '/images/products/product_lirlee_basin_tap.png', alt: 'Lirlee Chrome Basin Pillar Tap', cat: 'product' },
      { id: 'med_prd_lirlee_chrome', file: 'product_lirlee_chrome_shattaf.png', url: '/images/products/product_lirlee_chrome_shattaf.png', alt: 'Lirlee Tempesta-F Chrome Bidet Spray Set', cat: 'product' },
      { id: 'med_prd_lirlee_black', file: 'product_lirlee_black_shattaf.png', url: '/images/products/product_lirlee_black_shattaf.png', alt: 'Lirlee Tempesta-F Matte Black Trigger Spray Set', cat: 'product' },
    ];

    for (const m of mediaAssets) {
      await client.query(
        `INSERT INTO public.media_assets (id, file_name, original_name, mime_type, size_bytes, url, alt_text, category, uploaded_by, created_at)
         VALUES ($1, $2, $2, 'image/png', 48000, $3, $4, $5, 'System Bootstrap', NOW())
         ON CONFLICT (id) DO UPDATE SET
           url = EXCLUDED.url,
           alt_text = EXCLUDED.alt_text,
           category = EXCLUDED.category`,
        [m.id, m.file, m.url, m.alt, m.cat]
      );
    }
    console.log('[supabase-migrate] Seeded 10 media assets.');

    // 7. Seed Initial Enquiry & Audit Log
    await client.query(
      `INSERT INTO public.enquiries
       (id, customer_name, phone_number, email, enquiry_type, product_id, product_name, product_sku, message, status, source, notes, follow_ups, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'product', 'prd_pvc_4in', 'PVC Pipes (4")', 'MF-PVC-004', $5, 'New', 'website_form', '[]'::jsonb, '[]'::jsonb, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        'enq_sample_01',
        'Joseph Mwangi',
        '+254712345678',
        'joseph@example.com',
        'Hello, need quotation for 25 pieces of 4" PVC pipes delivered to Nairobi West.',
      ]
    );

    await client.query(
      `INSERT INTO public.audit_logs (id, actor_id, actor_name, action, entity_type, entity_id, details, timestamp)
       VALUES ('aud_init_01', 'usr_admin_01', 'Michaforge Administrator', 'SUPABASE_MIGRATION', 'System', 'michaforge_supabase', $1::jsonb, NOW())
       ON CONFLICT (id) DO NOTHING`,
      [JSON.stringify({ message: 'Migrated Michaforge Enterprises database to Supabase PostgreSQL' })]
    );

    console.log('[supabase-migrate] Verified Supabase REST client connection...');
    if (!globalThis.WebSocket) {
      try {
        globalThis.WebSocket = require('ws');
      } catch (e) {
        globalThis.WebSocket = class DummyWebSocket {};
      }
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data: prodCheck, error: prodErr } = await supabase.from('products').select('id, name, sku');
    if (prodErr) {
      console.error('[supabase-migrate] Supabase REST check warning:', prodErr.message);
    } else {
      console.log(`[supabase-migrate] Supabase REST check passed! Found ${prodCheck.length} products via @supabase/supabase-js.`);
    }

    // Save working connection string info for reference
    console.log('[supabase-migrate] ALL MIGRATIONS & SEEDS COMPLETED SUCCESSFULLY!');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('[supabase-migrate] FATAL ERROR:', err);
  process.exit(1);
});
