import { beforeEach, describe, expect, it } from 'vitest';
import { budgetRepository } from '../src/modules/budgets/budgetRepository.js';
import { budgetService } from '../src/modules/budgets/budgetService.js';
import { purchaseRequestService } from '../src/modules/purchaseRequests/purchaseRequestService.js';
import { supplierService } from '../src/modules/suppliers/supplierService.js';
import { resetData } from './testSupport.js';

function setup() {
  const supplier = supplierService.createSupplier({
    tenantId: 'tenant-a',
    name: 'Acme Supplies',
    taxId: '11-222',
    actorId: 'admin-a'
  });
  budgetService.createBudget({
    tenantId: 'tenant-a',
    departmentId: 'ops',
    fiscalYear: 2026,
    totalCents: 2_000_000,
    actorId: 'finance-a'
  });
  return { supplier };
}

beforeEach(() => resetData());

describe('purchaseRequestService', () => {
  it('auto-approves low-value requests and spends budget immediately', () => {
    const { supplier } = setup();

    const request = purchaseRequestService.create({
      tenantId: 'tenant-a',
      departmentId: 'ops',
      supplierId: supplier.id,
      requesterId: 'user-a',
      fiscalYear: 2026,
      items: [{ description: 'Keyboard', quantity: 2, unitPriceCents: 20_000 }]
    });

    const budget = budgetRepository.findForDepartment('tenant-a', 'ops', 2026);
    expect(request.status).toBe('approved');
    expect(request.requiredApprovals).toBe(0);
    expect(budget?.reservedCents).toBe(0);
    expect(budget?.spentCents).toBe(40_000);
  });

  it('reserves budget for requests that need approval', () => {
    const { supplier } = setup();

    const request = purchaseRequestService.create({
      tenantId: 'tenant-a',
      departmentId: 'ops',
      supplierId: supplier.id,
      requesterId: 'user-a',
      fiscalYear: 2026,
      items: [{ description: 'Laptops', quantity: 3, unitPriceCents: 100_000 }]
    });

    const budget = budgetRepository.findForDepartment('tenant-a', 'ops', 2026);
    expect(request.status).toBe('pending_approval');
    expect(request.requiredApprovals).toBe(1);
    expect(budget?.reservedCents).toBe(300_000);
    expect(budget?.spentCents).toBe(0);
  });

  it('requires two approvals for high-value requests before spending budget', () => {
    const { supplier } = setup();
    const request = purchaseRequestService.create({
      tenantId: 'tenant-a',
      departmentId: 'ops',
      supplierId: supplier.id,
      requesterId: 'user-a',
      fiscalYear: 2026,
      items: [{ description: 'Servers', quantity: 2, unitPriceCents: 600_000 }]
    });

    const firstApproval = purchaseRequestService.approve({
      requestId: request.id,
      tenantId: 'tenant-a',
      approverId: 'manager-a'
    });
    let budget = budgetRepository.findForDepartment('tenant-a', 'ops', 2026);
    expect(firstApproval.status).toBe('pending_approval');
    expect(budget?.reservedCents).toBe(1_200_000);
    expect(budget?.spentCents).toBe(0);

    const secondApproval = purchaseRequestService.approve({
      requestId: request.id,
      tenantId: 'tenant-a',
      approverId: 'director-a'
    });
    budget = budgetRepository.findForDepartment('tenant-a', 'ops', 2026);
    expect(secondApproval.status).toBe('approved');
    expect(budget?.reservedCents).toBe(0);
    expect(budget?.spentCents).toBe(1_200_000);
  });

  it('rejects self-approval', () => {
    const { supplier } = setup();
    const request = purchaseRequestService.create({
      tenantId: 'tenant-a',
      departmentId: 'ops',
      supplierId: supplier.id,
      requesterId: 'user-a',
      fiscalYear: 2026,
      items: [{ description: 'Monitors', quantity: 5, unitPriceCents: 60_000 }]
    });

    expect(() =>
      purchaseRequestService.approve({ requestId: request.id, tenantId: 'tenant-a', approverId: 'user-a' })
    ).toThrow('Requester cannot approve their own request');
  });

  it('releases reserved budget when a pending request is rejected', () => {
    const { supplier } = setup();
    const request = purchaseRequestService.create({
      tenantId: 'tenant-a',
      departmentId: 'ops',
      supplierId: supplier.id,
      requesterId: 'user-a',
      fiscalYear: 2026,
      items: [{ description: 'Desks', quantity: 10, unitPriceCents: 30_000 }]
    });

    purchaseRequestService.reject({
      requestId: request.id,
      tenantId: 'tenant-a',
      actorId: 'manager-a',
      reason: 'Need cheaper quote'
    });

    const budget = budgetRepository.findForDepartment('tenant-a', 'ops', 2026);
    expect(budget?.reservedCents).toBe(0);
    expect(budget?.spentCents).toBe(0);
  });

  it('does not allow blocked suppliers on new purchase requests', () => {
    const supplier = supplierService.createSupplier({
      tenantId: 'tenant-a',
      name: 'Blocked Supplier',
      taxId: '99-888',
      actorId: 'admin-a',
      status: 'blocked'
    });
    budgetService.createBudget({
      tenantId: 'tenant-a',
      departmentId: 'ops',
      fiscalYear: 2026,
      totalCents: 2_000_000,
      actorId: 'finance-a'
    });

    expect(() =>
      purchaseRequestService.create({
        tenantId: 'tenant-a',
        departmentId: 'ops',
        supplierId: supplier.id,
        requesterId: 'user-a',
        fiscalYear: 2026,
        items: [{ description: 'Service', quantity: 1, unitPriceCents: 300_000 }]
      })
    ).toThrow('Blocked supplier cannot receive purchase requests');
  });
});
