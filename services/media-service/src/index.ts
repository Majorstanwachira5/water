import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import { MediaAsset, supabaseMediaRepo } from '@michaforge/shared-contracts';
import { isAllowedImageMimeType } from '@michaforge/shared-validation';

const PORT = process.env.PORT || 4004;
const UPLOAD_DIR = path.join(__dirname, '../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (!isAllowedImageMimeType(file.mimetype)) {
      return cb(new Error('Invalid image type. Permitted: JPEG, PNG, WebP, SVG'));
    }
    cb(null, true);
  },
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static uploaded files
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'media-service', storage: 'supabase', timestamp: new Date().toISOString() });
});

// Upload Single File (stores self-contained high-clarity Data URI in Supabase + local file copy)
app.post('/api/v1/media/uploads', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: { code: 'FILE_MISSING', message: 'No file uploaded' },
      });
    }

    const { altText = '', category = 'general', uploadedBy = 'Administrator' } = req.body;

    // Convert uploaded PNG/JPG to self-contained Data URI so it renders immediately across all environments (including Vercel)
    const fileBuffer = fs.readFileSync(file.path);
    const dataUrl = `data:${file.mimetype};base64,${fileBuffer.toString('base64')}`;

    const newAsset: MediaAsset = {
      id: `med_${crypto.randomUUID().slice(0, 8)}`,
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url: dataUrl,
      altText: altText || file.originalname,
      category: category as any,
      uploadedBy,
      createdAt: new Date().toISOString(),
    };

    const created = await supabaseMediaRepo.createAsset(newAsset);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Media Library
app.get('/api/v1/media/library', async (req, res) => {
  try {
    const { category, search } = req.query;
    const list = await supabaseMediaRepo.listAssets({
      category: category ? String(category) : undefined,
      search: search ? String(search) : undefined,
    });
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Update Alt Text / Metadata
app.patch('/api/v1/media/:id', async (req, res) => {
  try {
    const updated = await supabaseMediaRepo.updateAsset(req.params.id, {
      altText: req.body.altText,
      category: req.body.category,
    });
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Asset not found' },
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

// Delete Asset
app.delete('/api/v1/media/:id', async (req, res) => {
  try {
    const removed = await supabaseMediaRepo.deleteAsset(req.params.id);
    if (!removed) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Asset not found' },
      });
    }
    const filePath = path.join(UPLOAD_DIR, removed.fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        // Ignore if already deleted
      }
    }
    res.json({ success: true, data: { message: 'Asset deleted successfully' } });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.listen(PORT, () => {
  console.log(`[media-service] Running on port ${PORT} (Supabase connected)`);
});

export default app;
