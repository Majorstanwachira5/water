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
        id: 'cat_pvc_pipes',
        name: 'PVC Pipes',
        slug: 'pvc-pipes',
        description: 'Durable & Reliable',
        iconName: 'pipe',
        imageUrl: '/images/products/product_pvc_pipes.png',
        displayOrder: 1,
      },
      {
        id: 'cat_pipe_fittings',
        name: 'Pipe Fittings',
        slug: 'pipe-fittings',
        description: 'Various Sizes & Types',
        iconName: 'fittings',
        imageUrl: '/images/products/product_pipe_fittings.png',
        displayOrder: 2,
      },
      {
        id: 'cat_taps_faucets',
        name: 'Taps & Faucets',
        slug: 'taps-faucets',
        description: 'Quality & Stylish',
        iconName: 'tap',
        imageUrl: '/images/products/product_bib_cock.png',
        displayOrder: 3,
      },
      {
        id: 'cat_valves',
        name: 'Valves',
        slug: 'valves',
        description: 'Control Your Flow',
        iconName: 'valve',
        imageUrl: '/images/products/product_brass_valve.png',
        displayOrder: 4,
      },
      {
        id: 'cat_water_tanks',
        name: 'Water Tanks',
        slug: 'water-tanks',
        description: 'Storage Solutions',
        iconName: 'tank',
        imageUrl: '/images/products/product_water_tank.png',
        displayOrder: 5,
      },
      {
        id: 'cat_hardware_items',
        name: 'Hardware Items',
        slug: 'hardware-items',
        description: 'Building Essentials',
        iconName: 'hardware',
        imageUrl: '/images/products/product_hardware_accessories.png',
        displayOrder: 6,
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
    console.log('[supabase-migrate] Seeded 6 categories.');

    // 4. Seed Products
    const products = [
      {
        id: 'prd_pvc_4in',
        name: 'PVC Pipes (4")',
        slug: 'pvc-pipes-4-inch',
        sku: 'MF-PVC-004',
        description: 'High-grade 4-inch heavy duty PVC drainage and waste water pipe. Weather resistant, durable and reliable.',
        shortDescription: 'Heavy duty 4" PVC pipe for residential and commercial plumbing.',
        categoryId: 'cat_pvc_pipes',
        unit: 'per 6 m length',
        featuredOrder: 1,
        price: 650,
        images: [
          {
            id: 'img_pvc_1',
            url: '/images/products/product_pvc_pipes.png',
            altText: 'Michaforge PVC Pipes (4 Inch)',
            displayOrder: 1,
            isPrimary: true,
          },
        ],
        specifications: [
          { id: 'sp1', key: 'Diameter', value: '4 Inches (110mm)' },
          { id: 'sp2', key: 'Length', value: '6 Metres' },
          { id: 'sp3', key: 'Material', value: 'Unplasticized Polyvinyl Chloride (uPVC)' },
        ],
      },
      {
        id: 'prd_pipe_fittings_ast',
        name: 'Pipe Fittings (Assorted)',
        slug: 'pipe-fittings-assorted',
        sku: 'MF-FIT-001',
        description: 'Wide selection of assorted PVC, PPR, and HDPE pipe fittings: elbows, tees, couplers, reducers, and unions.',
        shortDescription: 'Assorted fittings for water supply and drainage systems.',
        categoryId: 'cat_pipe_fittings',
        unit: 'per piece',
        featuredOrder: 2,
        price: 120,
        images: [
          {
            id: 'img_fit_1',
            url: '/images/products/product_pipe_fittings.png',
            altText: 'Pipe Fittings Assorted Types',
            displayOrder: 1,
            isPrimary: true,
          },
        ],
        specifications: [
          { id: 'sp4', key: 'Types', value: 'Elbows, Tees, Sockets, Adaptors' },
          { id: 'sp5', key: 'Pressure Rating', value: 'PN16 / PN20' },
        ],
      },
      {
        id: 'prd_bib_cock_tap',
        name: 'Bib Cock Tap',
        slug: 'bib-cock-tap',
        sku: 'MF-TAP-001',
        description: 'Solid chrome-plated brass bib cock tap. Corrosion resistant with smooth quarter-turn water control.',
        shortDescription: 'Chrome finished wall-mount bib cock tap.',
        categoryId: 'cat_taps_faucets',
        unit: 'each',
        featuredOrder: 3,
        price: 1250,
        images: [
          {
            id: 'img_tap_1',
            url: '/images/products/product_bib_cock.png',
            altText: 'Quality Chrome Bib Cock Tap',
            displayOrder: 1,
            isPrimary: true,
          },
        ],
        specifications: [
          { id: 'sp6', key: 'Connection', value: '1/2" Standard Thread' },
          { id: 'sp7', key: 'Material', value: 'Brass Chrome Finish' },
        ],
      },
      {
        id: 'prd_brass_ball_valve',
        name: 'Brass Ball Valve',
        slug: 'brass-ball-valve',
        sku: 'MF-VLV-001',
        description: 'Heavy duty brass ball valve with lever handle. Perfect for main water line shut-off and high pressure flow control.',
        shortDescription: 'Full port brass shut-off valve with lever handle.',
        categoryId: 'cat_valves',
        unit: 'each',
        featuredOrder: 4,
        price: 850,
        images: [
          {
            id: 'img_vlv_1',
            url: '/images/products/product_brass_valve.png',
            altText: 'Brass Ball Valve with Lever Handle',
            displayOrder: 1,
            isPrimary: true,
          },
        ],
        specifications: [
          { id: 'sp8', key: 'Sizes', value: '1/2", 3/4", 1", 2"' },
          { id: 'sp9', key: 'Working Pressure', value: 'Up to 25 Bar' },
        ],
      },
      {
        id: 'prd_water_tank_1000l',
        name: 'Water Tank (1,000L)',
        slug: 'water-tank-1000l',
        sku: 'MF-TNK-001',
        description: 'Heavy duty cylindrical food-grade polyethylene water storage tank with UV protection and antimicrobial layer.',
        shortDescription: '1,000 Litre UV-stabilized domestic & commercial water tank.',
        categoryId: 'cat_water_tanks',
        unit: 'each',
        featuredOrder: 5,
        price: 12500,
        images: [
          {
            id: 'img_tnk_1',
            url: '/images/products/product_water_tank.png',
            altText: 'Cylindrical 1,000L Water Storage Tank',
            displayOrder: 1,
            isPrimary: true,
          },
        ],
        specifications: [
          { id: 'sp10', key: 'Capacity', value: '1,000 Litres' },
          { id: 'sp11', key: 'Layers', value: 'Double / Triple Wall UV Shield' },
        ],
      },
      {
        id: 'prd_hardware_accessories',
        name: 'Hardware Accessories',
        slug: 'hardware-accessories',
        sku: 'MF-HDW-001',
        description: 'Essential plumbing installation hardware: PTFE thread tape, pipe wrenches, hacksaws, brackets, and PVC solvent cement.',
        shortDescription: 'Professional plumbers toolkit & installation accessories.',
        categoryId: 'cat_hardware_items',
        unit: 'per item',
        featuredOrder: 6,
        price: 250,
        images: [
          {
            id: 'img_hdw_1',
            url: '/images/products/product_hardware_accessories.png',
            altText: 'Hardware Accessories & Plumbing Tools',
            displayOrder: 1,
            isPrimary: true,
          },
        ],
        specifications: [
          { id: 'sp12', key: 'Application', value: 'Plumbing & Construction' },
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
         VALUES ($1, $2, $3, NULL, 'KES', $4, NOW(), 'System Bootstrap', 'Synchronized with Michaforge Enterprises catalogue', NOW())
         ON CONFLICT (product_id) DO UPDATE SET
           price = COALESCE(public.product_prices.price, EXCLUDED.price),
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
      { id: 'med_prd_1', file: 'product_pvc_pipes.png', url: '/images/products/product_pvc_pipes.png', alt: 'PVC Pipes (4")', cat: 'product' },
      { id: 'med_prd_2', file: 'product_pipe_fittings.png', url: '/images/products/product_pipe_fittings.png', alt: 'Pipe Fittings (Assorted)', cat: 'product' },
      { id: 'med_prd_3', file: 'product_bib_cock.png', url: '/images/products/product_bib_cock.png', alt: 'Bib Cock Tap', cat: 'product' },
      { id: 'med_prd_4', file: 'product_brass_valve.png', url: '/images/products/product_brass_valve.png', alt: 'Brass Ball Valve', cat: 'product' },
      { id: 'med_prd_5', file: 'product_water_tank.png', url: '/images/products/product_water_tank.png', alt: 'Water Tank (1,000L)', cat: 'product' },
      { id: 'med_prd_6', file: 'product_hardware_accessories.png', url: '/images/products/product_hardware_accessories.png', alt: 'Hardware Accessories', cat: 'product' },
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
