# LEZIT Transportation Management System — MVP

[![CI / CD](https://github.com/ShivaKumarChakali/lezit-transports-mvp/actions/workflows/ci.yml/badge.svg)](https://github.com/ShivaKumarChakali/lezit-transports-mvp/actions/workflows/ci.yml)

A transportation management platform for LEZIT TRANSPORTS: register vehicle owners, manage drivers and vehicles, create routes, schedule trips, allocate passengers and monitor daily transportation operations.
This build covers the platform foundation and core management. See “What is still TODO” below.

## Stack

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

First accounts: register via `/register` (vehicle owner, driver, organization
or passenger only — admin roles cannot self-register). New accounts start
pending approval and cannot log in until an admin approves them; registration
returns no token. Admin accounts are created by an existing Super Admin
(`POST /users`) or by the seed script:

```bash
SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD='...' npm run seed --workspace=apps/api
```

With no env vars set, the seed only approves the oldest pending Super Admin
(if one exists and no approved Super Admin exists yet), so a deployment can
never be locked out of its own admin account. Never put a real password in
the repo — it comes from the environment only.

## Included in this build

- Secure login / register, JWT, bcrypt password hashing. Public registration
  allows only vehicle owner, driver, organization and passenger, creates a
  pending account and returns no token; login requires approved + active
  status. Admin accounts are created by a Super Admin or the seed script.
- RBAC: NestJS `RolesGuard` + `@Roles()` decorator; Next.js middleware decodes
  the JWT role and redirects wrong-role dashboard visits, the dashboard layout
  and sidebar enforce the same check, and the API remains the source of truth.
  Vehicle owners can only see their own vehicles (list and single fetch).
- 6 dashboards wired to the real APIs: Super Admin and LEZIT Admin show live
  counts, pending user/vehicle approvals (approve / reject) and
  activate / deactivate actions; Owner registers vehicles, manages its
  business profile and document records; Driver saves licence details and
  sees verification status; Organization and Passenger manage their profiles.
- Prisma schema: users, vehicle-owner / driver / organization / passenger profiles, vehicles, documents (metadata only), approval status `pending | approved | rejected`, account status `active | inactive`
- API: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `GET /users` (admin), `GET /users/:id`, `PATCH /users/:id/approval`, `PATCH /users/:id/status`, `POST /users` (Super Admin creates admin accounts), `GET /vehicles`, `POST /vehicles`, `GET /vehicles/:id`, `PATCH /vehicles/:id/approval`, `GET /profiles/me`, `PATCH /profiles/me`, `GET /profiles/:userId` (admin), `POST /documents`, `GET /documents`, `GET /documents/:id`, `PATCH /documents/:id/verify` (admin)

## What is still TODO (Phase 2)

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
| `deploy` | Notes that Railway auto-deploys on push to `main` — **only after build + test + ui-test all pass** |

Local equivalents: `npm run typecheck`, `npm run lint`, `npm run build`,
`npm test` (unit tests), `npm run test:ui` (Playwright, in `apps/web`).

**Deploy:** Railway watches the repo's `main` branch and auto-deploys two
services, one per app (`apps/api` and `apps/web`), plus a PostgreSQL database
in the same Railway project. No token is stored in this repo. The Railway
project runs on a **trial** account for now; move to a paid Railway plan only
after the demo is shown to the friend and approved. The API service runs the
database migration (`prisma migrate deploy`) before starting, so the tables
are created on first deploy.

## Explicitly NOT in the MVP

Automated self-service booking, live GPS tracking & maps, OTP / QR passenger
verification, online payment gateway, automated invoices & settlements,
SMS / WhatsApp integrations, emergency SOS, advanced reporting / analytics,
AI route optimisation, native Android / iOS apps. None of these are in this
scaffold — do not add them without a new scope decision.
