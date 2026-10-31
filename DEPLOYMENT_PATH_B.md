# Deployment Plan — Path B (Express on Node platform, web on Cloudflare)

## Path decision
- Chosen: **Path B**. Express services unchanged on a Node-capable host (Fly.io/Render/Railway); web app on Cloudflare Pages; api-gateway exposed publicly via Cloudflare.
- Rejected A: highest migration effort + behavioral-drift risk; not needed since Express runs natively on Node platform.
- Rejected C: newer/less mature container runtime; pricing/cold-start unvalidated; unnecessary given B.

## Per-service matrix
| Service | Path | Resource | Name | Entry | Artifact | Compat | Bindings | Secrets | Route |
|---|---|---|---|---|---|---|---|---|---|
| shared-contracts | packages/shared-contracts | lib (npm) | — | src/index.ts | dist/ | — | none | none | internal |
| shared-validation | packages/shared-validation | lib (npm) | — | src/index.ts | dist/ | — | none | none | internal |
| api-gateway | services/api-gateway | Node host | water-api-gateway | src/index.ts | dist/ | node | service bindings (HTTP) | JWT_SECRET, DB_URL | public (gateway) |
| auth-service | services/auth-service | Node host | water-auth | src/index.ts | dist/ | node | none | JWT_SECRET, DB_URL | internal |
| catalogue-service | services/catalogue-service | Node host | water-catalogue | src/index.ts | dist/ | node | none | DB_URL | internal |
| content-service | services/content-service | Node host | water-content | src/index.ts | dist/ | node | none | DB_URL | internal |
| enquiry-service | services/enquiry-service | Node host | water-enquiry | src/index.ts | dist/ | node | none | DB_URL | internal |
| media-service | services/media-service | Node host | water-media | src/index.ts | dist/ | node | none | DB_URL, STORAGE | internal |
| notification-service | services/notification-service | Node host | water-notification | src/index.ts | dist/ | node | none | SMTP/keys | internal |
| pricing-service | services/pricing-service | Node host | water-pricing | src/index.ts | dist/ | node | none | DB_URL | internal |
| reporting-service | services/reporting-service | Node host | water-reporting | src/index.ts | dist/ | node | none | DB_URL | internal |
| worker-service | services/worker-service | Node host | water-worker | src/index.ts | dist/ | node | none | DB_URL | internal |
| web | apps/web | Cloudflare Pages | water12 | (Next build) | .next | — | none | none | public |

## Binding map (api-gateway → downstream)
Gateway calls each service over internal HTTP base URLs configured via env vars (e.g. AUTH_SERVICE_URL). No Cloudflare service bindings (Node platform). Env var names must be preserved.

## Runbook
1. Provision Node host account + one app per service.
2. Build shared packages first: `npm run build:packages`.
3. For each service: `npm run build -w services/<svc>` then deploy artifact to its app.
4. Deploy api-gateway last among backends; set service URL env vars.
5. Deploy web to Cloudflare Pages: `npm run build -w apps/web` then `npx wrangler pages deploy apps/web/.next --project-name=water12`.
6. Verify health endpoints and gateway routing.

## Rollback
- Per service: redeploy previous image/artifact.
- Whole release: revert to previous git commit + redeploy all.

## Deferred follow-ups
- multer 1.x advisory — remediation window: next sprint, replace with multer 2.x or native multipart.
- uuid 9 deprecations — upgrade to uuid 10+ when Node 24 baseline confirmed.
- Next.js 14.2.15 security advisory — upgrade to 14.2.x patched or 15.x before public launch; do not weaken security posture.

## Credentials checklist (user must provide)
- Node host API token + app names
- Cloudflare account ID, Pages project name, API token (min scope: Pages deploy)
- Per-service secrets list above (values not in repo)
- Service URL env vars for gateway
- DB/storage connection strings
