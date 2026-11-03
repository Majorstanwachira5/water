import express from 'express';
import cors from 'cors';
import { supabaseContentRepo } from '@michaforge/shared-contracts';
import { normalizeKenyanPhoneNumber } from '@michaforge/shared-validation';

const PORT = process.env.PORT || 4006;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'content-service', storage: 'supabase', timestamp: new Date().toISOString() });
});

// Public Brand & Content Settings
app.get('/api/v1/settings/public', async (req, res) => {
  try {
    const brand = await supabaseContentRepo.getBrandSettings();
    res.json({ success: true, data: brand });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Homepage Content (Hero, Announcements, About)
app.get('/api/v1/content/homepage', async (req, res) => {
  try {
    const [brand, about] = await Promise.all([
      supabaseContentRepo.getBrandSettings(),
      supabaseContentRepo.getAboutContent(),
    ]);
    res.json({
      success: true,
      data: {
        brand,
        about,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Admin Update Brand & Contact Info
app.patch('/api/v1/admin/branding', async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.primaryPhone) {
      updates.primaryPhoneFormatted = normalizeKenyanPhoneNumber(updates.primaryPhone);
    }
    if (updates.whatsappNumber) {
      updates.whatsappNumber = normalizeKenyanPhoneNumber(updates.whatsappNumber);
    }

    const updatedBrand = await supabaseContentRepo.updateBrandSettings(updates);
    res.json({ success: true, data: updatedBrand });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Admin Update Homepage Content
app.patch('/api/v1/admin/content/homepage', async (req, res) => {
  try {
    const { heroHeadline, heroSubheadline, heroDescription, announcementText, about } = req.body;

    const brandUpdates: Record<string, any> = {};
    if (heroHeadline !== undefined) brandUpdates.heroHeadline = heroHeadline;
    if (heroSubheadline !== undefined) brandUpdates.heroSubheadline = heroSubheadline;
    if (heroDescription !== undefined) brandUpdates.heroDescription = heroDescription;
    if (announcementText !== undefined) brandUpdates.announcementText = announcementText;

    const [updatedBrand, updatedAbout] = await Promise.all([
      Object.keys(brandUpdates).length > 0
        ? supabaseContentRepo.updateBrandSettings(brandUpdates)
        : supabaseContentRepo.getBrandSettings(),
      about
        ? supabaseContentRepo.updateAboutContent(about)
        : supabaseContentRepo.getAboutContent(),
    ]);

    res.json({ success: true, data: { brand: updatedBrand, about: updatedAbout } });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.listen(PORT, () => {
  console.log(`[content-service] Running on port ${PORT} (Supabase connected)`);
});

export default app;
