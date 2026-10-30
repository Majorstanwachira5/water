/**
 * MICHAFORGE ENTERPRISES — Orchestration startup script
 * Starts all microservices + the Next.js frontend in development mode.
 * Each service is launched as a child process with colour-coded log prefixes.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');

const SERVICES = [
  { name: 'auth-service',        port: 4001, dir: 'services/auth-service',        cmd: 'node', args: ['dist/index.js'] },
  { name: 'catalogue-service',   port: 4002, dir: 'services/catalogue-service',   cmd: 'node', args: ['dist/index.js'] },
  { name: 'pricing-service',     port: 4003, dir: 'services/pricing-service',     cmd: 'node', args: ['dist/index.js'] },
  { name: 'media-service',       port: 4004, dir: 'services/media-service',       cmd: 'node', args: ['dist/index.js'] },
  { name: 'enquiry-service',     port: 4005, dir: 'services/enquiry-service',     cmd: 'node', args: ['dist/index.js'] },
  { name: 'content-service',     port: 4006, dir: 'services/content-service',     cmd: 'node', args: ['dist/index.js'] },
  { name: 'reporting-service',   port: 4007, dir: 'services/reporting-service',   cmd: 'node', args: ['dist/index.js'] },
  { name: 'notification-service',port: 4008, dir: 'services/notification-service',cmd: 'node', args: ['dist/index.js'] },
  { name: 'api-gateway',         port: 4000, dir: 'services/api-gateway',         cmd: 'node', args: ['dist/index.js'] },
  { name: 'web-frontend',        port: 3000, dir: 'apps/web',                     cmd: 'npm',  args: ['run', 'dev'] },
];

const COLORS = [
  '\x1b[36m', // cyan
  '\x1b[32m', // green
  '\x1b[33m', // yellow
  '\x1b[35m', // magenta
  '\x1b[34m', // blue
  '\x1b[91m', // bright red
  '\x1b[92m', // bright green
  '\x1b[93m', // bright yellow
  '\x1b[94m', // bright blue
  '\x1b[95m', // bright magenta
];
const RESET = '\x1b[0m';

const children = [];

function startService(svc, colorCode) {
  const cwd = path.join(ROOT, svc.dir);
  if (!fs.existsSync(cwd)) {
    console.warn(`[orchestrator] WARN: Directory not found: ${cwd} — skipping ${svc.name}`);
    return null;
  }

  const env = { ...process.env, PORT: String(svc.port) };
  const proc = spawn(svc.cmd, svc.args, { cwd, env, shell: true });

  const prefix = `${colorCode}[${svc.name}]${RESET} `;

  proc.stdout.on('data', (data) => {
    String(data).split('\n').forEach((line) => {
      if (line.trim()) process.stdout.write(`${prefix}${line}\n`);
    });
  });

  proc.stderr.on('data', (data) => {
    String(data).split('\n').forEach((line) => {
      if (line.trim()) process.stderr.write(`${prefix}\x1b[31m${line}${RESET}\n`);
    });
  });

  proc.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`${prefix}\x1b[31mProcess exited with code ${code}${RESET}`);
    }
  });

  return proc;
}

console.log('\n\x1b[1m\x1b[94m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
console.log('\x1b[1m\x1b[95m  MICHAFORGE ENTERPRISES — Full-Stack Dev Server Starting Up\x1b[0m');
console.log('\x1b[1m\x1b[94m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n');

SERVICES.forEach((svc, index) => {
  const color = COLORS[index % COLORS.length];
  const child = startService(svc, color);
  if (child) children.push(child);
});

console.log(`\n\x1b[1m[orchestrator] All ${children.length} processes launched.\x1b[0m`);
console.log('\x1b[1m[orchestrator] Frontend: \x1b[4mhttp://localhost:3000\x1b[0m');
console.log('\x1b[1m[orchestrator] API Gateway: \x1b[4mhttp://localhost:4000/api/v1/health\x1b[0m');
console.log('\x1b[1m[orchestrator] Admin Panel: \x1b[4mhttp://localhost:3000/admin\x1b[0m');
console.log('\x1b[1m[orchestrator] Admin Login: admin@michaforge.co.ke / Admin@Michaforge2026!\x1b[0m\n');

function cleanup() {
  console.log('\n[orchestrator] Shutting down all services...');
  children.forEach((child) => {
    try { child.kill('SIGTERM'); } catch (e) {}
  });
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
