# LEZIT Transportation Management System — MVP

[![CI / CD](https://github.com/ShivaKumarChakali/lezit-transports-mvp/actions/workflows/ci.yml/badge.svg)](https://github.com/ShivaKumarChakali/lezit-transports-mvp/actions/workflows/ci.yml)

Fresh build for LEZIT TRANSPORTS, 17 November 2026.
Total scope: ₹2,00,000 + 18% GST = ₹2,36,000, 320 hours, 10–14 weeks, two phases.
This scaffold is **Phase 1 only** — platform foundation and core management. See “What is still TODO” below.

## Stack (exactly as quoted)

| Component | Technology |
|---|---|
| Frontend | React / Next.js (App Router, TypeScript) |
| Backend | Node.js / NestJS (TypeScript) |
| Database | PostgreSQL (via Prisma) |
| Authentication | JWT + Role-Based Access Control (RBAC) |
| Application type | Responsive website, HTTPS-ready |

## Layout

```
lezit-transports-mvp/
├── apps/web/          # Next.js 14 frontend
│   ├── src/app/       # login, register, dashboard/* (6 dashboards)
│   ├── src/components/# Sidebar, Header, DashboardCard
│   ├── src/lib/       # auth helpers, roles
│   └── public/        # LEZIT logo (gold on black, transparent PNG + JPG favicon)
├── apps/api/          # NestJS backend
│   ├── prisma/schema.prisma
│   └── src/           # auth, users, vehicles, prisma, common (roles guard)
├── packages/shared/   # Shared TypeScript types (Role, User, approval status)
├── docker-compose.yml # PostgreSQL 16 for local dev
└── .env.example       # Placeholder env vars — no real secrets
```

## Roles (6)

`super_admin`, `lezit_admin`, `vehicle_owner`, `driver`, `organization`, `passenger`

Dashboards: `/dashboard/super-admin`, `/dashboard/admin`, `/dashboard/owner`,
`/dashboard/driver`, `/dashboard/organization`, `/dashboard/passenger`.

## Run locally

```bash
# 1. Prerequisites: Node.js 20+, npm, Docker (for Postgres)
# 2. Install
npm install

# 3. Start PostgreSQL
docker compose up -d db

# 4. Backend env
cp apps/api/.env.example apps/api/.env
# Edit DATABASE_URL / JWT_SECRET if needed (defaults match docker-compose)

# 5. Apply the database schema
npm run db:migrate        # creates tables from prisma/schema.prisma

# 6. Run the API (http://localhost:3001) and the web app (http://localhost:3000)
npm run dev:api           # in one terminal
npm run dev:web           # in another terminal
```

Frontend env: copy `apps/web/.env.example` to `apps/web/.env.local` and set
`NEXT_PUBLIC_API_URL=http://localhost:3001` (already the default).

First accounts: register via `/register` (pick a role) or via the API
`POST /auth/register`. The first `super_admin` / `lezit_admin` accounts must be
created by the project owner — there is no public self-registration for
`super_admin` in production use; the register endpoint accepts the role for
local Phase 1 testing only.

## Phase 1 — included in this scaffold

- Secure login / register, JWT, bcrypt password hashing
- RBAC: NestJS `RolesGuard` + `@Roles()` decorator; Next.js middleware protecting `/dashboard/*`
- 6 dashboard shells with LEZIT gold (`#d4af37`) / black (`#111111`) / cream (`#f7f1df`) branding, sidebar + header, placeholder cards
- Prisma schema: users, vehicle-owner / driver / organization / passenger profiles, vehicles, documents (metadata only), approval status `pending | approved | rejected`, account status `active | inactive`
- API: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `GET /users` (admin), `GET /users/:id`, `PATCH /users/:id/approval`, `GET /vehicles`, `POST /vehicles`, `GET /vehicles/:id`

## What is still TODO (Phase 2, per the quote)

Routes, pickup/drop locations, schedules, vehicle/driver assignment, passenger
registration & allocation, manual bookings, trip management, passenger
attendance (check-in / check-out), seat-capacity validation, basic operational
reports, testing & UAT, production deployment & handover.

## CI / CD

Every push to `main` and every pull request runs the **CI / CD** workflow
(`.github/workflows/ci.yml`). See its status in the badge above, or in the
GitHub repo under **Actions** — each stage is a separate job, so a failure
shows exactly which stage went red: `build`, `test`, `ui-test`, `deploy`.

| Job | What it does |
|---|---|
| `build` | Install deps, generate the Prisma Client, typecheck + lint + build both apps |
| `test` | Jest unit tests (API) + Vitest unit tests (web) |
| `ui-test` | Playwright smoke tests (login page, auth redirect); the HTML report is uploaded as an artifact if the job fails |
| `deploy` | Railway deploy — **only on push to `main`, only if build + test + ui-test all pass** |

Local equivalents: `npm run typecheck`, `npm run lint`, `npm run build`,
`npm test` (unit tests), `npm run test:ui` (Playwright, in `apps/web`).

**Deploy needs one secret:** `RAILWAY_TOKEN` — add it in GitHub
Settings > Secrets and variables > Actions. Get it from the Railway
dashboard (Tokens) on the Railway **trial** account for now; move to a paid
Railway plan only after the demo is shown to the friend and approved. No
token is stored in this repo. The Railway project must already exist and be
linked to this repo; configure one Railway service per app (`apps/api` and
`apps/web`) and a PostgreSQL database in Railway.

## Explicitly NOT in the MVP (per the quote, §10)

Automated self-service booking, live GPS tracking & maps, OTP / QR passenger
verification, online payment gateway, automated invoices & settlements,
SMS / WhatsApp integrations, emergency SOS, advanced reporting / analytics,
AI route optimisation, native Android / iOS apps. None of these are in this
scaffold — do not add them without a new scope decision.
