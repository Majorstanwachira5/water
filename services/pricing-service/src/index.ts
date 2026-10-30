import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ProductPrice, PriceHistoryEntry, BulkPriceImportRow } from '@michaforge/shared-contracts';
import { validatePriceValue } from '@michaforge/shared-validation';

const PORT = process.env.PORT || 4003;
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'pricing_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface PricingDatabase {
  prices: Record<string, ProductPrice>;
  history: PriceHistoryEntry[];
}

function loadDb(): PricingDatabase {
  if (!fs.existsSync(DB_FILE)) {
    // Initial seeded state: prices start as null (Contact for Price)
    // The admin dashboard allows instant 1-click update or manual entry
    const initialPrices: Record<string, ProductPrice> = {
      prd_pvc_4in: {
        id: 'prc_1',
        productId: 'prd_pvc_4in',
        price: null, // "Contact for Price" by default per business rules
        previousPrice: null,
        currency: 'KES',
        unit: 'per 6 m length',
        effectiveDate: new Date().toISOString(),
        updatedBy: 'System Bootstrap',
        reason: 'Initial setup pending business owner price confirmation',
        updatedAt: new Date().toISOString(),
      },
      prd_pipe_fittings_ast: {
        id: 'prc_2',
        productId: 'prd_pipe_fittings_ast',
        price: null,
        previousPrice: null,
        currency: 'KES',
        unit: 'per piece',
        effectiveDate: new Date().toISOString(),
        updatedBy: 'System Bootstrap',
        reason: 'Initial setup pending business owner price confirmation',
        updatedAt: new Date().toISOString(),
      },
      prd_bib_cock_tap: {
        id: 'prc_3',
        productId: 'prd_bib_cock_tap',
        price: null,
        previousPrice: null,
        currency: 'KES',
        unit: 'each',
        effectiveDate: new Date().toISOString(),
        updatedBy: 'System Bootstrap',
        reason: 'Initial setup pending business owner price confirmation',
        updatedAt: new Date().toISOString(),
      },
      prd_brass_ball_valve: {
        id: 'prc_4',
        productId: 'prd_brass_ball_valve',
        price: null,
        previousPrice: null,
        currency: 'KES',
        unit: 'each',
        effectiveDate: new Date().toISOString(),
        updatedBy: 'System Bootstrap',
        reason: 'Initial setup pending business owner price confirmation',
        updatedAt: new Date().toISOString(),
      },
      prd_water_tank_1000l: {
        id: 'prc_5',
        productId: 'prd_water_tank_1000l',
        price: null,
        previousPrice: null,
        currency: 'KES',
        unit: 'each',
        effectiveDate: new Date().toISOString(),
        updatedBy: 'System Bootstrap',
        reason: 'Initial setup pending business owner price confirmation',
        updatedAt: new Date().toISOString(),
      },
      prd_hardware_accessories: {
        id: 'prc_6',
        productId: 'prd_hardware_accessories',
        price: null,
        previousPrice: null,
        currency: 'KES',
        unit: 'per item',
        effectiveDate: new Date().toISOString(),
        updatedBy: 'System Bootstrap',
        reason: 'Initial setup pending business owner price confirmation',
        updatedAt: new Date().toISOString(),
      },
    };

    const initialDb: PricingDatabase = {
      prices: initialPrices,
      history: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDb(data: PricingDatabase) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pricing-service', timestamp: new Date().toISOString() });
});

// Get all product prices
app.get('/api/v1/pricing/products', (req, res) => {
  const db = loadDb();
  res.json({ success: true, data: Object.values(db.prices) });
});

// Get single product price
app.get('/api/v1/pricing/products/:id', (req, res) => {
  const db = loadDb();
  const priceRecord = db.prices[req.params.id];
  if (!priceRecord) {
    return res.json({
      success: true,
      data: {
        productId: req.params.id,
        price: null,
        currency: 'KES',
        unit: 'each',
        priceDisplayState: 'contact_for_price',
      },
    });
  }
  res.json({ success: true, data: priceRecord });
});

// Update or set price
app.post('/api/v1/pricing/products/:id', (req, res) => {
  const productId = req.params.id;
  const { price, unit = 'each', updatedBy = 'Administrator', reason } = req.body;

  const validation = validatePriceValue(price);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PRICE', message: validation.error || 'Invalid price' },
    });
  }

  const newPrice = validation.parsed ?? null;
  const db = loadDb();
  const existing = db.prices[productId];
  const prevPrice = existing ? existing.price : null;

  const updatedRecord: ProductPrice = {
    id: existing ? existing.id : `prc_${crypto.randomUUID().slice(0, 8)}`,
    productId,
    price: newPrice,
    previousPrice: prevPrice,
    currency: 'KES',
    unit: unit || (existing ? existing.unit : 'each'),
    effectiveDate: new Date().toISOString(),
    updatedBy,
    reason: reason || 'Price adjusted via management dashboard',
    updatedAt: new Date().toISOString(),
  };

  db.prices[productId] = updatedRecord;

  // Record audit history
  const historyEntry: PriceHistoryEntry = {
    id: `his_${crypto.randomUUID().slice(0, 8)}`,
    productId,
    previousPrice: prevPrice,
    newPrice,
    currency: 'KES',
    changedBy: updatedBy,
    reason: reason || 'Price update',
    timestamp: new Date().toISOString(),
  };
  db.history.unshift(historyEntry);

  saveDb(db);
  res.json({ success: true, data: updatedRecord });
});

// Price history
app.get('/api/v1/pricing/products/:id/history', (req, res) => {
  const db = loadDb();
  const records = db.history.filter((h) => h.productId === req.params.id);
  res.json({ success: true, data: records });
});

// Global price history
app.get('/api/v1/pricing/history', (req, res) => {
  const db = loadDb();
  res.json({ success: true, data: db.history.slice(0, 100) });
});

// Bulk Price Update (Array of { productId, price, reason })
app.post('/api/v1/pricing/bulk-update', (req, res) => {
  const { updates, updatedBy = 'Administrator' } = req.body;
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Updates array is required' },
    });
  }

  const db = loadDb();
  const results = [];

  for (const item of updates) {
    const { productId, price, unit, reason } = item;
    const validation = validatePriceValue(price);
    if (!validation.valid) continue;

    const newPrice = validation.parsed ?? null;
    const existing = db.prices[productId];
    const prevPrice = existing ? existing.price : null;

    const record: ProductPrice = {
      id: existing ? existing.id : `prc_${crypto.randomUUID().slice(0, 8)}`,
      productId,
      price: newPrice,
      previousPrice: prevPrice,
      currency: 'KES',
      unit: unit || (existing ? existing.unit : 'each'),
      effectiveDate: new Date().toISOString(),
      updatedBy,
      reason: reason || 'Bulk price update',
      updatedAt: new Date().toISOString(),
    };

    db.prices[productId] = record;
    db.history.unshift({
      id: `his_${crypto.randomUUID().slice(0, 8)}`,
      productId,
      previousPrice: prevPrice,
      newPrice,
      currency: 'KES',
      changedBy: updatedBy,
      reason: reason || 'Bulk update',
      timestamp: new Date().toISOString(),
    });
    results.push(record);
  }

  saveDb(db);
  res.json({ success: true, data: { updatedCount: results.length, records: results } });
});

// Export CSV
app.get('/api/v1/pricing/export', (req, res) => {
  const db = loadDb();
  let csv = 'Product_ID,Price_KES,Previous_Price_KES,Currency,Unit,Effective_Date,Updated_By\n';
  for (const p of Object.values(db.prices)) {
    csv += `"${p.productId}","${p.price ?? ''}","${p.previousPrice ?? ''}","${p.currency}","${p.unit}","${p.effectiveDate}","${p.updatedBy}"\n`;
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="michaforge_pricing_export.csv"');
  res.send(csv);
});

app.listen(PORT, () => {
  loadDb();
  console.log(`[pricing-service] Running on port ${PORT}`);
});

export default app;
