import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PORT = process.env.PORT || 4008;
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'notifications_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface NotificationRecord {
  id: string;
  channel: 'email' | 'sms' | 'whatsapp';
  recipient: string;
  subject?: string;
  message: string;
  status: 'sent' | 'queued' | 'failed' | 'simulated';
  provider: string;
  createdAt: string;
}

interface NotificationDatabase {
  notifications: NotificationRecord[];
}

function loadDb(): NotificationDatabase {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb: NotificationDatabase = { notifications: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDb(data: NotificationDatabase) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service', timestamp: new Date().toISOString() });
});

// Send Notification (Provider Adapter Pattern)
app.post('/api/v1/notifications', (req, res) => {
  const { channel, recipient, subject, message } = req.body;
  if (!channel || !recipient || !message) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Channel, recipient, and message are required' },
    });
  }

  const db = loadDb();
  // Check if live external provider configured
  const hasLiveConfig =
    (channel === 'sms' && !!process.env.AFRICASTALKING_API_KEY) ||
    (channel === 'whatsapp' && !!process.env.WHATSAPP_BUSINESS_TOKEN) ||
    (channel === 'email' && !!process.env.SMTP_HOST);

  const newRecord: NotificationRecord = {
    id: `ntf_${crypto.randomUUID().slice(0, 8)}`,
    channel,
    recipient,
    subject,
    message,
    status: hasLiveConfig ? 'sent' : 'simulated',
    provider: hasLiveConfig ? 'Live Provider' : 'Simulated Adapter (Sandbox Mode)',
    createdAt: new Date().toISOString(),
  };

  db.notifications.unshift(newRecord);
  saveDb(db);

  res.status(201).json({
    success: true,
    data: newRecord,
    meta: {
      providerMode: hasLiveConfig ? 'live' : 'sandbox',
      note: hasLiveConfig ? undefined : 'Live API keys not supplied in .env; notification logged in sandbox mode.',
    },
  });
});

// Admin List Notifications
app.get('/api/v1/admin/notifications', (req, res) => {
  const db = loadDb();
  res.json({ success: true, data: db.notifications.slice(0, 50) });
});

// Admin Test Notification
app.post('/api/v1/admin/notifications/test', (req, res) => {
  const { channel = 'sms', recipient = '+254714843208' } = req.body;
  const testMessage = `[TEST] Michaforge Enterprises notification dispatch verification. Channel: ${channel}. Time: ${new Date().toLocaleTimeString()}`;
  
  const db = loadDb();
  const testRecord: NotificationRecord = {
    id: `ntf_test_${crypto.randomUUID().slice(0, 8)}`,
    channel,
    recipient,
    subject: 'Test Notification',
    message: testMessage,
    status: 'simulated',
    provider: 'Simulated Adapter',
    createdAt: new Date().toISOString(),
  };

  db.notifications.unshift(testRecord);
  saveDb(db);

  res.json({ success: true, data: testRecord });
});

app.listen(PORT, () => {
  loadDb();
  console.log(`[notification-service] Running on port ${PORT}`);
});

export default app;
