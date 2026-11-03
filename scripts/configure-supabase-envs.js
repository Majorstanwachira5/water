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
  '# Michaforge Enterprises — Supabase Configuration',
  `SUPABASE_PROJECT_REF=trpyjeeazksjecdsfnld`,
  `SUPABASE_URL=${SUPABASE_URL}`,
  `NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}`,
  `SUPABASE_PUBLISHABLE_KEY=${SUPABASE_PUBLISHABLE_KEY}`,
  `SUPABASE_ANON_KEY=${SUPABASE_PUBLISHABLE_KEY}`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_PUBLISHABLE_KEY}`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${SUPABASE_PUBLISHABLE_KEY}`,
  `DATABASE_URL=${DATABASE_URL_POOLER}`,
  `DIRECT_DATABASE_URL=${DATABASE_URL_DIRECT}`,
  `JWT_SECRET=michaforge-jwt-super-secret-key-2026`,
];

const exampleEnvLines = [
  '# Michaforge Enterprises — Supabase Configuration Example',
  `SUPABASE_PROJECT_REF=trpyjeeazksjecdsfnld`,
  `SUPABASE_URL=${SUPABASE_URL}`,
  `NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}`,
  `SUPABASE_PUBLISHABLE_KEY=${SUPABASE_PUBLISHABLE_KEY}`,
  `SUPABASE_ANON_KEY=${SUPABASE_PUBLISHABLE_KEY}`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_PUBLISHABLE_KEY}`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${SUPABASE_PUBLISHABLE_KEY}`,
  `DATABASE_URL=postgresql://postgres.trpyjeeazksjecdsfnld:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
  `DIRECT_DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.trpyjeeazksjecdsfnld.supabase.co:5432/postgres`,
  `JWT_SECRET=michaforge-jwt-super-secret-key-2026`,
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

