import cors from 'cors';
import express, { type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './shared/errors.js';
import { auditRepository } from './modules/audit/auditRepository.js';
import { budgetService } from './modules/budgets/budgetService.js';
import { purchaseRequestService } from './modules/purchaseRequests/purchaseRequestService.js';
import { supplierService } from './modules/suppliers/supplierService.js';
import { reportService } from './modules/reports/reportService.js';
import type { PurchaseRequestStatus } from './modules/purchaseRequests/purchaseRequestTypes.js';

const app = express();

app.use(cors());
app.use(express.json());

const supplierSchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1),
  taxId: z.string().min(1),
  actorId: z.string().min(1),
  status: z.enum(['active', 'blocked']).optional()
});

const budgetSchema = z.object({
  tenantId: z.string().min(1),
  departmentId: z.string().min(1),
  fiscalYear: z.number().int(),
  totalCents: z.number().int().positive(),
  actorId: z.string().min(1)
});

const purchaseRequestSchema = z.object({
  tenantId: z.string().min(1),
  departmentId: z.string().min(1),
  supplierId: z.string().min(1),
  requesterId: z.string().min(1),
  fiscalYear: z.number().int(),
  items: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPriceCents: z.number().int().positive()
    })
  ).min(1)
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/suppliers', (req, res) => {
  const input = supplierSchema.parse(req.body);
  res.status(201).json(supplierService.createSupplier(input));
});

app.post('/budgets', (req, res) => {
  const input = budgetSchema.parse(req.body);
  res.status(201).json(budgetService.createBudget(input));
});

app.post('/purchase-requests', (req, res) => {
  const input = purchaseRequestSchema.parse(req.body);
  res.status(201).json(purchaseRequestService.create(input));
});

app.get('/purchase-requests', (req, res) => {
  const tenantId = String(req.query.tenantId ?? '');
  const status = req.query.status ? String(req.query.status) as PurchaseRequestStatus : undefined;
  const departmentId = req.query.departmentId ? String(req.query.departmentId) : undefined;
  res.json(purchaseRequestService.list({ tenantId, status, departmentId }));
});

app.get('/purchase-requests/:id', (req, res) => {
  const tenantId = String(req.query.tenantId ?? '');
  res.json(purchaseRequestService.getById(req.params.id, tenantId));
});

app.post('/purchase-requests/:id/approve', (req, res) => {
  const schema = z.object({ tenantId: z.string().min(1), approverId: z.string().min(1) });
  const input = schema.parse(req.body);
  res.json(purchaseRequestService.approve({ requestId: req.params.id, ...input }));
});

app.post('/purchase-requests/:id/reject', (req, res) => {
  const schema = z.object({ tenantId: z.string().min(1), actorId: z.string().min(1), reason: z.string().min(1) });
  const input = schema.parse(req.body);
  res.json(purchaseRequestService.reject({ requestId: req.params.id, ...input }));
});

app.post('/purchase-requests/:id/cancel', (req, res) => {
  const schema = z.object({ tenantId: z.string().min(1), actorId: z.string().min(1) });
  const input = schema.parse(req.body);
  res.json(purchaseRequestService.cancel({ requestId: req.params.id, ...input }));
});

app.get('/reports/budget-utilization', (req, res) => {
  res.json(reportService.budgetUtilization(String(req.query.tenantId ?? '')));
});

app.get('/reports/approval-summary', (req, res) => {
  res.json(reportService.approvalSummary(String(req.query.tenantId ?? '')));
});

app.get('/audit', (req, res) => {
  res.json(auditRepository.listByTenant(String(req.query.tenantId ?? '')));
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({ message: 'Validation failed', issues: err.issues });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
