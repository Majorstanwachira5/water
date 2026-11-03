import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { AuditLog, supabaseReportingRepo } from '@michaforge/shared-contracts';

const PORT = process.env.PORT || 4007;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'reporting-service', storage: 'supabase', timestamp: new Date().toISOString() });
});

// Overview Dashboard Metrics (Calculated live from Supabase tables)
app.get('/api/v1/admin/reports/overview', async (req, res) => {
  try {
    const metrics = await supabaseReportingRepo.getOverviewMetrics();
    res.json({ success: true, data: metrics });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'METRICS_ERROR', message: err.message },
    });
  }
});

// Audit Logs
app.get('/api/v1/admin/audit-logs', async (req, res) => {
  try {
    const logs = await supabaseReportingRepo.listAuditLogs(100);
    res.json({ success: true, data: logs });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.post('/api/v1/admin/audit-logs', async (req, res) => {
  try {
    const { actorId, actorName, action, entityType, entityId, details } = req.body;
    if (!actorName || !action || !entityType) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Actor, action and entityType are required' },
      });
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
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.listen(PORT, () => {
  console.log(`[reporting-service] Running on port ${PORT} (Supabase connected)`);
});

export default app;
