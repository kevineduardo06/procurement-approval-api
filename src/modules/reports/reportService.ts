import { budgetRepository } from '../budgets/budgetRepository.js';
import { purchaseRequestRepository } from '../purchaseRequests/purchaseRequestRepository.js';

export const reportService = {
  budgetUtilization(tenantId: string) {
    const budgets = budgetRepository.listByTenant(tenantId);
    return budgets.map((budget) => ({
      departmentId: budget.departmentId,
      fiscalYear: budget.fiscalYear,
      totalCents: budget.totalCents,
      reservedCents: budget.reservedCents,
      spentCents: budget.spentCents,
      availableCents: budget.totalCents - budget.reservedCents - budget.spentCents
    }));
  },

  approvalSummary(tenantId: string) {
    const requests = purchaseRequestRepository.list({ tenantId });
    return requests.reduce(
      (summary, request) => {
        summary.total += 1;
        summary.byStatus[request.status] = (summary.byStatus[request.status] ?? 0) + 1;
        summary.totalAmountCents += request.totalCents;
        return summary;
      },
      { total: 0, totalAmountCents: 0, byStatus: {} as Record<string, number> }
    );
  }
};
