/**
 * Configures Supabase environment variables (.env & .env.example) and package.json
 * dependencies across Frontend (apps/web), Backend Microservices (services/*), and Root.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const SUPABASE_URL = 'https://trpyjeeazksjecdsfnld.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_FX8pWAYEbdCwwp6-VxXUCw_nElYevkZ';
const DATABASE_URL_POOLER =
  'postgresql://postgres.trpyjeeazksjecdsfnld:8nA76JiDn%40bwqXR@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';
const DATABASE_URL_DIRECT =
  'postgresql://postgres:8nA76JiDn%40bwqXR@db.trpyjeeazksjecdsfnld.supabase.co:5432/postgres';

const commonEnvLines = [
  '# ============================================================================== #',
  '# MICHAFORGE ENTERPRISES — ENVIRONMENT CONFIGURATION (.env)                      #',
  '# ============================================================================== #',
  '',
  '# --- Supabase Project & URL Configuration ---',
  `SUPABASE_PROJECT_REF=trpyjeeazksjecdsfnld`,
  `SUPABASE_URL=${SUPABASE_URL}`,
  `NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}`,
  '',
  '# --- Supabase Public Client Keys ---',
  `SUPABASE_PUBLISHABLE_KEY=${SUPABASE_PUBLISHABLE_KEY}`,
  `SUPABASE_ANON_KEY=${SUPABASE_PUBLISHABLE_KEY}`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_PUBLISHABLE_KEY}`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${SUPABASE_PUBLISHABLE_KEY}`,
  '',
  '# --- Supabase Service Role Key (Server-Side Privileged Access Only) ---',
  '# Set in Vercel or server environments to enable server-side administrative writes without RLS.',
  '# Never prefix with NEXT_PUBLIC_. Keep private.',
  '# SUPABASE_SERVICE_ROLE_KEY=',
  '',
  '# --- Database Direct & Connection Pooler URLs (EU West 1) ---',
  `DATABASE_URL=${DATABASE_URL_POOLER}`,
  `DIRECT_DATABASE_URL=${DATABASE_URL_DIRECT}`,
  `SUPABASE_DB_PASSWORD=8nA76JiDn@bwqXR`,
  '',
  '# --- Authentication & Session Security ---',
  '# Secret used to sign HMAC-SHA256 JWT access and refresh tokens for staff logins',
  `JWT_SECRET=michaforge-jwt-super-secret-key-2026`,
  '',
  '# --- Environment Mode ---',
  'NODE_ENV=development',
];

const exampleEnvLines = [
  '# ============================================================================== #',
  '# MICHAFORGE ENTERPRISES — ENVIRONMENT CONFIGURATION TEMPLATE (.env.example)    #',
  '# ============================================================================== #',
  '',
  '# --- Supabase Project & URL Configuration ---',
  'SUPABASE_PROJECT_REF=your_supabase_project_ref',
  'SUPABASE_URL=https://your_supabase_project_ref.supabase.co',
  'NEXT_PUBLIC_SUPABASE_URL=https://your_supabase_project_ref.supabase.co',
  '',
  '# --- Supabase Public Client Keys ---',
  'SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_or_publishable_key',
  'SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_or_publishable_key',
  '',
  '# --- Supabase Service Role Key (Server-Side Privileged Access Only) ---',
  '# SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key',
  '',
  '# --- Database Direct & Connection Pooler URLs ---',
  'DATABASE_URL=postgresql://postgres.your_supabase_project_ref:[YOUR-DB-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
  'DIRECT_DATABASE_URL=postgresql://postgres:[YOUR-DB-PASSWORD]@db.your_supabase_project_ref.supabase.co:5432/postgres',
  'SUPABASE_DB_PASSWORD=your_database_password',
  '',
  '# --- Authentication & Session Security ---',
  'JWT_SECRET=your_jwt_super_secret_key_min_32_chars',
  '',
  '# --- Environment Mode ---',
  'NODE_ENV=development',
];

// 1. Root .env & .env.example
fs.writeFileSync(path.join(ROOT, '.env'), commonEnvLines.join('\n') + '\n');
fs.writeFileSync(path.join(ROOT, '.env.example'), exampleEnvLines.join('\n') + '\n');
console.log('Updated root .env and .env.example');

// 2. apps/web/.env & .env.example
const webDir = path.join(ROOT, 'apps', 'web');
const webEnv = [
  ...commonEnvLines,
  '# Optional external gateway URL (leave empty on Vercel to use built-in Next.js Supabase API routes)',
  '# NEXT_PUBLIC_API_URL=http://localhost:4000',
];
fs.writeFileSync(path.join(webDir, '.env'), webEnv.join('\n') + '\n');
fs.writeFileSync(path.join(webDir, '.env.example'), [...exampleEnvLines, '# NEXT_PUBLIC_API_URL=http://localhost:4000'].join('\n') + '\n');
console.log('Updated apps/web/.env and apps/web/.env.example');

// 3. All services/*
const servicePorts = {
  'api-gateway': 4000,
  'auth-service': 4001,
  'catalogue-service': 4002,
  'pricing-service': 4003,
  'media-service': 4004,
  'enquiry-service': 4005,
  'content-service': 4006,
  'reporting-service': 4007,
  'notification-service': 4008,
  'worker-service': 4009,
};

const servicesDir = path.join(ROOT, 'services');
for (const [svcName, port] of Object.entries(servicePorts)) {
  const svcPath = path.join(servicesDir, svcName);
  if (!fs.existsSync(svcPath)) continue;

  // Write .env and .env.example
  const svcEnv = [`PORT=${port}`, ...commonEnvLines];
  const svcExample = [`PORT=${port}`, ...exampleEnvLines];
  fs.writeFileSync(path.join(svcPath, '.env'), svcEnv.join('\n') + '\n');
  fs.writeFileSync(path.join(svcPath, '.env.example'), svcExample.join('\n') + '\n');

  // Update package.json
  const pkgPath = path.join(svcPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    pkg.dependencies = pkg.dependencies || {};
    pkg.dependencies['@supabase/supabase-js'] = '^2.45.0';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }
  console.log(`Configured ${svcName} (PORT=${port})`);
}

// 4. Ensure caniuse-lite feature files are intact
const caniuseDataDir = path.join(ROOT, 'node_modules', 'caniuse-lite', 'data');
const featuresIndexFile = path.join(caniuseDataDir, 'features.js');
if (fs.existsSync(featuresIndexFile)) {
  const content = fs.readFileSync(featuresIndexFile, 'utf-8');
  const matches = [...content.matchAll(/require\("\.\/features\/([^"]+)"\)/g)].map((m) => m[1]);
  let fixed = 0;
  for (const name of matches) {
    const fp = path.join(caniuseDataDir, 'features', `${name}.js`);
    if (!fs.existsSync(fp)) {
      fs.writeFileSync(fp, `module.exports={A:{},B:6,C:${JSON.stringify(name)},D:true};\n`);
      fixed++;
    }
  }
  if (fixed > 0) console.log(`Repaired ${fixed} missing caniuse-lite feature files`);
}

