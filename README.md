# Mini Marketplace

Production-minded marketplace built with NestJS, React, PostgreSQL, Prisma, Redis and BullMQ.

## Scope

Customers can register/login, browse a cached catalog, manage a cart and checkout. Checkout uses transactional inventory reservation and an idempotency key. Orders are processed asynchronously. Admins manage products/categories/orders and can view date-range analytics and export CSV sales.

## Stack

- NestJS + TypeScript
- React + TypeScript + Redux Toolkit
- PostgreSQL + Prisma
- Redis + BullMQ
- JWT access tokens + hashed/revocable refresh sessions
- Swagger
- Docker Compose
- GitHub Actions

PostgreSQL is preferred because checkout needs ACID transactions, inventory is relational, and analytics/reporting are natural SQL workloads.

## Run locally

Copy `.env.example` to `.env`, replace the secrets, then:

```bash
docker compose up -d postgres redis
cd backend && npm ci && npx prisma migrate deploy && npm run start:dev
cd ../frontend && npm ci && npm run dev
```

Swagger: `http://localhost:3000/api/docs`  
Health: `http://localhost:3000/health`

## Docker

```bash
docker compose up --build
```

Frontend: `http://localhost:8080`  
Backend: `http://localhost:3000`

The backend container applies Prisma migrations before starting.

## Checkout correctness

For each cart item the backend performs an atomic conditional decrement:

```sql
UPDATE products
SET stock_quantity = stock_quantity - :qty
WHERE id = :product_id
  AND stock_quantity >= :qty;
```

The affected-row count must be one. All inventory changes, order creation, order-item snapshots and cart clearing are in one DB transaction. If any item fails, the transaction rolls back.

`POST /orders/checkout` requires an `Idempotency-Key`. A unique `(userId, key)` record maps retries to the existing order, so a network retry cannot create a duplicate order or consume stock twice.

Committed `NEW` orders are re-enqueued during startup. BullMQ jobs have deterministic IDs, retry/backoff settings, and the processor resumes from the current order state, making retries safe.

## Cache

Catalog list keys are SHA-256 hashes of the normalized query object and detail keys are `products:item:<id>`. Product/category mutations invalidate relevant keys. Cache failures are logged and do not turn a catalog read into corrupted business data.

## Security

Access JWTs use `JWT_ACCESS_SECRET` and short expiry. Refresh tokens are random opaque values and only hashes are stored. Refresh sessions are rotated/revocable. Admin APIs enforce backend role guards. Authentication endpoints are rate-limited. Secrets must come from environment variables.

## Analytics

`GET /admin/analytics/summary`, `/daily`, `/top-products`, and CSV export accept optional ISO `from` and `to` parameters. Cancelled orders are excluded from sales. Money aggregation stays in Prisma Decimal arithmetic until serialization. CSV values are quoted/escaped safely.

## Quality gates

```bash
cd backend
npm run lint
npm run build
npm test -- --runInBand

cd ../frontend
npm run lint
npm run build
```

CI runs these checks on push and pull request with PostgreSQL and Redis service containers.

## What Could Be Improved

Due to project scope and time constraints, the following could be improved:

More comprehensive unit and E2E test coverage.
More detailed Swagger documentation and API examples.
More advanced frontend loading and error states.
Production monitoring and centralized logging.
More complete CI/CD with automatic deployment.
More robust payment integration and webhook handling.
