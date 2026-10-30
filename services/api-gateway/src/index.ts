import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import http from 'http';
import { CatalogProductItem, Product, ProductPrice } from '@michaforge/shared-contracts';
import { formatCurrency } from '@michaforge/shared-validation';

const PORT = process.env.PORT || 4000;

// Microservices Base URLs
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  catalogue: process.env.CATALOGUE_SERVICE_URL || 'http://localhost:4002',
  pricing: process.env.PRICING_SERVICE_URL || 'http://localhost:4003',
  media: process.env.MEDIA_SERVICE_URL || 'http://localhost:4004',
  enquiry: process.env.ENQUIRY_SERVICE_URL || 'http://localhost:4005',
  content: process.env.CONTENT_SERVICE_URL || 'http://localhost:4006',
  reporting: process.env.REPORTING_SERVICE_URL || 'http://localhost:4007',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4008',
};

// Internal Cache for Aggregated Catalogue with Invalidation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
let catalogCache: CacheEntry<CatalogProductItem[]> | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute default TTL

export function invalidateCatalogCache() {
  catalogCache = null;
}

// Simple HTTP request helper for inter-service communication
function forwardRequest(
  targetUrl: string,
  req: Request,
  res: Response,
  options?: { customPath?: string }
) {
  const urlObj = new URL(options?.customPath ? `${targetUrl}${options.customPath}` : `${targetUrl}${req.originalUrl}`);
  
  // Append query string if any
  if (req.url.includes('?') && !options?.customPath) {
    urlObj.search = req.url.split('?')[1];
  }

  const clientReq = http.request(
    urlObj,
    {
      method: req.method,
      headers: {
        ...req.headers,
        host: urlObj.host,
        'x-correlation-id': (res.getHeader('x-correlation-id') as string) || crypto.randomUUID(),
      },
    },
    (clientRes) => {
      res.status(clientRes.statusCode || 500);
      for (const [key, val] of Object.entries(clientRes.headers)) {
        if (val && key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, val);
        }
      }
      clientRes.pipe(res);
    }
  );

  clientReq.on('error', (err) => {
    res.status(502).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: `Downstream service error: ${err.message}`,
        requestId: res.getHeader('x-correlation-id'),
        timestamp: new Date().toISOString(),
      },
    });
  });

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    clientReq.write(JSON.stringify(req.body));
  }
  clientReq.end();
}

async function fetchJson<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
      res.on('error', reject);
    });
  });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Middleware: Request ID and Correlation ID
app.use((req, res, next) => {
  const correlationId = (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
  res.setHeader('x-correlation-id', correlationId);
  res.setHeader('x-gateway', 'Michaforge-API-Gateway/1.0');
  next();
});

// Gateway Health
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    gateway: 'Michaforge API Gateway',
    timestamp: new Date().toISOString(),
    services: Object.keys(SERVICES),
  });
});

// Cache Invalidation Hook
app.post('/api/v1/gateway/invalidate-cache', (req, res) => {
  invalidateCatalogCache();
  res.json({ success: true, message: 'Catalogue cache invalidated successfully' });
});

// OpenAPI Spec
app.get('/api/v1/openapi.json', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'Michaforge Enterprises API Gateway',
      version: '1.0.0',
      description: 'Public & Admin microservices gateway for Michaforge Enterprises Plumbing & Hardware Materials',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    paths: {
      '/api/v1/catalog/products': {
        get: {
          summary: 'Get aggregated catalogue with dynamic prices',
          description: 'Combines products from catalogue-service and real-time prices from pricing-service',
        },
      },
      '/api/v1/enquiries': {
        post: { summary: 'Submit a customer enquiry' },
      },
      '/api/v1/auth/login': {
        post: { summary: 'Admin authentication' },
      },
    },
  });
});

// CRITICAL ENDPOINT: Aggregated Catalogue with Dynamic Pricing
app.get('/api/v1/catalog/products', async (req, res) => {
  const { categoryId, search, featured, page = 1, limit = 50 } = req.query;

  try {
    // Check internal cache
    let productsList: Product[] = [];
    let pricesMap: Record<string, ProductPrice> = {};

    const [productsResp, pricesResp] = await Promise.all([
      fetchJson<{ success: boolean; data: Product[] }>(`${SERVICES.catalogue}/api/v1/products?limit=200`),
      fetchJson<{ success: boolean; data: ProductPrice[] }>(`${SERVICES.pricing}/api/v1/pricing/products`),
    ]);

    if (productsResp.success) {
      productsList = productsResp.data;
    }
    if (pricesResp.success) {
      for (const p of pricesResp.data) {
        pricesMap[p.productId] = p;
      }
    }

    // Filter published only for public catalog
    let aggregated: CatalogProductItem[] = productsList
      .filter((p) => p.status === 'published')
      .map((p) => {
        const prc = pricesMap[p.id];
        const hasValidPrice = prc && prc.price !== null && prc.price !== undefined && prc.price > 0;
        const currentPrice = hasValidPrice ? prc.price : null;
        const previousPrice = prc && prc.previousPrice ? prc.previousPrice : null;

        return {
          ...p,
          price: currentPrice,
          previousPrice: previousPrice,
          currency: 'KES',
          priceDisplayState: (hasValidPrice ? 'configured' : 'contact_for_price') as 'configured' | 'contact_for_price',
          formattedPrice: formatCurrency(currentPrice, 'KES'),
        };
      });

    // Apply query filters
    if (categoryId) {
      aggregated = aggregated.filter((p) => p.categoryId === categoryId);
    }
    if (featured === 'true') {
      aggregated = aggregated.filter((p) => p.isFeatured);
    }
    if (search) {
      const q = String(search).toLowerCase();
      aggregated = aggregated.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    const pNum = Number(page);
    const lNum = Number(limit);
    const start = (pNum - 1) * lNum;
    const paginated = aggregated.slice(start, start + lNum);

    res.json({
      success: true,
      data: paginated,
      meta: {
        total: aggregated.length,
        page: pNum,
        limit: lNum,
        totalPages: Math.ceil(aggregated.length / lNum),
        requestId: res.getHeader('x-correlation-id'),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'AGGREGATION_FAILED',
        message: `Failed to aggregate catalogue and pricing: ${err.message}`,
        requestId: res.getHeader('x-correlation-id'),
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Single Product Aggregation by Slug
app.get('/api/v1/catalog/products/slug/:slug', async (req, res) => {
  try {
    const productResp = await fetchJson<{ success: boolean; data: Product }>(
      `${SERVICES.catalogue}/api/v1/products/slug/${req.params.slug}`
    );
    if (!productResp.success || !productResp.data) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    const product = productResp.data;
    let priceRecord: ProductPrice | null = null;
    try {
      const priceResp = await fetchJson<{ success: boolean; data: ProductPrice }>(
        `${SERVICES.pricing}/api/v1/pricing/products/${product.id}`
      );
      if (priceResp.success) priceRecord = priceResp.data;
    } catch (e) {
      // Graceful fallback if pricing service is lagging
    }

    const hasValidPrice = !!priceRecord && priceRecord.price !== null && priceRecord.price !== undefined && priceRecord.price > 0;
    const currentPrice = hasValidPrice && priceRecord ? priceRecord.price : null;

    const aggregated: CatalogProductItem = {
      ...product,
      price: currentPrice,
      previousPrice: priceRecord?.previousPrice ?? null,
      currency: 'KES',
      priceDisplayState: (hasValidPrice ? 'configured' : 'contact_for_price') as 'configured' | 'contact_for_price',
      formattedPrice: formatCurrency(currentPrice, 'KES'),
    };

    res.json({ success: true, data: aggregated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'LOOKUP_FAILED', message: err.message } });
  }
});

// Route Auth Service
app.use('/api/v1/auth', (req, res) => forwardRequest(SERVICES.auth, req, res));
app.use('/api/v1/admin/users', (req, res) => forwardRequest(SERVICES.auth, req, res));

// Route Catalogue Service
app.use('/api/v1/categories', (req, res) => {
  invalidateCatalogCache();
  forwardRequest(SERVICES.catalogue, req, res);
});
app.use('/api/v1/products', (req, res) => {
  invalidateCatalogCache();
  forwardRequest(SERVICES.catalogue, req, res);
});

// Route Pricing Service
app.use('/api/v1/pricing', (req, res) => {
  invalidateCatalogCache();
  forwardRequest(SERVICES.pricing, req, res);
});

// Route Media Service
app.use('/api/v1/media', (req, res) => forwardRequest(SERVICES.media, req, res));
app.use('/uploads', (req, res) => forwardRequest(SERVICES.media, req, res));

// Route Enquiry Service
app.use('/api/v1/enquiries', (req, res) => forwardRequest(SERVICES.enquiry, req, res));
app.use('/api/v1/admin/enquiries', (req, res) => forwardRequest(SERVICES.enquiry, req, res));

// Route Content & Settings Service
app.use('/api/v1/content', (req, res) => forwardRequest(SERVICES.content, req, res));
app.use('/api/v1/settings', (req, res) => forwardRequest(SERVICES.content, req, res));
app.use('/api/v1/admin/branding', (req, res) => forwardRequest(SERVICES.content, req, res));
app.use('/api/v1/admin/content', (req, res) => forwardRequest(SERVICES.content, req, res));

// Route Reporting & Audit Service
app.use('/api/v1/admin/reports', (req, res) => forwardRequest(SERVICES.reporting, req, res));
app.use('/api/v1/admin/audit-logs', (req, res) => forwardRequest(SERVICES.reporting, req, res));

// Route Notification Service
app.use('/api/v1/notifications', (req, res) => forwardRequest(SERVICES.notification, req, res));
app.use('/api/v1/admin/notifications', (req, res) => forwardRequest(SERVICES.notification, req, res));

app.listen(PORT, () => {
  console.log(`[api-gateway] Running on port ${PORT}`);
});

export default app;
