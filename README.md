# Procurement Approval API

Personal TypeScript and Express REST API for experimenting with procurement workflows and extending a modular business application.

## Purpose and current scope

The API models supplier registration, tenant/department budgets, purchase requests, approval decisions, audit records, and budget/approval reports. It is currently a local development project, not a deployed procurement product. It does not claim production users or integrations.

Business rules include tenant-scoped suppliers and budgets, reserving funds on submission, releasing reservations on rejection/cancellation, and consuming budget after approval. Approval requirements vary with request amount.

## Stack and structure

- Node.js, TypeScript, Express, Zod
- Vitest and Supertest for automated tests
- `src/app.ts`: HTTP endpoints and request handling
- `src/modules/`: suppliers, budgets, purchase requests, approvals, audit, reports
- `src/shared/`: shared errors and identifiers
- In-memory repositories (all state is lost when the process stops)

## Run locally

Requires a recent supported Node.js and npm installation.

```bash
npm ci
npm test
npm run build
npm run dev
```

`npm run build` currently performs TypeScript checking (`tsc --noEmit`); it does not produce a deployable `dist/` folder. The dev command runs `src/server.ts` directly using `tsx`.

## API endpoints

- `GET /health`
- `POST /suppliers`
- `POST /budgets`
- `POST /purchase-requests`
- `GET /purchase-requests` and `GET /purchase-requests/:id`
- `POST /purchase-requests/:id/approve`
- `POST /purchase-requests/:id/reject`
- `POST /purchase-requests/:id/cancel`
- `GET /reports/budget-utilization`
- `GET /reports/approval-summary`
- `GET /audit`

Consult `src/app.ts` and `tests/` for current request shapes and behavior. The project has no authentication or durable database yet; do not expose it to untrusted traffic or use it with real procurement or financial records.

## Future development

See [ROADMAP.md](ROADMAP.md) for proposed improvements. Roadmap items are plans, not implemented features, and should only be pursued if they remain useful to the project.

## Ownership and license

This repository is a personal development project. See [LICENSE](LICENSE) for the MIT license; the owner should confirm they hold rights to all included source material before publishing under this license.
