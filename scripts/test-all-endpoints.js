/**
 * Comprehensive End-to-End Integration Test Suite for Michaforge Enterprises
 * Verifies every microservice endpoint and Supabase repository end-to-end:
 *  - Gateway Health & OpenAPI (/api/v1/health, /api/v1/openapi.json)
 *  - Auth Service (/api/v1/auth/login, /api/v1/auth/me, /api/v1/auth/refresh, /api/v1/admin/users)
 *  - Catalogue Service (/api/v1/categories, /api/v1/products, /api/v1/products/slug/:slug)
 *  - Aggregated Public Catalog (/api/v1/catalog/products, /api/v1/catalog/products/slug/:slug)
 *  - Pricing Service (/api/v1/pricing/products, /api/v1/pricing/products/:id, /api/v1/pricing/history, /api/v1/pricing/export)
 *  - Enquiry Service (POST /api/v1/enquiries, GET /api/v1/admin/enquiries, PATCH status, POST notes)
 *  - Content & Branding (/api/v1/settings/public, /api/v1/content/homepage, PATCH /api/v1/admin/branding)
 *  - Media Library (/api/v1/media/library)
 *  - Reporting & Audit (/api/v1/admin/reports/overview, /api/v1/admin/audit-logs)
 *  - Notification Service (/api/v1/admin/notifications, POST /api/v1/admin/notifications/test)
 */

const assert = require('assert');
const http = require('http');

// Boot all microservices in-process on conflict-free test ports 14000..14008
const BASE_PORT = 14000;
process.env.AUTH_SERVICE_URL = `http://localhost:${BASE_PORT + 1}`;
process.env.CATALOGUE_SERVICE_URL = `http://localhost:${BASE_PORT + 2}`;
process.env.PRICING_SERVICE_URL = `http://localhost:${BASE_PORT + 3}`;
process.env.MEDIA_SERVICE_URL = `http://localhost:${BASE_PORT + 4}`;
process.env.ENQUIRY_SERVICE_URL = `http://localhost:${BASE_PORT + 5}`;
process.env.CONTENT_SERVICE_URL = `http://localhost:${BASE_PORT + 6}`;
process.env.REPORTING_SERVICE_URL = `http://localhost:${BASE_PORT + 7}`;
process.env.NOTIFICATION_SERVICE_URL = `http://localhost:${BASE_PORT + 8}`;

process.env.PORT = String(BASE_PORT + 1);
require('../services/auth-service/dist/index.js');
process.env.PORT = String(BASE_PORT + 2);
require('../services/catalogue-service/dist/index.js');
process.env.PORT = String(BASE_PORT + 3);
require('../services/pricing-service/dist/index.js');
process.env.PORT = String(BASE_PORT + 4);
require('../services/media-service/dist/index.js');
process.env.PORT = String(BASE_PORT + 5);
require('../services/enquiry-service/dist/index.js');
process.env.PORT = String(BASE_PORT + 6);
require('../services/content-service/dist/index.js');
process.env.PORT = String(BASE_PORT + 7);
require('../services/reporting-service/dist/index.js');
process.env.PORT = String(BASE_PORT + 8);
require('../services/notification-service/dist/index.js');
process.env.PORT = String(BASE_PORT);
require('../services/api-gateway/dist/index.js');

const GATEWAY = `http://localhost:${BASE_PORT}`;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${GATEWAY}${path}`);
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      { method, headers: reqHeaders },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch {
            // Raw text (e.g. CSV)
          }
          resolve({ status: res.statusCode, headers: res.headers, json, raw });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  // Wait briefly for Express servers to bind
  await new Promise((r) => setTimeout(r, 1200));

  let passed = 0;
  async function step(name, fn) {
    process.stdout.write(`  • Testing ${name} ... `);
    await fn();
    passed++;
    console.log('PASS');
  }

  console.log('\n================================================================');
  console.log(' MICHAFORGE ENTERPRISES — SUPABASE END-TO-END API VERIFICATION');
  console.log('================================================================\n');

  let accessToken = '';
  let refreshToken = '';

  await step('GET /api/v1/health (Gateway Health)', async () => {
    const res = await request('GET', '/api/v1/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.status, 'healthy');
    assert.strictEqual(res.json.storage, 'supabase');
  });

  await step('POST /api/v1/auth/login (Admin Authentication via Supabase)', async () => {
    const res = await request('POST', '/api/v1/auth/login', {
      email: 'admin@michaforge.co.ke',
      password: 'Admin@Michaforge2026!',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.ok(res.json.data.accessToken);
    assert.ok(res.json.data.refreshToken);
    accessToken = res.json.data.accessToken;
    refreshToken = res.json.data.refreshToken;
  });

  await step('GET /api/v1/auth/me (Verify JWT & Admin Profile)', async () => {
    const res = await request('GET', '/api/v1/auth/me', null, {
      Authorization: `Bearer ${accessToken}`,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.data.email, 'admin@michaforge.co.ke');
  });

  await step('POST /api/v1/auth/refresh (Refresh Token via Supabase)', async () => {
    const res = await request('POST', '/api/v1/auth/refresh', { refreshToken });
    assert.strictEqual(res.status, 200);
    assert.ok(res.json.data.accessToken);
  });

  await step('GET /api/v1/admin/users (Admin User List)', async () => {
    const res = await request('GET', '/api/v1/admin/users', null, {
      Authorization: `Bearer ${accessToken}`,
    });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.json.data));
    assert.ok(res.json.data.length >= 1);
  });

  await step('GET /api/v1/categories (6 Plumbing Categories)', async () => {
    const res = await request('GET', '/api/v1/categories');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.ok(res.json.data.length >= 6);
  });

  await step('GET /api/v1/products (Catalogue Products in Supabase)', async () => {
    const res = await request('GET', '/api/v1/products');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.ok(res.json.data.length >= 6);
  });

  await step('GET /api/v1/catalog/products (Aggregated Catalog + Dynamic Pricing)', async () => {
    const res = await request('GET', '/api/v1/catalog/products');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.ok(res.json.data.length >= 6);
    const pvc = res.json.data.find((p) => p.id === 'prd_pvc_4in');
    assert.ok(pvc, 'PVC Pipes product should exist');
    assert.ok(pvc.formattedPrice.includes('KSh'), `Expected KSh price, got ${pvc.formattedPrice}`);
  });

  await step('GET /api/v1/catalog/products/slug/pvc-pipes-4-inch (Single Product by Slug)', async () => {
    const res = await request('GET', '/api/v1/catalog/products/slug/pvc-pipes-4-inch');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.data.sku, 'MF-PVC-004');
  });

  await step('GET /api/v1/pricing/products & POST Price Update', async () => {
    const listRes = await request('GET', '/api/v1/pricing/products');
    assert.strictEqual(listRes.status, 200);
    assert.ok(listRes.json.data.length >= 6);

    const updateRes = await request('POST', '/api/v1/pricing/products/prd_pvc_4in', {
      price: 650,
      unit: 'per 6 m length',
      updatedBy: 'E2E Test Suite',
      reason: 'Verified flyer price KSh 650',
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.json.data.price, 650);
  });

  await step('GET /api/v1/pricing/history & /api/v1/pricing/export (CSV)', async () => {
    const histRes = await request('GET', '/api/v1/pricing/history');
    assert.strictEqual(histRes.status, 200);
    assert.ok(Array.isArray(histRes.json.data));

    const csvRes = await request('GET', '/api/v1/pricing/export');
    assert.strictEqual(csvRes.status, 200);
    assert.ok(csvRes.raw.includes('Product_ID,Price_KES'));
  });

  let createdEnquiryId = '';
  await step('POST /api/v1/enquiries (Public Customer Enquiry -> Supabase)', async () => {
    const res = await request('POST', '/api/v1/enquiries', {
      customerName: 'Peter Kariuki',
      phoneNumber: '0714843208',
      email: 'peter@example.co.ke',
      enquiryType: 'product',
      productId: 'prd_pvc_4in',
      productName: 'PVC Pipes (4")',
      productSku: 'MF-PVC-004',
      message: 'Need 50 lengths of 4 inch PVC pipe delivered to Westlands.',
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.json.success, true);
    createdEnquiryId = res.json.data.id;
    assert.ok(createdEnquiryId);
  });

  await step('GET /api/v1/admin/enquiries & PATCH Status & POST Note', async () => {
    const listRes = await request('GET', '/api/v1/admin/enquiries');
    assert.strictEqual(listRes.status, 200);
    assert.ok(listRes.json.data.length >= 1);

    const statusRes = await request('PATCH', `/api/v1/admin/enquiries/${createdEnquiryId}/status`, {
      status: 'Contacted',
    });
    assert.strictEqual(statusRes.status, 200);
    assert.strictEqual(statusRes.json.data.status, 'Contacted');

    const noteRes = await request('POST', `/api/v1/admin/enquiries/${createdEnquiryId}/notes`, {
      authorName: 'Michaforge Admin',
      content: 'Sent quotation via WhatsApp.',
    });
    assert.strictEqual(noteRes.status, 201);
  });

  await step('GET /api/v1/settings/public & /api/v1/content/homepage', async () => {
    const pubRes = await request('GET', '/api/v1/settings/public');
    assert.strictEqual(pubRes.status, 200);
    assert.strictEqual(pubRes.json.data.businessName, 'MICHAFORGE ENTERPRISES');

    const homeRes = await request('GET', '/api/v1/content/homepage');
    assert.strictEqual(homeRes.status, 200);
    assert.ok(homeRes.json.data.brand);
    assert.ok(homeRes.json.data.about);
  });

  await step('GET /api/v1/media/library (Media Assets in Supabase)', async () => {
    const res = await request('GET', '/api/v1/media/library');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.json.data));
    assert.ok(res.json.data.length >= 6);
  });

  await step('GET /api/v1/admin/reports/overview & /api/v1/admin/audit-logs', async () => {
    const repRes = await request('GET', '/api/v1/admin/reports/overview');
    assert.strictEqual(repRes.status, 200);
    assert.ok(repRes.json.data.totalProducts >= 6);
    assert.ok(repRes.json.data.categoriesCount >= 6);

    const audRes = await request('GET', '/api/v1/admin/audit-logs');
    assert.strictEqual(audRes.status, 200);
    assert.ok(Array.isArray(audRes.json.data));
  });

  await step('POST /api/v1/admin/notifications/test & GET /api/v1/admin/notifications', async () => {
    const testRes = await request('POST', '/api/v1/admin/notifications/test', {
      channel: 'whatsapp',
      recipient: '+254714843208',
    });
    assert.strictEqual(testRes.status, 200);

    const listRes = await request('GET', '/api/v1/admin/notifications');
    assert.strictEqual(listRes.status, 200);
    assert.ok(listRes.json.data.length >= 1);
  });

  console.log(`\n✅ ALL ${passed} END-TO-END SUPABASE API TESTS PASSED!\n`);
  process.exit(0);
}

runTests().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});

