# Procurement Approval API

A small but realistic TypeScript/Express API for procurement workflows. It models suppliers, budgets, purchase requests, approval policies, audit logs, and reporting.

The project is intentionally lightweight: data is stored in memory so tests run quickly, while the code remains modular enough for realistic engineering tasks.

## Domain

- Suppliers belong to a tenant and can be active or blocked.
- Budgets are tracked by tenant and department.
- Purchase requests reserve budget when submitted.
- Approval requirements depend on request amount.
- Rejections and cancellations release reserved budget.
- Approved requests consume reserved budget.
- Audit logs capture important workflow events.

## Commands

```bash
npm install
npm test
npm run build
npm run dev
```

## API Examples

```bash
POST /purchase-requests
GET /purchase-requests?tenantId=tenant-a&status=pending_approval
POST /purchase-requests/:id/approve
POST /purchase-requests/:id/reject
POST /purchase-requests/:id/cancel
GET /reports/budget-utilization?tenantId=tenant-a
GET /audit?tenantId=tenant-a
```

## Good Task Ideas

- Fix budget release when rejected requests are later cancelled.
- Prevent approvals from users outside the request tenant.
- Add multi-step approval policies for high-value requests.
- Refactor approval threshold logic into a policy service.
- Add stable sorting and pagination to purchase request listing.
- Ensure blocked suppliers cannot be used when updating existing draft requests.
