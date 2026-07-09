import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { resetData } from './testSupport.js';

beforeEach(() => resetData());

describe('procurement approval API', () => {
  it('creates a purchase request through the HTTP API', async () => {
    const supplierResponse = await request(app).post('/suppliers').send({
      tenantId: 'tenant-a',
      name: 'Office Supplies Co',
      taxId: '44-555',
      actorId: 'admin-a'
    });

    await request(app).post('/budgets').send({
      tenantId: 'tenant-a',
      departmentId: 'ops',
      fiscalYear: 2026,
      totalCents: 500_000,
      actorId: 'finance-a'
    });

    const response = await request(app).post('/purchase-requests').send({
      tenantId: 'tenant-a',
      departmentId: 'ops',
      supplierId: supplierResponse.body.id,
      requesterId: 'requester-a',
      fiscalYear: 2026,
      items: [{ description: 'Chairs', quantity: 4, unitPriceCents: 75_000 }]
    });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('pending_approval');
    expect(response.body.totalCents).toBe(300_000);
  });

  it('lists tenant-scoped audit events', async () => {
    await request(app).post('/suppliers').send({
      tenantId: 'tenant-a',
      name: 'Audit Supplier',
      taxId: '77-111',
      actorId: 'admin-a'
    });
    await request(app).post('/suppliers').send({
      tenantId: 'tenant-b',
      name: 'Other Tenant Supplier',
      taxId: '77-222',
      actorId: 'admin-b'
    });

    const response = await request(app).get('/audit').query({ tenantId: 'tenant-a' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].tenantId).toBe('tenant-a');
    expect(response.body[0].action).toBe('supplier.created');
  });

  it('returns budget utilization report', async () => {
    const supplierResponse = await request(app).post('/suppliers').send({
      tenantId: 'tenant-a',
      name: 'Report Supplier',
      taxId: '55-333',
      actorId: 'admin-a'
    });
    await request(app).post('/budgets').send({
      tenantId: 'tenant-a',
      departmentId: 'it',
      fiscalYear: 2026,
      totalCents: 1_000_000,
      actorId: 'finance-a'
    });
    await request(app).post('/purchase-requests').send({
      tenantId: 'tenant-a',
      departmentId: 'it',
      supplierId: supplierResponse.body.id,
      requesterId: 'requester-a',
      fiscalYear: 2026,
      items: [{ description: 'Networking', quantity: 1, unitPriceCents: 300_000 }]
    });

    const response = await request(app).get('/reports/budget-utilization').query({ tenantId: 'tenant-a' });

    expect(response.status).toBe(200);
    expect(response.body[0]).toMatchObject({
      departmentId: 'it',
      reservedCents: 300_000,
      spentCents: 0,
      availableCents: 700_000
    });
  });

  it('maps validation errors to 400', async () => {
    const response = await request(app).post('/budgets').send({
      tenantId: 'tenant-a',
      departmentId: 'ops',
      fiscalYear: 2026,
      totalCents: -1,
      actorId: 'finance-a'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
  });
});
