import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AuditLog, DashboardMetrics } from '@michaforge/shared-contracts';

const PORT = process.env.PORT || 4007;
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'reporting_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface ReportingDatabase {
  auditLogs: AuditLog[];
}

function loadDb(): ReportingDatabase {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb: ReportingDatabase = {
      auditLogs: [
        {
          id: 'aud_init_01',
          actorId: 'usr_admin_01',
          actorName: 'Michaforge Administrator',
          action: 'SYSTEM_BOOTSTRAP',
          entityType: 'System',
          entityId: 'michaforge_core',
          details: { message: 'Initialized Michaforge Enterprises catalogue and pricing architecture' },
          timestamp: new Date().toISOString(),
        },
      ],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDb(data: ReportingDatabase) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'reporting-service', timestamp: new Date().toISOString() });
});

// Overview Dashboard Metrics (Calculated from real service databases)
app.get('/api/v1/admin/reports/overview', (req, res) => {
  try {
    let totalProducts = 0;
    let publishedProducts = 0;
    let archivedProducts = 0;
    let categoriesCount = 0;
    let unpricedProductsCount = 0;
    let recentPriceChangesCount = 0;
    let newEnquiriesCount = 0;
    let pendingEnquiriesCount = 0;
    let totalEnquiries = 0;

    // Read catalogue data
    const catDbPath = path.join(__dirname, '../../catalogue-service/data/catalogue_db.json');
    if (fs.existsSync(catDbPath)) {
      const catData = JSON.parse(fs.readFileSync(catDbPath, 'utf-8'));
      totalProducts = catData.products ? catData.products.length : 0;
      publishedProducts = catData.products ? catData.products.filter((p: any) => p.status === 'published').length : 0;
      archivedProducts = catData.products ? catData.products.filter((p: any) => p.status === 'archived').length : 0;
      categoriesCount = catData.categories ? catData.categories.length : 0;
    }

    // Read pricing data
    const prcDbPath = path.join(__dirname, '../../pricing-service/data/pricing_db.json');
    if (fs.existsSync(prcDbPath)) {
      const prcData = JSON.parse(fs.readFileSync(prcDbPath, 'utf-8'));
      if (prcData.prices) {
        const prices = Object.values(prcData.prices) as any[];
        unpricedProductsCount = prices.filter((p) => p.price === null || p.price === undefined || p.price <= 0).length;
      }
      recentPriceChangesCount = prcData.history ? prcData.history.length : 0;
    }

    // Read enquiry data
    const enqDbPath = path.join(__dirname, '../../enquiry-service/data/enquiry_db.json');
    if (fs.existsSync(enqDbPath)) {
      const enqData = JSON.parse(fs.readFileSync(enqDbPath, 'utf-8'));
      if (enqData.enquiries) {
        totalEnquiries = enqData.enquiries.length;
        newEnquiriesCount = enqData.enquiries.filter((e: any) => e.status === 'New').length;
        pendingEnquiriesCount = enqData.enquiries.filter((e: any) => ['New', 'Contacted', 'Awaiting Customer'].includes(e.status)).length;
      }
    }

    const metrics: DashboardMetrics = {
      totalProducts,
      publishedProducts,
      archivedProducts,
      categoriesCount,
      unpricedProductsCount,
      recentPriceChangesCount,
      newEnquiriesCount,
      pendingEnquiriesCount,
      totalEnquiries,
    };

    res.json({ success: true, data: metrics });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'METRICS_ERROR', message: err.message },
    });
  }
});

// Audit Logs
app.get('/api/v1/admin/audit-logs', (req, res) => {
  const db = loadDb();
  res.json({ success: true, data: db.auditLogs.slice(0, 100) });
});

app.post('/api/v1/admin/audit-logs', (req, res) => {
  const { actorId, actorName, action, entityType, entityId, details } = req.body;
  if (!actorName || !action || !entityType) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Actor, action and entityType are required' },
    });
  }
  const db = loadDb();
  const entry: AuditLog = {
    id: `aud_${crypto.randomUUID().slice(0, 8)}`,
    actorId: actorId || 'usr_system',
    actorName,
    action,
    entityType,
    entityId: entityId || '',
    details,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(entry);
  saveDb(db);
  res.status(201).json({ success: true, data: entry });
});

app.listen(PORT, () => {
  loadDb();
  console.log(`[reporting-service] Running on port ${PORT}`);
});

export default app;
