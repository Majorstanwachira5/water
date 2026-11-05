import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  User,
  UserRole,
  Category,
  Product,
  ProductPrice,
  PriceHistoryEntry,
  MediaAsset,
  Enquiry,
  EnquiryStatus,
  AuditLog,
  supabaseAuthRepo,
  supabaseCatalogueRepo,
  supabasePricingRepo,
  supabaseMediaRepo,
  supabaseEnquiryRepo,
  supabaseContentRepo,
  supabaseReportingRepo,
  supabaseNotificationRepo,
  supabaseCatalogAggregator,
  UserDbRecord,
  NotificationDbRecord,
} from '@michaforge/shared-contracts';
import {
  validatePriceValue,
  normalizeKenyanPhoneNumber,
  generateWhatsAppLink,
} from '@michaforge/shared-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'michaforge-jwt-super-secret-key-2026';

function signJwt(payload: Record<string, any>, expiresInSec: number): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresInSec };
  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');
  return `${b64Header}.${b64Payload}.${sig}`;
}

function verifyJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [b64Header, b64Payload, sig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${b64Header}.${b64Payload}`)
      .digest('base64url');
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf-8'));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function getAuthenticatedUser(req: NextRequest): Record<string, any> | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return verifyJwt(token);
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return checkHash === hash;
}

async function safeJsonBody(req: NextRequest): Promise<any> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

async function handleApiRequest(
  req: NextRequest,
  context: { params: { path: string[] } }
): Promise<NextResponse> {
  const segments = context.params?.path || [];
  const routePath = '/' + segments.join('/');
  const method = req.method.toUpperCase();
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  try {
    // 1. Health & Gateway
    if (routePath === '/health' && method === 'GET') {
      return NextResponse.json({
        status: 'healthy',
        gateway: 'Michaforge Next.js + Supabase Gateway',
        storage: 'supabase',
        timestamp: new Date().toISOString(),
      });
    }

    if (routePath === '/gateway/invalidate-cache' && method === 'POST') {
      return NextResponse.json({
        success: true,
        message: 'Catalogue cache invalidated successfully',
      });
    }

    if (routePath === '/openapi.json' && method === 'GET') {
      return NextResponse.json({
        openapi: '3.0.0',
        info: {
          title: 'Michaforge Enterprises Supabase API',
          version: '1.0.0',
        },
      });
    }

    // 2. Aggregated Public Catalog
    if (routePath === '/catalog/products' && method === 'GET') {
      const result = await supabaseCatalogAggregator.getAggregatedProducts({
        categoryId: searchParams.get('categoryId') || undefined,
        search: searchParams.get('search') || undefined,
        featured: searchParams.get('featured') || undefined,
        page: Number(searchParams.get('page') || 1),
        limit: Number(searchParams.get('limit') || 50),
      });
      return NextResponse.json({
        success: true,
        data: result.data,
        meta: {
          ...result.meta,
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (segments[0] === 'catalog' && segments[1] === 'products' && segments[2] === 'slug' && segments[3] && method === 'GET') {
      const item = await supabaseCatalogAggregator.getAggregatedProductBySlug(segments[3]);
      if (!item) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: item });
    }

    // 3. Categories
    if (routePath === '/categories' && method === 'GET') {
      const categories = await supabaseCatalogueRepo.listCategories();
      return NextResponse.json({ success: true, data: categories });
    }

    if (routePath === '/categories' && method === 'POST') {
      const body = await safeJsonBody(req);
      if (!body.name) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Category name is required' } },
          { status: 400 }
        );
      }
      const existing = await supabaseCatalogueRepo.listCategories();
      const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newCat: Category = {
        id: `cat_${crypto.randomUUID().slice(0, 8)}`,
        name: body.name,
        slug,
        description: body.description || '',
        iconName: body.iconName || 'pipe',
        imageUrl: body.imageUrl || '',
        displayOrder: body.displayOrder || existing.length + 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const created = await supabaseCatalogueRepo.createCategory(newCat);
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    if (segments[0] === 'categories' && segments[1] && method === 'PATCH') {
      const body = await safeJsonBody(req);
      const updated = await supabaseCatalogueRepo.updateCategory(segments[1], body);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: updated });
    }

    if (segments[0] === 'categories' && segments[1] && method === 'DELETE') {
      await supabaseCatalogueRepo.deleteCategory(segments[1]);
      return NextResponse.json({ success: true, data: { message: 'Category deleted' } });
    }

    // 4. Products (Catalogue Management)
    if (routePath === '/products' && method === 'GET') {
      const page = Number(searchParams.get('page') || 1);
      const limit = Number(searchParams.get('limit') || 50);
      const populated = await supabaseCatalogueRepo.listProducts({
        categoryId: searchParams.get('categoryId') || undefined,
        status: searchParams.get('status') || undefined,
        search: searchParams.get('search') || undefined,
        featured: searchParams.get('featured') === 'true' ? true : undefined,
      });
      const start = (page - 1) * limit;
      const paginated = populated.slice(start, start + limit);
      return NextResponse.json({
        success: true,
        data: paginated,
        meta: {
          total: populated.length,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(populated.length / limit)),
        },
      });
    }

    if (routePath === '/products' && method === 'POST') {
      const body = await safeJsonBody(req);
      const { name, sku, categoryId, unit, description, shortDescription, specifications, images, isFeatured } = body;
      if (!name || !sku || !categoryId || !unit) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Name, SKU, category, and unit are required' } },
          { status: 400 }
        );
      }
      const existing = await supabaseCatalogueRepo.listProducts();
      if (existing.some((p) => p.sku.toLowerCase() === sku.toLowerCase())) {
        return NextResponse.json(
          { success: false, error: { code: 'DUPLICATE_SKU', message: `Product with SKU ${sku} already exists` } },
          { status: 409 }
        );
      }
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
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
        featuredOrder: isFeatured ? existing.filter((p) => p.isFeatured).length + 1 : undefined,
        images: images || [],
        specifications: specifications || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const created = await supabaseCatalogueRepo.createProduct(newProduct);
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    if (segments[0] === 'products' && segments[1] === 'slug' && segments[2] && method === 'GET') {
      const product = await supabaseCatalogueRepo.getProductBySlug(segments[2]);
      if (!product) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: product });
    }

    if (segments[0] === 'products' && segments[1] && segments.length === 2) {
      if (method === 'GET') {
        const product = await supabaseCatalogueRepo.getProductById(segments[1]);
        if (!product) {
          return NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: product });
      }
      if (method === 'PATCH') {
        const body = await safeJsonBody(req);
        const updated = await supabaseCatalogueRepo.updateProduct(segments[1], body);
        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated });
      }
      if (method === 'DELETE') {
        const ok = await supabaseCatalogueRepo.archiveProduct(segments[1]);
        if (!ok) {
          return NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: { message: 'Product archived successfully' } });
      }
    }

    // 5. Pricing
    if (routePath === '/pricing/products' && method === 'GET') {
      const prices = await supabasePricingRepo.listPrices();
      return NextResponse.json({ success: true, data: prices });
    }

    if (routePath === '/pricing/history' && method === 'GET') {
      const history = await supabasePricingRepo.listPriceHistory(100);
      return NextResponse.json({ success: true, data: history });
    }

    if (routePath === '/pricing/export' && method === 'GET') {
      const prices = await supabasePricingRepo.listPrices();
      let csv = 'Product_ID,Price_KES,Previous_Price_KES,Currency,Unit,Effective_Date,Updated_By\n';
      for (const p of prices) {
        csv += `"${p.productId}","${p.price ?? ''}","${p.previousPrice ?? ''}","${p.currency}","${p.unit}","${p.effectiveDate}","${p.updatedBy}"\n`;
      }
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="michaforge_pricing_export.csv"',
        },
      });
    }

    if (routePath === '/pricing/bulk-update' && method === 'POST') {
      const body = await safeJsonBody(req);
      const { updates, updatedBy = 'Administrator' } = body;
      if (!Array.isArray(updates) || updates.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Updates array is required' } },
          { status: 400 }
        );
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
      return NextResponse.json({
        success: true,
        data: { updatedCount: results.length, records: results },
      });
    }

    if (segments[0] === 'pricing' && segments[1] === 'products' && segments[2]) {
      const productId = segments[2];
      if (segments[3] === 'history' && method === 'GET') {
        const records = await supabasePricingRepo.getProductPriceHistory(productId);
        return NextResponse.json({ success: true, data: records });
      }
      if (!segments[3] && method === 'GET') {
        const priceRecord = await supabasePricingRepo.getPriceByProductId(productId);
        if (!priceRecord) {
          return NextResponse.json({
            success: true,
            data: {
              productId,
              price: null,
              currency: 'KES',
              unit: 'each',
              priceDisplayState: 'contact_for_price',
            },
          });
        }
        return NextResponse.json({ success: true, data: priceRecord });
      }
      if (!segments[3] && method === 'POST') {
        const body = await safeJsonBody(req);
        const { price, unit = 'each', updatedBy = 'Administrator', reason } = body;
        const validation = validatePriceValue(price);
        if (!validation.valid) {
          return NextResponse.json(
            { success: false, error: { code: 'INVALID_PRICE', message: validation.error || 'Invalid price' } },
            { status: 400 }
          );
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
        return NextResponse.json({ success: true, data: saved });
      }
    }

    // 6. Media
    if (routePath === '/media/library' && method === 'GET') {
      const list = await supabaseMediaRepo.listMediaAssets({
        category: searchParams.get('category') || undefined,
        search: searchParams.get('search') || undefined,
      });
      return NextResponse.json({ success: true, data: list });
    }

    if (routePath === '/media/uploads' && method === 'POST') {
      // Support both multipart form-data and JSON metadata
      let fileName = `asset-${Date.now()}.png`;
      let originalName = fileName;
      let mimeType = 'image/png';
      let sizeBytes = 1024;
      let altText = '';
      let category = 'general';
      let uploadedBy = 'Administrator';
      let dataUrl = '/images/modern_hardware_hero.png';

      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        altText = String(formData.get('altText') || '');
        category = String(formData.get('category') || 'general');
        uploadedBy = String(formData.get('uploadedBy') || 'Administrator');
        if (file) {
          originalName = file.name;
          fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          mimeType = file.type || 'image/png';
          sizeBytes = file.size;
          const bytes = Buffer.from(await file.arrayBuffer());
          dataUrl = `data:${mimeType};base64,${bytes.toString('base64')}`;
        }
      } else {
        const body = await safeJsonBody(req);
        fileName = body.fileName || fileName;
        originalName = body.originalName || fileName;
        mimeType = body.mimeType || mimeType;
        sizeBytes = body.sizeBytes || sizeBytes;
        altText = body.altText || originalName;
        category = body.category || 'general';
        uploadedBy = body.uploadedBy || 'Administrator';
        dataUrl = body.url || dataUrl;
      }

      const newAsset: MediaAsset = {
        id: `med_${crypto.randomUUID().slice(0, 8)}`,
        fileName,
        originalName,
        mimeType,
        sizeBytes,
        url: dataUrl,
        altText: altText || originalName,
        category: category as any,
        uploadedBy,
        createdAt: new Date().toISOString(),
      };
      const created = await supabaseMediaRepo.createMediaAsset(newAsset);
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    if (segments[0] === 'media' && segments[1] && segments.length === 2) {
      if (method === 'PATCH') {
        const body = await safeJsonBody(req);
        const updated = await supabaseMediaRepo.updateMediaAsset(segments[1], {
          altText: body.altText,
          category: body.category,
        });
        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated });
      }
      if (method === 'DELETE') {
        const removed = await supabaseMediaRepo.deleteMediaAsset(segments[1]);
        if (!removed) {
          return NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: { message: 'Asset deleted successfully' } });
      }
    }

    // 7. Enquiries
    if (routePath === '/enquiries' && method === 'POST') {
      const body = await safeJsonBody(req);
      const { customerName, phoneNumber, email, enquiryType, productId, productName, productSku, message, source } = body;
      if (!customerName || !phoneNumber || !message) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Name, phone number, and message are required' } },
          { status: 400 }
        );
      }
      const normalizedPhone = normalizeKenyanPhoneNumber(phoneNumber);
      const now = new Date().toISOString();
      const newEnquiry: Enquiry = {
        id: `enq_${crypto.randomUUID().slice(0, 8)}`,
        customerName,
        phoneNumber: normalizedPhone,
        email: email || undefined,
        enquiryType: enquiryType || 'general',
        productId: productId || undefined,
        productName: productName || undefined,
        productSku: productSku || undefined,
        message,
        status: 'New',
        source: source || 'website_form',
        notes: [],
        followUps: [],
        createdAt: now,
        updatedAt: now,
      };
      const created = await supabaseEnquiryRepo.createEnquiry(newEnquiry);
      return NextResponse.json(
        {
          success: true,
          data: created,
          meta: {
            whatsappQuickLink: generateWhatsAppLink(normalizedPhone, productName, productSku),
          },
        },
        { status: 201 }
      );
    }

    if (routePath === '/admin/enquiries' && method === 'GET') {
      const list = await supabaseEnquiryRepo.listEnquiries({
        status: searchParams.get('status') || undefined,
        search: searchParams.get('search') || undefined,
      });
      return NextResponse.json({ success: true, data: list, meta: { total: list.length } });
    }

    if (segments[0] === 'admin' && segments[1] === 'enquiries' && segments[2]) {
      const enquiryId = segments[2];
      if (!segments[3] && method === 'GET') {
        const enquiry = await supabaseEnquiryRepo.getEnquiryById(enquiryId);
        if (!enquiry) {
          return NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: 'Enquiry not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: enquiry });
      }
      if (segments[3] === 'status' && method === 'PATCH') {
        const body = await safeJsonBody(req);
        const validStatuses: EnquiryStatus[] = ['New', 'Contacted', 'Quoted', 'Awaiting Customer', 'Completed', 'Closed'];
        if (!validStatuses.includes(body.status)) {
          return NextResponse.json(
            { success: false, error: { code: 'INVALID_STATUS', message: `Status must be one of: ${validStatuses.join(', ')}` } },
            { status: 400 }
          );
        }
        const updated = await supabaseEnquiryRepo.updateEnquiryStatus(enquiryId, body.status);
        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: 'Enquiry not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated });
      }
      if (segments[3] === 'notes' && method === 'POST') {
        const body = await safeJsonBody(req);
        if (!body.content) {
          return NextResponse.json(
            { success: false, error: { code: 'VALIDATION_ERROR', message: 'Content is required' } },
            { status: 400 }
          );
        }
        const note = {
          id: `not_${crypto.randomUUID().slice(0, 8)}`,
          enquiryId,
          authorName: body.authorName || 'Administrator',
          content: body.content,
          createdAt: new Date().toISOString(),
        };
        const savedNote = await supabaseEnquiryRepo.addEnquiryNote(enquiryId, note);
        if (!savedNote) {
          return NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: 'Enquiry not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: savedNote }, { status: 201 });
      }
    }

    // 8. Content & Branding Settings
    if (routePath === '/settings/public' && method === 'GET') {
      const { brand } = await supabaseContentRepo.getSiteContent();
      return NextResponse.json({ success: true, data: brand });
    }

    if (routePath === '/content/homepage' && method === 'GET') {
      const { brand, aboutContent: about } = await supabaseContentRepo.getSiteContent();
      return NextResponse.json({ success: true, data: { brand, about } });
    }

    if (routePath === '/admin/branding' && method === 'PATCH') {
      const updates = await safeJsonBody(req);
      if (updates.primaryPhone) {
        updates.primaryPhoneFormatted = normalizeKenyanPhoneNumber(updates.primaryPhone);
      }
      if (updates.whatsappNumber) {
        updates.whatsappNumber = normalizeKenyanPhoneNumber(updates.whatsappNumber);
      }
      if (updates.secondaryPhone) {
        updates.secondaryPhoneFormatted = normalizeKenyanPhoneNumber(updates.secondaryPhone);
      }
      if (updates.secondaryWhatsappNumber) {
        updates.secondaryWhatsappNumber = normalizeKenyanPhoneNumber(updates.secondaryWhatsappNumber);
      }
      const updatedBrand = await supabaseContentRepo.updateBranding(updates);
      return NextResponse.json({ success: true, data: updatedBrand });
    }

    if (routePath === '/admin/content/homepage' && method === 'PATCH') {
      const body = await safeJsonBody(req);
      const { heroHeadline, heroSubheadline, heroDescription, announcementText, about } = body;
      const brandUpdates: Record<string, any> = {};
      if (heroHeadline !== undefined) brandUpdates.heroHeadline = heroHeadline;
      if (heroSubheadline !== undefined) brandUpdates.heroSubheadline = heroSubheadline;
      if (heroDescription !== undefined) brandUpdates.heroDescription = heroDescription;
      if (announcementText !== undefined) brandUpdates.announcementText = announcementText;

      const { brand: updatedBrand, about: updatedAbout } = await supabaseContentRepo.updateHomepageContent({
        ...brandUpdates,
        about,
      });
      return NextResponse.json({ success: true, data: { brand: updatedBrand, about: updatedAbout } });
    }

    // 9. Authentication & Users
    if (routePath === '/auth/login' && method === 'POST') {
      const body = await safeJsonBody(req);
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } },
          { status: 400 }
        );
      }
      const user = await supabaseAuthRepo.findUserByEmail(email);
      if (!user || !user.isActive || !verifyPassword(password, user.passwordHash, user.salt)) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
          { status: 401 }
        );
      }
      await supabaseAuthRepo.updateLastLogin(user.id);
      const now = new Date().toISOString();
      const safeUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: now,
        lastLoginAt: now,
      };
      const accessToken = signJwt({ sub: safeUser.id, email: safeUser.email, role: safeUser.role, name: safeUser.name }, 8 * 3600);
      const refreshToken = signJwt({ sub: safeUser.id }, 7 * 86400);
      await supabaseAuthRepo.saveRefreshToken(refreshToken, safeUser.id);
      return NextResponse.json({
        success: true,
        data: { accessToken, refreshToken, user: safeUser },
      });
    }

    if (routePath === '/auth/refresh' && method === 'POST') {
      const body = await safeJsonBody(req);
      const { refreshToken } = body;
      if (!refreshToken) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Refresh token is required' } },
          { status: 400 }
        );
      }
      const exists = await supabaseAuthRepo.hasRefreshToken(refreshToken);
      if (!exists) {
        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Refresh token has been revoked' } },
          { status: 403 }
        );
      }
      const decoded = verifyJwt(refreshToken);
      if (!decoded || !decoded.sub) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_TOKEN', message: 'Refresh token invalid or expired' } },
          { status: 403 }
        );
      }
      const user = await supabaseAuthRepo.findUserById(decoded.sub);
      if (!user || !user.isActive) {
        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'User no longer active' } },
          { status: 403 }
        );
      }
      const accessToken = signJwt({ sub: user.id, email: user.email, role: user.role, name: user.name }, 8 * 3600);
      return NextResponse.json({ success: true, data: { accessToken } });
    }

    if (routePath === '/auth/me' && method === 'GET') {
      const authUser = getAuthenticatedUser(req);
      if (!authUser) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization token' } },
          { status: 401 }
        );
      }
      const user = await supabaseAuthRepo.findUserById(authUser.sub);
      if (!user) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
          { status: 404 }
        );
      }
      const safeUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
      };
      return NextResponse.json({ success: true, data: safeUser });
    }

    if (routePath === '/auth/logout' && method === 'POST') {
      const body = await safeJsonBody(req);
      if (body.refreshToken) {
        await supabaseAuthRepo.removeRefreshToken(body.refreshToken);
      }
      return NextResponse.json({ success: true, data: { message: 'Logged out successfully' } });
    }

    if (routePath === '/admin/users' && method === 'GET') {
      const authUser = getAuthenticatedUser(req);
      if (!authUser) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization token' } },
          { status: 401 }
        );
      }
      const users = await supabaseAuthRepo.listUsers();
      return NextResponse.json({ success: true, data: users });
    }

    if (routePath === '/admin/users' && method === 'POST') {
      const authUser = getAuthenticatedUser(req);
      if (!authUser) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization token' } },
          { status: 401 }
        );
      }
      const body = await safeJsonBody(req);
      const { email, password, name, role } = body;
      if (!email || !password || !name || !role) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'All fields are required' } },
          { status: 400 }
        );
      }
      const existing = await supabaseAuthRepo.findUserByEmail(email);
      if (existing) {
        return NextResponse.json(
          { success: false, error: { code: 'DUPLICATE_USER', message: 'User email already exists' } },
          { status: 409 }
        );
      }
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      const newUser: UserDbRecord = {
        id: `usr_${crypto.randomUUID().slice(0, 8)}`,
        email,
        name,
        role: role as UserRole,
        isActive: true,
        passwordHash: hash,
        salt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const safeUser = await supabaseAuthRepo.createUser(newUser);
      return NextResponse.json({ success: true, data: safeUser }, { status: 201 });
    }

    // 10. Reporting & Audit Logs
    if (routePath === '/admin/reports/overview' && method === 'GET') {
      const metrics = await supabaseReportingRepo.getOverviewMetrics();
      return NextResponse.json({ success: true, data: metrics });
    }

    if (routePath === '/admin/audit-logs' && method === 'GET') {
      const logs = await supabaseReportingRepo.listAuditLogs(100);
      return NextResponse.json({ success: true, data: logs });
    }

    if (routePath === '/admin/audit-logs' && method === 'POST') {
      const body = await safeJsonBody(req);
      const { actorId, actorName, action, entityType, entityId, details } = body;
      if (!actorName || !action || !entityType) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Actor, action and entityType are required' } },
          { status: 400 }
        );
      }
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
      const created = await supabaseReportingRepo.createAuditLog(entry);
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    // 11. Notifications
    if (routePath === '/notifications' && method === 'POST') {
      const body = await safeJsonBody(req);
      const { channel, recipient, subject, message } = body;
      if (!channel || !recipient || !message) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Channel, recipient, and message are required' } },
          { status: 400 }
        );
      }
      const newRecord: NotificationDbRecord = {
        id: `ntf_${crypto.randomUUID().slice(0, 8)}`,
        channel,
        recipient,
        subject,
        message,
        status: 'simulated',
        provider: 'Supabase Notification Adapter',
        createdAt: new Date().toISOString(),
      };
      const created = await supabaseNotificationRepo.createNotification(newRecord);
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    if (routePath === '/admin/notifications' && method === 'GET') {
      const list = await supabaseNotificationRepo.listNotifications(50);
      return NextResponse.json({ success: true, data: list });
    }

    if (routePath === '/admin/notifications/test' && method === 'POST') {
      const body = await safeJsonBody(req);
      const { channel = 'sms', recipient = '+254714843208' } = body;
      const testRecord: NotificationDbRecord = {
        id: `ntf_test_${crypto.randomUUID().slice(0, 8)}`,
        channel,
        recipient,
        subject: 'Test Notification',
        message: `[TEST] Michaforge Enterprises notification dispatch verification. Channel: ${channel}.`,
        status: 'simulated',
        provider: 'Supabase Notification Adapter',
        createdAt: new Date().toISOString(),
      };
      const created = await supabaseNotificationRepo.createNotification(testRecord);
      return NextResponse.json({ success: true, data: created });
    }

    return NextResponse.json(
      { success: false, error: { code: 'ROUTE_NOT_FOUND', message: `Endpoint /api/v1${routePath} [${method}] not found` } },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Unexpected server error' } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, context: { params: { path: string[] } }) {
  return handleApiRequest(req, context);
}

export async function POST(req: NextRequest, context: { params: { path: string[] } }) {
  return handleApiRequest(req, context);
}

export async function PATCH(req: NextRequest, context: { params: { path: string[] } }) {
  return handleApiRequest(req, context);
}

export async function PUT(req: NextRequest, context: { params: { path: string[] } }) {
  return handleApiRequest(req, context);
}

export async function DELETE(req: NextRequest, context: { params: { path: string[] } }) {
  return handleApiRequest(req, context);
}

