# Bling Refactor - Session Handoff & Progress Export

**Date:** September 20, 2026  
**Latest Commits:**
- `refactor-bling-backend`: `7ca9be6 feat(auth): invalidate and blocklist previous access token upon token refresh` (pushed to `origin/main`)
- `refactor-bling-dashboard`: `78b4644 area and governorate to be continued` (pushed to `origin/main`)

---

## 1. Project Architecture Overview

- **Backend (`refactor-bling-backend`)**: NestJS Monorepo (TypeORM + PostgreSQL, Redis, Meilisearch).
  - `admin-api` (Port `4000`, prefix `/api`): Used by the Admin Dashboard.
  - `public-api` (Port `3000`, prefix `/api`): Used by mobile and consumer client apps.
  - Shared libs under `libs/` (`database`, `common`, `config`, `redis`, `mail`, `search-engine`, `storage`, `validators`).
- **Dashboard (`refactor-bling-dashboard`)**: Vue 3 + TypeScript + Vite + Metronic Theme (Port `5173`).

---

## 2. Core Architectural Conventions & Guidelines

1. **Strict CamelCase Standard**:
   - All database columns, DTO properties, request/response bodies, and entities strictly adhere to `camelCase` (no snake_case keys like `is_default`, `refresh_token`, etc.).
   - No fallback transformation orings (e.g. `obj?.refresh_token` or `|| (dto as any).refresh_token` are strictly eliminated).
2. **BaseService<T> CRUD Pattern**:
   - All entity services extend `BaseService<T>` from `@libs/index`.
   - Never write repetitive CRUD boilerplate (`create`, `update`, `remove`, `removeHard`, `restore`) unless custom domain logic is explicitly required.
   - Controllers always receive `@Query() pagination: PaginationDto` and pass `{ pagination }` to `service.findAll(...)`.
3. **Response Structure**:
   - Standardized NestJS interceptor wraps responses into `{ success: true, statusCode, message, data }`.
   - Auth responses strictly return `{ client/admin, accessToken, refreshToken }` (no redundant `token` key).
4. **Postman Collections Maintenance**:
   - Maintained programmatically via `scripts/generate-postman.js`.
   - Run `npm run generate:postman` to re-generate collections in `docs/`:
     - `docs/bling_public_api.postman_collection.json`
     - `docs/bling_admin_api.postman_collection.json`
   - Test scripts populate both `pm.collectionVariables` and `pm.globals`.

---

## 3. Completed Modules & Features

### A. Client Authentication & Token Security (`public-api` & `admin-api`)
1. **Entity**: `Client` (passwordless, phone-first auth, unique phone).
2. **Public Auth Flow**:
   - `POST /api/auth/register` (Phone + Name, OTP generated in Redis).
   - `POST /api/auth/verify-register-otp` (Creates client, issues `accessToken` + `refreshToken`).
   - `POST /api/auth/sign-in` (Sends OTP).
   - `POST /api/auth/verify-login-otp` (Issues `accessToken` + `refreshToken`).
   - `POST /api/auth/resend-otp` (Re-issues OTP).
   - `POST /api/auth/refresh` (Rotates refresh token + invalidates previous access token).
   - `POST /api/auth/sign-out` (Blocklists current token and deletes refresh token from Redis).
   - `GET /api/auth/me` (Protected profile retrieval).
3. **Multi-Tier Rate Limiting**:
   - 1 req per 10s (`short`), 3 reqs per 1 min (`medium`), 5 reqs per 15 mins (`long`).
4. **Token Security & Revocation**:
   - **Paired Token Storage**: Refresh tokens in Redis store `{ userId/adminId, accessToken }`.
   - **Immediate Revocation**: Calling `POST /auth/refresh` immediately blocklists the previous access token in Redis (`TOKEN_BLOCKLIST`), rejecting subsequent requests with `401 Unauthorized: Token is blocklisted`.
   - **Refresh Token Rotation**: Each refresh consumes and deletes the old refresh token and returns a brand new pair.

### B. Client Address Module (`public-api`)
1. **Entity**: `Address` (`libs/database/src/entities/address.entity.ts`):
   - `clientId` (ManyToOne -> `Client`, indexed)
   - `label` (e.g. "Home", "Work")
   - `lat` (decimal), `long` (decimal)
   - `governorateId` (ManyToOne -> `Governorate`)
   - `areaId` (ManyToOne -> `Area`)
   - `street`, `block`, `houseNumber`, `additionalDetails`
   - `isDefault` (boolean, auto-manages single default address per client)
2. **Service**: `AddressService` extending `BaseService<Address>`:
   - First address added by client automatically marked `isDefault = true`.
   - Setting a default address automatically unsets any previous default for that client.
3. **Endpoints**:
   - `POST /api/addresses` - Create client address
   - `GET /api/addresses` - List client addresses with pagination
   - `GET /api/addresses/:id` - Get specific address details
   - `PATCH /api/addresses/:id` - Update address
   - `DELETE /api/addresses/:id` - Delete address
   - `PATCH /api/addresses/:id/default` - Set as default address

### C. Kuwait Locations Module (Governorates & Areas)
1. **Entities**: `Governorate` & `Area` with cascade relationships and soft delete.
2. **Services**: Refactored to extend `BaseService<T>`.
3. **Seed Data**: 6 Kuwait Governorates and 190 Areas fully ported and seeded.
4. **Admin API**: Full CRUD, soft delete, hard delete, restore under `/api/admin/governorates` & `/api/admin/areas`.
5. **Public API**: `GET /api/locations/governorates` and `GET /api/locations/areas?governorateId=...`.
6. **Dashboard UI**: Vue 3 management pages with search, modals, and confirmations.

### D. Database & Tooling
- Added `"db:fresh:seed": "ts-node -r tsconfig-paths/register scripts/seed.ts --fresh-db --flush-redis"` to `package.json` for 1-step complete schema drop, rebuild, and clean seeding.

---

## 4. How to Setup & Run on the Other PC

### Step 1: Pull Latest Repositories
```bash
cd refactor-bling-backend && git pull origin main
cd ../refactor-bling-dashboard && git pull origin main
```

### Step 2: Environment Variables
Ensure `.env` exists in `refactor-bling-backend`:
```env
PORT=3000
ADMIN_PORT=4000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=bling_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=supersecretjwtkey
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

Ensure `.env` exists in `refactor-bling-dashboard`:
```env
VITE_APP_API_URL="http://localhost:4000/api"
```

### Step 3: Fresh Database Setup & Seeding
```bash
cd refactor-bling-backend
npm install
npm run db:fresh:seed
```

### Step 4: Run Development Servers
```bash
# Terminal 1 - Admin API (Port 4000)
cd refactor-bling-backend
nest start admin-api --watch

# Terminal 2 - Public API (Port 3000)
cd refactor-bling-backend
nest start public-api --watch

# Terminal 3 - Dashboard (Port 5173)
cd refactor-bling-dashboard
npm run dev
```

### Step 5: Postman Setup
Import the collections from `refactor-bling-backend/docs/`:
- `docs/bling_public_api.postman_collection.json`
- `docs/bling_admin_api.postman_collection.json`
- Test client phone is default prefilled as `+201007949946`.
- Running OTP verify will automatically populate `client_access_token` and `client_refresh_token` in both Collection Variables and Globals.

---

## 5. Next Immediate Steps / Backlog

1. **Phase 3 Entities (Service Providers & Orders)**:
   - **Maid Entity** & **Driver Entity**: Schemas, skills/languages, availability status, pricing/hourly rates, assigned vehicle or area.
   - **Services / Categories**: Cleaning, hospitality, hourly drivers, package bookings.
   - **Order / Booking Flow**: Linking `Client`, `Address`, `Maid`/`Driver`, payment status, and order lifecycle states.
2. **Dashboard Integration for Addresses & Clients**:
   - Add Client listing and view client saved addresses in Admin Dashboard.
