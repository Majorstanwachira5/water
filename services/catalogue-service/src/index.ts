import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { Product, Category, supabaseCatalogueRepo } from '@michaforge/shared-contracts';

const PORT = process.env.PORT || 4002;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'catalogue-service', storage: 'supabase', timestamp: new Date().toISOString() });
});

// Categories
app.get('/api/v1/categories', async (req, res) => {
  try {
    const categories = await supabaseCatalogueRepo.listCategories();
    res.json({ success: true, data: categories });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.post('/api/v1/categories', async (req, res) => {
  try {
    const { name, description, iconName, imageUrl, displayOrder } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Category name is required' },
      });
    }
    const existing = await supabaseCatalogueRepo.listCategories();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat: Category = {
      id: `cat_${crypto.randomUUID().slice(0, 8)}`,
      name,
      slug,
      description: description || '',
      iconName: iconName || 'pipe',
      imageUrl: imageUrl || '',
      displayOrder: displayOrder || existing.length + 1,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const created = await supabaseCatalogueRepo.createCategory(newCat);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.patch('/api/v1/categories/:id', async (req, res) => {
  try {
    const updated = await supabaseCatalogueRepo.updateCategory(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Category not found' },
      });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.delete('/api/v1/categories/:id', async (req, res) => {
  try {
    await supabaseCatalogueRepo.deleteCategory(req.params.id);
    res.json({ success: true, data: { message: 'Category deleted' } });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Products
app.get('/api/v1/products', async (req, res) => {
  try {
    const { categoryId, status, search, featured, page = 1, limit = 50 } = req.query;
    const populated = await supabaseCatalogueRepo.listProducts({
      categoryId: categoryId ? String(categoryId) : undefined,
      status: status ? String(status) : undefined,
      search: search ? String(search) : undefined,
      featured: featured === 'true' ? true : undefined,
    });

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
        totalPages: Math.max(1, Math.ceil(populated.length / lNum)),
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.get('/api/v1/products/slug/:slug', async (req, res) => {
  try {
    const product = await supabaseCatalogueRepo.getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }
    res.json({ success: true, data: product });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.get('/api/v1/products/:id', async (req, res) => {
  try {
    const product = await supabaseCatalogueRepo.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }
    res.json({ success: true, data: product });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.post('/api/v1/products', async (req, res) => {
  try {
    const { name, sku, categoryId, unit, description, shortDescription, specifications, images, isFeatured } = req.body;
    if (!name || !sku || !categoryId || !unit) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name, SKU, category, and unit are required' },
      });
    }

    const existing = await supabaseCatalogueRepo.listProducts();
    if (existing.some((p) => p.sku.toLowerCase() === sku.toLowerCase())) {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_SKU', message: `Product with SKU ${sku} already exists` },
      });
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
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.patch('/api/v1/products/:id', async (req, res) => {
  try {
    const updated = await supabaseCatalogueRepo.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.delete('/api/v1/products/:id', async (req, res) => {
  try {
    const ok = await supabaseCatalogueRepo.deleteProduct(req.params.id);
    if (!ok) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }
    res.json({ success: true, data: { message: 'Product deleted permanently' } });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.listen(PORT, () => {
  console.log(`[catalogue-service] Running on port ${PORT} (Supabase connected)`);
});

export default app;
