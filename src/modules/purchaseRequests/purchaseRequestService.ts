import { badRequest, conflict, forbidden, notFound } from '../../shared/errors.js';
import { auditRepository } from '../audit/auditRepository.js';
import { requiredApprovalsForAmount } from '../approvals/approvalPolicy.js';
import { budgetService } from '../budgets/budgetService.js';
import { supplierRepository } from '../suppliers/supplierRepository.js';
import { purchaseRequestRepository } from './purchaseRequestRepository.js';
import type { PurchaseRequest, PurchaseRequestItem, PurchaseRequestStatus } from './purchaseRequestTypes.js';

function calculateTotal(items: PurchaseRequestItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0);
}

function assertValidItems(items: PurchaseRequestItem[]): void {
  if (items.length === 0) throw badRequest('At least one item is required');
  for (const item of items) {
    if (item.quantity <= 0) throw badRequest('Item quantity must be greater than zero');
    if (item.unitPriceCents <= 0) throw badRequest('Item price must be greater than zero');
  }
}

export const purchaseRequestService = {
  create(input: {
    tenantId: string;
    departmentId: string;
    supplierId: string;
    requesterId: string;
    fiscalYear: number;
    items: PurchaseRequestItem[];
  }): PurchaseRequest {
    assertValidItems(input.items);
    const supplier = supplierRepository.findById(input.supplierId);
    if (!supplier || supplier.tenantId !== input.tenantId) throw notFound('Supplier');
    if (supplier.status === 'blocked') throw conflict('Blocked supplier cannot receive purchase requests');

    const totalCents = calculateTotal(input.items);
    const requiredApprovals = requiredApprovalsForAmount(totalCents);
    const initialStatus: PurchaseRequestStatus = requiredApprovals === 0 ? 'approved' : 'pending_approval';

    if (initialStatus === 'pending_approval') {
      budgetService.reserve(input.tenantId, input.departmentId, input.fiscalYear, totalCents);
    } else {
      budgetService.reserve(input.tenantId, input.departmentId, input.fiscalYear, totalCents);
      budgetService.spendReserved(input.tenantId, input.departmentId, input.fiscalYear, totalCents);
    }

    const request = purchaseRequestRepository.create({
      tenantId: input.tenantId,
      departmentId: input.departmentId,
      supplierId: input.supplierId,
      requesterId: input.requesterId,
      fiscalYear: input.fiscalYear,
      status: initialStatus,
      items: input.items,
      totalCents,
      requiredApprovals,
      approvals: []
    });

    auditRepository.record({
      tenantId: input.tenantId,
      action: 'purchase_request.created',
      actorId: input.requesterId,
      entityId: request.id,
      metadata: { totalCents, status: request.status }
    });
    return request;
  },

  approve(input: { requestId: string; tenantId: string; approverId: string }): PurchaseRequest {
    const request = purchaseRequestRepository.findById(input.requestId);
    if (!request || request.tenantId !== input.tenantId) throw notFound('Purchase request');
    if (request.status !== 'pending_approval') throw conflict('Only pending requests can be approved');
    if (request.requesterId === input.approverId) throw forbidden('Requester cannot approve their own request');
    if (request.approvals.some((approval) => approval.approverId === input.approverId)) {
      throw conflict('Approver already approved this request');
    }

    const approvals = [...request.approvals, { approverId: input.approverId, approvedAt: new Date().toISOString() }];
    const status = approvals.length >= request.requiredApprovals ? 'approved' : 'pending_approval';
    const updated = purchaseRequestRepository.save({ ...request, approvals, status });

    if (status === 'approved') {
      budgetService.spendReserved(request.tenantId, request.departmentId, request.fiscalYear, request.totalCents);
    }

    auditRepository.record({
      tenantId: input.tenantId,
      action: 'purchase_request.approved',
      actorId: input.approverId,
      entityId: request.id,
      metadata: { approvalCount: approvals.length, requiredApprovals: request.requiredApprovals, status }
    });
    return updated;
  },

  reject(input: { requestId: string; tenantId: string; actorId: string; reason: string }): PurchaseRequest {
    const request = purchaseRequestRepository.findById(input.requestId);
    if (!request || request.tenantId !== input.tenantId) throw notFound('Purchase request');
    if (request.status !== 'pending_approval') throw conflict('Only pending requests can be rejected');

    budgetService.release(request.tenantId, request.departmentId, request.fiscalYear, request.totalCents);
    const updated = purchaseRequestRepository.save({ ...request, status: 'rejected', rejectionReason: input.reason });
    auditRepository.record({
      tenantId: input.tenantId,
      action: 'purchase_request.rejected',
      actorId: input.actorId,
      entityId: request.id,
      metadata: { reason: input.reason }
    });
    return updated;
  },

  cancel(input: { requestId: string; tenantId: string; actorId: string }): PurchaseRequest {
    const request = purchaseRequestRepository.findById(input.requestId);
    if (!request || request.tenantId !== input.tenantId) throw notFound('Purchase request');
    if (!['draft', 'pending_approval'].includes(request.status)) {
      throw conflict('Only draft or pending requests can be cancelled');
    }
    if (request.status === 'pending_approval') {
      budgetService.release(request.tenantId, request.departmentId, request.fiscalYear, request.totalCents);
    }
    const updated = purchaseRequestRepository.save({ ...request, status: 'cancelled' });
    auditRepository.record({
      tenantId: input.tenantId,
      action: 'purchase_request.cancelled',
      actorId: input.actorId,
      entityId: request.id
    });
    return updated;
  },

  list(filters: { tenantId: string; status?: PurchaseRequestStatus; departmentId?: string }): PurchaseRequest[] {
    return purchaseRequestRepository
      .list(filters)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
  },

  getById(id: string, tenantId: string): PurchaseRequest {
    const request = purchaseRequestRepository.findById(id);
    if (!request || request.tenantId !== tenantId) throw notFound('Purchase request');
    return request;
  }
};
