import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { BrandSettings } from '@michaforge/shared-contracts';
import { normalizeKenyanPhoneNumber } from '@michaforge/shared-validation';

const PORT = process.env.PORT || 4006;
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'content_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface ContentDatabase {
  brand: BrandSettings;
  aboutContent: {
    title: string;
    description: string;
    features: { title: string; desc: string }[];
  };
}

function initialSeed(): ContentDatabase {
  return {
    brand: {
      businessName: 'MICHAFORGE ENTERPRISES',
      tagline: 'DEALERS IN ALL PLUMBING MATERIALS',
      primaryPhone: '0714843208',
      primaryPhoneFormatted: '+254714843208',
      whatsappNumber: '+254714843208',
      smsNumber: '+254714843208',
      email: 'info@michaforge.co.ke',
      address: 'Nairobi, Kenya',
      country: 'Kenya',
      currency: 'KES',
      timezone: 'Africa/Nairobi',
      logoUrl: '/images/logo_navbar.png',
      logoWhiteUrl: '/images/logo_footer.png',
      faviconUrl: '/favicon.ico',
      heroHeadline: 'Quality Plumbing & Hardware Materials',
      heroSubheadline: 'WELCOME TO MICHAFORGE ENTERPRISES',
      heroDescription:
        'Your trusted supplier of plumbing materials, pipes, fittings, taps, valves and all hardware essentials.',
      heroImageUrl: '/images/hero_plumbing_supplies.png',
      announcementText: 'Quality Plumbing & Hardware Solutions',
      colors: {
        deepNavy: '#073253',
        primaryNavy: '#0B3556',
        orange: '#FF850D',
        redLogoAccent: '#D92D36',
        white: '#FFFFFF',
        lightGrey: '#F5F7FA',
        borderGrey: '#DFE5EB',
        whatsAppGreen: '#0BAA58',
        darkText: '#172B3A',
        mutedText: '#667585',
      },
    },
    aboutContent: {
      title: 'About Michaforge Enterprises',
      description:
        'Michaforge Enterprises is a premier supplier of quality plumbing materials and hardware essentials in Kenya. We provide dependable, contractor-grade piping solutions, precision fittings, reliable taps, and flow control valves to builders, homeowners, and trade professionals.',
      features: [
        {
          title: 'Genuine Quality',
          desc: 'High standard pipes and fittings engineered for durability and reliable performance.',
        },
        {
          title: 'Comprehensive Stock',
          desc: 'Full range of PVC, PPR, taps, valves, water tanks, and essential hardware items.',
        },
        {
          title: 'Direct WhatsApp Support',
          desc: 'Instant quotations, technical sizing advice, and responsive customer assistance.',
        },
      ],
    },
  };
}

function loadDb(): ContentDatabase {
  if (!fs.existsSync(DB_FILE)) {
    const initial = initialSeed();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDb(data: ContentDatabase) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'content-service', timestamp: new Date().toISOString() });
});

// Public Brand & Content Settings
app.get('/api/v1/settings/public', (req, res) => {
  const db = loadDb();
  res.json({ success: true, data: db.brand });
});

// Homepage Content (Hero, Announcements, About)
app.get('/api/v1/content/homepage', (req, res) => {
  const db = loadDb();
  res.json({
    success: true,
    data: {
      brand: db.brand,
      about: db.aboutContent,
    },
  });
});

// Admin Update Brand & Contact Info
app.patch('/api/v1/admin/branding', (req, res) => {
  const db = loadDb();
  const updates = req.body;

  if (updates.primaryPhone) {
    updates.primaryPhoneFormatted = normalizeKenyanPhoneNumber(updates.primaryPhone);
  }
  if (updates.whatsappNumber) {
    updates.whatsappNumber = normalizeKenyanPhoneNumber(updates.whatsappNumber);
  }

  db.brand = { ...db.brand, ...updates };
  saveDb(db);
  res.json({ success: true, data: db.brand });
});

// Admin Update Homepage Content
app.patch('/api/v1/admin/content/homepage', (req, res) => {
  const db = loadDb();
  const { heroHeadline, heroSubheadline, heroDescription, announcementText, about } = req.body;

  if (heroHeadline) db.brand.heroHeadline = heroHeadline;
  if (heroSubheadline) db.brand.heroSubheadline = heroSubheadline;
  if (heroDescription) db.brand.heroDescription = heroDescription;
  if (announcementText) db.brand.announcementText = announcementText;
  if (about) db.aboutContent = { ...db.aboutContent, ...about };

  saveDb(db);
  res.json({ success: true, data: { brand: db.brand, about: db.aboutContent } });
});

app.listen(PORT, () => {
  loadDb();
  console.log(`[content-service] Running on port ${PORT}`);
});

export default app;
