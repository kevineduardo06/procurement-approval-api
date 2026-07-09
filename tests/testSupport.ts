import { resetIds } from '../src/shared/id.js';
import { auditRepository } from '../src/modules/audit/auditRepository.js';
import { budgetRepository } from '../src/modules/budgets/budgetRepository.js';
import { purchaseRequestRepository } from '../src/modules/purchaseRequests/purchaseRequestRepository.js';
import { supplierRepository } from '../src/modules/suppliers/supplierRepository.js';

export function resetData(): void {
  resetIds();
  auditRepository.clear();
  budgetRepository.clear();
  purchaseRequestRepository.clear();
  supplierRepository.clear();
}
