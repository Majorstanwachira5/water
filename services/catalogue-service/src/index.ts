import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Product, Category, ProductStatus } from '@michaforge/shared-contracts';

const PORT = process.env.PORT || 4002;
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'catalogue_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface CatalogueDatabase {
  categories: Category[];
  products: Product[];
}

function initialSeed(): CatalogueDatabase {
  const categories: Category[] = [
    {
      id: 'cat_pvc_pipes',
      name: 'PVC Pipes',
      slug: 'pvc-pipes',
      description: 'Durable & Reliable',
      iconName: 'pipe',
      imageUrl: '/images/products/product_pvc_pipes.png',
      displayOrder: 1,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cat_pipe_fittings',
      name: 'Pipe Fittings',
      slug: 'pipe-fittings',
      description: 'Various Sizes & Types',
      iconName: 'fittings',
      imageUrl: '/images/products/product_pipe_fittings.png',
      displayOrder: 2,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cat_taps_faucets',
      name: 'Taps & Faucets',
      slug: 'taps-faucets',
      description: 'Quality & Stylish',
      iconName: 'tap',
      imageUrl: '/images/products/product_bib_cock.png',
      displayOrder: 3,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cat_valves',
      name: 'Valves',
      slug: 'valves',
      description: 'Control Your Flow',
      iconName: 'valve',
      imageUrl: '/images/products/product_brass_valve.png',
      displayOrder: 4,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cat_water_tanks',
      name: 'Water Tanks',
      slug: 'water-tanks',
      description: 'Storage Solutions',
      iconName: 'tank',
      imageUrl: '/images/products/product_water_tank.png',
      displayOrder: 5,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cat_hardware_items',
      name: 'Hardware Items',
      slug: 'hardware-items',
      description: 'Building Essentials',
      iconName: 'hardware',
      imageUrl: '/images/products/product_hardware_accessories.png',
      displayOrder: 6,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const products: Product[] = [
    {
      id: 'prd_pvc_4in',
      name: 'PVC Pipes (4")',
      slug: 'pvc-pipes-4-inch',
      sku: 'MF-PVC-004',
      description: 'High-grade 4-inch heavy duty PVC drainage and waste water pipe. Weather resistant, durable and reliable.',
      shortDescription: 'Heavy duty 4" PVC pipe for residential and commercial plumbing.',
      categoryId: 'cat_pvc_pipes',
      unit: 'per 6 m length',
      status: 'published',
      isFeatured: true,
      featuredOrder: 1,
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
      seoTitle: 'Buy 4 Inch PVC Pipes in Kenya | Michaforge Enterprises',
      seoDescription: 'High quality 4-inch PVC pipes per 6m length in Kenya. Call 0714843208 for enquiries.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      status: 'published',
      isFeatured: true,
      featuredOrder: 2,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      status: 'published',
      isFeatured: true,
      featuredOrder: 3,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      status: 'published',
      isFeatured: true,
      featuredOrder: 4,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      status: 'published',
      isFeatured: true,
      featuredOrder: 5,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      status: 'published',
      isFeatured: true,
      featuredOrder: 6,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { categories, products };
}

function loadDb(): CatalogueDatabase {
  if (!fs.existsSync(DB_FILE)) {
    const initial = initialSeed();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDb(data: CatalogueDatabase) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'catalogue-service', timestamp: new Date().toISOString() });
});

// Categories
app.get('/api/v1/categories', (req, res) => {
  const db = loadDb();
  const sorted = [...db.categories].sort((a, b) => a.displayOrder - b.displayOrder);
  res.json({ success: true, data: sorted });
});

app.post('/api/v1/categories', (req, res) => {
  const { name, description, iconName, imageUrl, displayOrder } = req.body;
  if (!name) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Category name is required' },
    });
  }
  const db = loadDb();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCat: Category = {
    id: `cat_${crypto.randomUUID().slice(0, 8)}`,
    name,
    slug,
    description: description || '',
    iconName: iconName || 'pipe',
    imageUrl: imageUrl || '',
    displayOrder: displayOrder || db.categories.length + 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.categories.push(newCat);
  saveDb(db);
  res.status(201).json({ success: true, data: newCat });
});

app.patch('/api/v1/categories/:id', (req, res) => {
  const db = loadDb();
  const cat = db.categories.find((c) => c.id === req.params.id);
  if (!cat) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Category not found' },
    });
  }
  Object.assign(cat, req.body, { updatedAt: new Date().toISOString() });
  saveDb(db);
  res.json({ success: true, data: cat });
});

app.delete('/api/v1/categories/:id', (req, res) => {
  const db = loadDb();
  db.categories = db.categories.filter((c) => c.id !== req.params.id);
  saveDb(db);
  res.json({ success: true, data: { message: 'Category deleted' } });
});

// Products
app.get('/api/v1/products', (req, res) => {
  const { categoryId, status, search, featured, page = 1, limit = 50 } = req.query;
  const db = loadDb();
  let filtered = db.products.filter((p) => {
    if (status && p.status !== status) return false;
    if (categoryId && p.categoryId !== categoryId) return false;
    if (featured === 'true' && !p.isFeatured) return false;
    if (search) {
      const q = String(search).toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Attach category object
  const populated = filtered.map((p) => ({
    ...p,
    category: db.categories.find((c) => c.id === p.categoryId),
  }));

  const pNum = Number(page);
  const lNum = Number(limit);
  const start = (pNum - 1) * lNum;
  const paginated = populated.slice(start, start + lNum);

  res.json({
    success: true,
    data: paginated,
    meta: {
      total: populated.length,
      page: pNum,
      limit: lNum,
      totalPages: Math.ceil(populated.length / lNum),
    },
  });
});

app.get('/api/v1/products/:id', (req, res) => {
  const db = loadDb();
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Product not found' },
    });
  }
  const populated = {
    ...product,
    category: db.categories.find((c) => c.id === product.categoryId),
  };
  res.json({ success: true, data: populated });
});

app.get('/api/v1/products/slug/:slug', (req, res) => {
  const db = loadDb();
  const product = db.products.find((p) => p.slug === req.params.slug);
  if (!product) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Product not found' },
    });
  }
  const populated = {
    ...product,
    category: db.categories.find((c) => c.id === product.categoryId),
  };
  res.json({ success: true, data: populated });
});

app.post('/api/v1/products', (req, res) => {
  const { name, sku, categoryId, unit, description, shortDescription, specifications, images, isFeatured } = req.body;
  if (!name || !sku || !categoryId || !unit) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Name, SKU, category, and unit are required' },
    });
  }

  const db = loadDb();
  if (db.products.some((p) => p.sku.toLowerCase() === sku.toLowerCase())) {
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_SKU', message: `Product with SKU ${sku} already exists` },
    });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newProduct: Product = {
    id: `prd_${crypto.randomUUID().slice(0, 8)}`,
    name,
    slug,
    sku,
    categoryId,
    unit,
    description: description || '',
    shortDescription: shortDescription || '',
    status: 'published',
    isFeatured: !!isFeatured,
    featuredOrder: isFeatured ? db.products.filter((p) => p.isFeatured).length + 1 : undefined,
    images: images || [],
    specifications: specifications || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.products.push(newProduct);
  saveDb(db);
  res.status(201).json({ success: true, data: newProduct });
});

app.patch('/api/v1/products/:id', (req, res) => {
  const db = loadDb();
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Product not found' },
    });
  }
  Object.assign(product, req.body, { updatedAt: new Date().toISOString() });
  saveDb(db);
  res.json({ success: true, data: product });
});

app.delete('/api/v1/products/:id', (req, res) => {
  const db = loadDb();
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Product not found' },
    });
  }
  // Soft delete / archive
  product.status = 'archived';
  product.archivedAt = new Date().toISOString();
  product.updatedAt = new Date().toISOString();
  saveDb(db);
  res.json({ success: true, data: { message: 'Product archived successfully' } });
});

app.listen(PORT, () => {
  loadDb();
  console.log(`[catalogue-service] Running on port ${PORT}`);
});

export default app;
