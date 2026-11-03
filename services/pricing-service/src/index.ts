import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { ProductPrice, PriceHistoryEntry, supabasePricingRepo } from '@michaforge/shared-contracts';
import { validatePriceValue } from '@michaforge/shared-validation';

const PORT = process.env.PORT || 4003;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pricing-service', storage: 'supabase', timestamp: new Date().toISOString() });
});

// Get all product prices
app.get('/api/v1/pricing/products', async (req, res) => {
  try {
    const prices = await supabasePricingRepo.listPrices();
    res.json({ success: true, data: prices });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Get single product price
app.get('/api/v1/pricing/products/:id', async (req, res) => {
  try {
    const priceRecord = await supabasePricingRepo.getPriceByProductId(req.params.id);
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
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Update or set price
app.post('/api/v1/pricing/products/:id', async (req, res) => {
  try {
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
    const existing = await supabasePricingRepo.getPriceByProductId(productId);
    const prevPrice = existing ? existing.price : null;
    const now = new Date().toISOString();

    const updatedRecord: ProductPrice = {
      id: existing ? existing.id : `prc_${crypto.randomUUID().slice(0, 8)}`,
      productId,
      price: newPrice,
      previousPrice: prevPrice,
      currency: 'KES',
      unit: unit || (existing ? existing.unit : 'each'),
      effectiveDate: now,
      updatedBy,
      reason: reason || 'Price adjusted via management dashboard',
      updatedAt: now,
    };

    const historyEntry: PriceHistoryEntry = {
      id: `his_${crypto.randomUUID().slice(0, 8)}`,
      productId,
      previousPrice: prevPrice,
      newPrice,
      currency: 'KES',
      changedBy: updatedBy,
      reason: reason || 'Price update',
      timestamp: now,
    };

    const saved = await supabasePricingRepo.upsertPrice(updatedRecord, historyEntry);
    res.json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Price history for a product
app.get('/api/v1/pricing/products/:id/history', async (req, res) => {
  try {
    const records = await supabasePricingRepo.getProductPriceHistory(req.params.id);
    res.json({ success: true, data: records });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Global price history
app.get('/api/v1/pricing/history', async (req, res) => {
  try {
    const history = await supabasePricingRepo.listPriceHistory(100);
    res.json({ success: true, data: history });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Bulk Price Update (Array of { productId, price, reason })
app.post('/api/v1/pricing/bulk-update', async (req, res) => {
  try {
    const { updates, updatedBy = 'Administrator' } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Updates array is required' },
      });
    }

    const results: ProductPrice[] = [];
    for (const item of updates) {
      const { productId, price, unit, reason } = item;
      const validation = validatePriceValue(price);
      if (!validation.valid) continue;

      const newPrice = validation.parsed ?? null;
      const existing = await supabasePricingRepo.getPriceByProductId(productId);
      const prevPrice = existing ? existing.price : null;
      const now = new Date().toISOString();

      const record: ProductPrice = {
        id: existing ? existing.id : `prc_${crypto.randomUUID().slice(0, 8)}`,
        productId,
        price: newPrice,
        previousPrice: prevPrice,
        currency: 'KES',
        unit: unit || (existing ? existing.unit : 'each'),
        effectiveDate: now,
        updatedBy,
        reason: reason || 'Bulk price update',
        updatedAt: now,
      };

      const historyEntry: PriceHistoryEntry = {
        id: `his_${crypto.randomUUID().slice(0, 8)}`,
        productId,
        previousPrice: prevPrice,
        newPrice,
        currency: 'KES',
        changedBy: updatedBy,
        reason: reason || 'Bulk update',
        timestamp: now,
      };

      const saved = await supabasePricingRepo.upsertPrice(record, historyEntry);
      results.push(saved);
    }

    res.json({ success: true, data: { updatedCount: results.length, records: results } });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Export CSV
app.get('/api/v1/pricing/export', async (req, res) => {
  try {
    const prices = await supabasePricingRepo.listPrices();
    let csv = 'Product_ID,Price_KES,Previous_Price_KES,Currency,Unit,Effective_Date,Updated_By\n';
    for (const p of prices) {
      csv += `"${p.productId}","${p.price ?? ''}","${p.previousPrice ?? ''}","${p.currency}","${p.unit}","${p.effectiveDate}","${p.updatedBy}"\n`;
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="michaforge_pricing_export.csv"');
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.listen(PORT, () => {
  console.log(`[pricing-service] Running on port ${PORT} (Supabase connected)`);
});

export default app;
