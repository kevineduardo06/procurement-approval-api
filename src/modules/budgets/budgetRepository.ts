import { createId } from '../../shared/id.js';
import type { DepartmentBudget } from './budgetTypes.js';

const budgets: DepartmentBudget[] = [];

export const budgetRepository = {
  create(input: { tenantId: string; departmentId: string; fiscalYear: number; totalCents: number }): DepartmentBudget {
    const budget: DepartmentBudget = {
      id: createId('bud'),
      tenantId: input.tenantId,
      departmentId: input.departmentId,
      fiscalYear: input.fiscalYear,
      totalCents: input.totalCents,
      reservedCents: 0,
      spentCents: 0
    };
    budgets.push(budget);
    return budget;
  },

  findForDepartment(tenantId: string, departmentId: string, fiscalYear: number): DepartmentBudget | undefined {
    return budgets.find(
      (budget) =>
        budget.tenantId === tenantId &&
        budget.departmentId === departmentId &&
        budget.fiscalYear === fiscalYear
    );
  },

  save(updated: DepartmentBudget): DepartmentBudget {
    const index = budgets.findIndex((budget) => budget.id === updated.id);
    if (index >= 0) {
      budgets[index] = updated;
    }
    return updated;
  },

  listByTenant(tenantId: string): DepartmentBudget[] {
    return budgets.filter((budget) => budget.tenantId === tenantId);
  },

  clear(): void {
    budgets.length = 0;
  }
};
