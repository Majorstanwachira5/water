import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { Enquiry, EnquiryStatus, supabaseEnquiryRepo } from '@michaforge/shared-contracts';
import { normalizeKenyanPhoneNumber, generateWhatsAppLink } from '@michaforge/shared-validation';

const PORT = process.env.PORT || 4005;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'enquiry-service', storage: 'supabase', timestamp: new Date().toISOString() });
});

// Submit Enquiry (Public)
app.post('/api/v1/enquiries', async (req, res) => {
  try {
    const { customerName, phoneNumber, email, enquiryType, productId, productName, productSku, message, source } = req.body;

    if (!customerName || !phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name, phone number, and message are required' },
      });
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

    res.status(201).json({
      success: true,
      data: created,
      meta: {
        whatsappQuickLink: generateWhatsAppLink(normalizedPhone, productName, productSku),
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Admin List Enquiries
app.get('/api/v1/admin/enquiries', async (req, res) => {
  try {
    const { status, search } = req.query;
    const list = await supabaseEnquiryRepo.listEnquiries({
      status: status ? String(status) : undefined,
      search: search ? String(search) : undefined,
    });
    res.json({ success: true, data: list, meta: { total: list.length } });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Admin Get Enquiry Detail
app.get('/api/v1/admin/enquiries/:id', async (req, res) => {
  try {
    const enquiry = await supabaseEnquiryRepo.getEnquiryById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Enquiry not found' },
      });
    }
    res.json({ success: true, data: enquiry });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Update Status
app.patch('/api/v1/admin/enquiries/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses: EnquiryStatus[] = ['New', 'Contacted', 'Quoted', 'Awaiting Customer', 'Completed', 'Closed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: `Status must be one of: ${validStatuses.join(', ')}` },
      });
    }

    const updated = await supabaseEnquiryRepo.updateEnquiryStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Enquiry not found' },
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

// Add Note
app.post('/api/v1/admin/enquiries/:id/notes', async (req, res) => {
  try {
    const { authorName = 'Administrator', content } = req.body;
    if (!content) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Content is required' },
      });
    }

    const note = {
      id: `not_${crypto.randomUUID().slice(0, 8)}`,
      enquiryId: req.params.id,
      authorName,
      content,
      createdAt: new Date().toISOString(),
    };

    const savedNote = await supabaseEnquiryRepo.addEnquiryNote(req.params.id, note);
    if (!savedNote) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Enquiry not found' },
      });
    }

    res.status(201).json({ success: true, data: savedNote });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.listen(PORT, () => {
  console.log(`[enquiry-service] Running on port ${PORT} (Supabase connected)`);
});

export default app;
