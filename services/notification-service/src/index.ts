import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { supabaseNotificationRepo, NotificationDbRecord } from '@michaforge/shared-contracts';

const PORT = process.env.PORT || 4008;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service', storage: 'supabase', timestamp: new Date().toISOString() });
});

// Send Notification (Provider Adapter Pattern backed by Supabase)
app.post('/api/v1/notifications', async (req, res) => {
  try {
    const { channel, recipient, subject, message } = req.body;
    if (!channel || !recipient || !message) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Channel, recipient, and message are required' },
      });
    }

    const hasLiveConfig =
      (channel === 'sms' && !!process.env.AFRICASTALKING_API_KEY) ||
      (channel === 'whatsapp' && !!process.env.WHATSAPP_BUSINESS_TOKEN) ||
      (channel === 'email' && !!process.env.SMTP_HOST);

    const newRecord: NotificationDbRecord = {
      id: `ntf_${crypto.randomUUID().slice(0, 8)}`,
      channel,
      recipient,
      subject,
      message,
      status: hasLiveConfig ? 'sent' : 'simulated',
      provider: hasLiveConfig ? 'Live Provider' : 'Simulated Adapter (Sandbox Mode)',
      createdAt: new Date().toISOString(),
    };

    const created = await supabaseNotificationRepo.createNotification(newRecord);

    res.status(201).json({
      success: true,
      data: created,
      meta: {
        providerMode: hasLiveConfig ? 'live' : 'sandbox',
        note: hasLiveConfig ? undefined : 'Live API keys not supplied in .env; notification logged in Supabase.',
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Admin List Notifications
app.get('/api/v1/admin/notifications', async (req, res) => {
  try {
    const list = await supabaseNotificationRepo.listNotifications(50);
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

// Admin Test Notification
app.post('/api/v1/admin/notifications/test', async (req, res) => {
  try {
    const { channel = 'sms', recipient = '+254714843208' } = req.body;
    const testMessage = `[TEST] Michaforge Enterprises notification dispatch verification. Channel: ${channel}. Time: ${new Date().toLocaleTimeString()}`;

    const testRecord: NotificationDbRecord = {
      id: `ntf_test_${crypto.randomUUID().slice(0, 8)}`,
      channel,
      recipient,
      subject: 'Test Notification',
      message: testMessage,
      status: 'simulated',
      provider: 'Simulated Adapter',
      createdAt: new Date().toISOString(),
    };

    const created = await supabaseNotificationRepo.createNotification(testRecord);
    res.json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.listen(PORT, () => {
  console.log(`[notification-service] Running on port ${PORT} (Supabase connected)`);
});

export default app;
