import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import { MediaAsset } from '@michaforge/shared-contracts';
import { isAllowedImageMimeType, isAllowedFileSize } from '@michaforge/shared-validation';

const PORT = process.env.PORT || 4004;
const UPLOAD_DIR = path.join(__dirname, '../uploads');
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'media_db.json');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface MediaDatabase {
  assets: MediaAsset[];
}

function loadDb(): MediaDatabase {
  if (!fs.existsSync(DB_FILE)) {
    // Seed initial cropped flyer assets
    const assets: MediaAsset[] = [];
    const sourceDir = path.join(__dirname, '../../../extracted_assets');

    if (fs.existsSync(sourceDir)) {
      const files = fs.readdirSync(sourceDir);
      for (const file of files) {
        const srcPath = path.join(sourceDir, file);
        const destPath = path.join(UPLOAD_DIR, file);
        if (fs.statSync(srcPath).isFile()) {
          fs.copyFileSync(srcPath, destPath);
          assets.push({
            id: `med_${crypto.randomUUID().slice(0, 8)}`,
            fileName: file,
            originalName: file,
            mimeType: file.endsWith('.png') ? 'image/png' : 'image/jpeg',
            sizeBytes: fs.statSync(destPath).size,
            url: `/uploads/${file}`,
            altText: `Michaforge ${file.replace(/[-_.]/g, ' ')}`,
            category: file.includes('logo') ? 'brand' : file.includes('hero') ? 'banner' : 'product',
            uploadedBy: 'System Bootstrap',
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    const initialDb: MediaDatabase = { assets };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDb(data: MediaDatabase) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
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
app.use(express.json());

// Serve static uploaded files
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'media-service', timestamp: new Date().toISOString() });
});

// Upload Single File
app.post('/api/v1/media/uploads', upload.single('file'), (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      success: false,
      error: { code: 'FILE_MISSING', message: 'No file uploaded' },
    });
  }

  const { altText = '', category = 'general', uploadedBy = 'Administrator' } = req.body;
  const db = loadDb();

  const newAsset: MediaAsset = {
    id: `med_${crypto.randomUUID().slice(0, 8)}`,
    fileName: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    url: `/uploads/${file.filename}`,
    altText: altText || file.originalname,
    category: category as any,
    uploadedBy,
    createdAt: new Date().toISOString(),
  };

  db.assets.unshift(newAsset);
  saveDb(db);

  res.status(201).json({ success: true, data: newAsset });
});

// Media Library
app.get('/api/v1/media/library', (req, res) => {
  const { category, search } = req.query;
  const db = loadDb();
  let list = db.assets;
  if (category) {
    list = list.filter((a) => a.category === category);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter((a) => a.altText.toLowerCase().includes(q) || a.originalName.toLowerCase().includes(q));
  }
  res.json({ success: true, data: list });
});

// Update Alt Text / Metadata
app.patch('/api/v1/media/:id', (req, res) => {
  const db = loadDb();
  const asset = db.assets.find((a) => a.id === req.params.id);
  if (!asset) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Asset not found' },
    });
  }
  if (req.body.altText !== undefined) asset.altText = req.body.altText;
  if (req.body.category !== undefined) asset.category = req.body.category;
  saveDb(db);
  res.json({ success: true, data: asset });
});

// Delete Asset
app.delete('/api/v1/media/:id', (req, res) => {
  const db = loadDb();
  const index = db.assets.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Asset not found' },
    });
  }
  const [removed] = db.assets.splice(index, 1);
  const filePath = path.join(UPLOAD_DIR, removed.fileName);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      // Ignore if already deleted
    }
  }
  saveDb(db);
  res.json({ success: true, data: { message: 'Asset deleted successfully' } });
});

app.listen(PORT, () => {
  loadDb();
  console.log(`[media-service] Running on port ${PORT}`);
});

export default app;
