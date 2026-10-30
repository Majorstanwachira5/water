import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Enquiry, EnquiryStatus } from '@michaforge/shared-contracts';
import { normalizeKenyanPhoneNumber, generateWhatsAppLink } from '@michaforge/shared-validation';

const PORT = process.env.PORT || 4005;
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'enquiry_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface EnquiryDatabase {
  enquiries: Enquiry[];
}

function loadDb(): EnquiryDatabase {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb: EnquiryDatabase = {
      enquiries: [
        {
          id: 'enq_sample_01',
          customerName: 'Joseph Mwangi',
          phoneNumber: '+254712345678',
          email: 'joseph@example.com',
          enquiryType: 'product',
          productId: 'prd_pvc_4in',
          productName: 'PVC Pipes (4")',
          productSku: 'MF-PVC-004',
          message: 'Hello, need quotation for 25 pieces of 4" PVC pipes delivered to Nairobi West.',
          status: 'New',
          source: 'website_form',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          notes: [],
          followUps: [],
        },
      ],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDb(data: EnquiryDatabase) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'enquiry-service', timestamp: new Date().toISOString() });
});

// Submit Enquiry (Public)
app.post('/api/v1/enquiries', (req, res) => {
  const { customerName, phoneNumber, email, enquiryType, productId, productName, productSku, message, source } = req.body;

  if (!customerName || !phoneNumber || !message) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Name, phone number, and message are required' },
    });
  }

  const normalizedPhone = normalizeKenyanPhoneNumber(phoneNumber);
  const db = loadDb();

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.enquiries.unshift(newEnquiry);
  saveDb(db);

  res.status(201).json({
    success: true,
    data: newEnquiry,
    meta: {
      whatsappQuickLink: generateWhatsAppLink(normalizedPhone, productName, productSku),
    },
  });
});

// Admin List Enquiries
app.get('/api/v1/admin/enquiries', (req, res) => {
  const { status, search } = req.query;
  const db = loadDb();
  let list = db.enquiries;

  if (status) {
    list = list.filter((e) => e.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter((e) =>
      e.customerName.toLowerCase().includes(q) ||
      e.phoneNumber.includes(q) ||
      (e.productName && e.productName.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, data: list, meta: { total: list.length } });
});

// Admin Get Enquiry Detail
app.get('/api/v1/admin/enquiries/:id', (req, res) => {
  const db = loadDb();
  const enquiry = db.enquiries.find((e) => e.id === req.params.id);
  if (!enquiry) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Enquiry not found' },
    });
  }
  res.json({ success: true, data: enquiry });
});

// Update Status
app.patch('/api/v1/admin/enquiries/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses: EnquiryStatus[] = ['New', 'Contacted', 'Quoted', 'Awaiting Customer', 'Completed', 'Closed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_STATUS', message: `Status must be one of: ${validStatuses.join(', ')}` },
    });
  }

  const db = loadDb();
  const enquiry = db.enquiries.find((e) => e.id === req.params.id);
  if (!enquiry) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Enquiry not found' },
    });
  }

  enquiry.status = status;
  enquiry.updatedAt = new Date().toISOString();
  saveDb(db);
  res.json({ success: true, data: enquiry });
});

// Add Note
app.post('/api/v1/admin/enquiries/:id/notes', (req, res) => {
  const { authorName = 'Administrator', content } = req.body;
  if (!content) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Content is required' },
    });
  }
  const db = loadDb();
  const enquiry = db.enquiries.find((e) => e.id === req.params.id);
  if (!enquiry) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Enquiry not found' },
    });
  }
  const note = {
    id: `not_${crypto.randomUUID().slice(0, 8)}`,
    enquiryId: enquiry.id,
    authorName,
    content,
    createdAt: new Date().toISOString(),
  };
  enquiry.notes = enquiry.notes || [];
  enquiry.notes.unshift(note);
  enquiry.updatedAt = new Date().toISOString();
  saveDb(db);
  res.status(201).json({ success: true, data: note });
});

app.listen(PORT, () => {
  loadDb();
  console.log(`[enquiry-service] Running on port ${PORT}`);
});

export default app;
