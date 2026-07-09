import { createId } from '../../shared/id.js';
import type { PurchaseRequest, PurchaseRequestStatus } from './purchaseRequestTypes.js';

const requests: PurchaseRequest[] = [];

export const purchaseRequestRepository = {
  create(input: Omit<PurchaseRequest, 'id' | 'createdAt' | 'updatedAt'>): PurchaseRequest {
    const now = new Date().toISOString();
    const request: PurchaseRequest = {
      ...input,
      id: createId('pr'),
      createdAt: now,
      updatedAt: now
    };
    requests.push(request);
    return request;
  },

  findById(id: string): PurchaseRequest | undefined {
    return requests.find((request) => request.id === id);
  },

  save(updated: PurchaseRequest): PurchaseRequest {
    const index = requests.findIndex((request) => request.id === updated.id);
    const withTimestamp = { ...updated, updatedAt: new Date().toISOString() };
    if (index >= 0) {
      requests[index] = withTimestamp;
    }
    return withTimestamp;
  },

  list(filters: { tenantId: string; status?: PurchaseRequestStatus; departmentId?: string }): PurchaseRequest[] {
    return requests.filter((request) => {
      if (request.tenantId !== filters.tenantId) return false;
      if (filters.status && request.status !== filters.status) return false;
      if (filters.departmentId && request.departmentId !== filters.departmentId) return false;
      return true;
    });
  },

  clear(): void {
    requests.length = 0;
  }
};
