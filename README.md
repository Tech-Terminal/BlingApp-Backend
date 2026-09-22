# Bling Backend (NestJS Monorepo)

This repository contains the backend APIs for the Bling system, structured as a NestJS monorepo. It contains two main applications:
1. **Admin API (`admin-api`)**: Serves the back-office dashboard.
2. **Public API (`public-api`)**: Serves the public website and customer-facing clients.

---

## Prerequisites

- **Node.js**: `v24.x` (or newer)
- **npm**: `v10.x` (or newer)
- **Docker & Docker Compose**: For local PostgreSQL and Redis servers.

---

## 1. Environment Configuration

Copy the sample environment file and configure your credentials:
```bash
cp .env.example .env
```

Review and adjust the `.env` settings, such as ports, database options, and S3/Hetzner Object Storage configuration.

---

## 2. Running Postgres & Redis (Docker)

To start PostgreSQL and Redis locally with the ports and credentials defined in your `.env` file, run:

```bash
# Start containers in background
docker-compose up -d

# Stop containers
docker-compose down
```

*Note: The `docker-compose.yml` file is configured to dynamically read connection settings (ports, usernames, passwords) directly from your `.env` file.*

---

## 3. Database Initialization & Seeding

After launching the database container, initialize the schema and populate it with default values (Roles, Permissions, default System Admin, Active Ingredient Categories, and Warning Guides):

```bash
# Run seeder (drops existing schema if "--fresh-db" is passed, e.g. npm run db:seed -- --fresh-db)
npm run db:seed
```

---

## 4. Running the Applications

### Admin API (`admin-api`)

Runs by default on port `4000`.

```bash
# Development mode (watching changes)
npx nest start admin-api --watch

# Production mode
npx nest start admin-api
```

### Public API (`public-api`)

Runs by default on port `3000`.

```bash
# Development mode (watching changes)
npx nest start public-api --watch

# Production mode
npx nest start public-api
```

---

## Development Utilities

- **Code Formatting**: `npm run format`
- **Linting**: `npm run lint`
- **Unit/E2E Tests**: `npm run test:e2e`
