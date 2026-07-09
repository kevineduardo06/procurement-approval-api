import { badRequest, conflict, notFound } from '../../shared/errors.js';
import { auditRepository } from '../audit/auditRepository.js';
import { budgetRepository } from './budgetRepository.js';
import type { DepartmentBudget } from './budgetTypes.js';

export const budgetService = {
  createBudget(input: {
    tenantId: string;
    departmentId: string;
    fiscalYear: number;
    totalCents: number;
    actorId: string;
  }): DepartmentBudget {
    if (input.totalCents <= 0) {
      throw badRequest('Budget total must be greater than zero');
    }
    const existing = budgetRepository.findForDepartment(input.tenantId, input.departmentId, input.fiscalYear);
    if (existing) {
      throw conflict('Budget already exists for department and fiscal year');
    }
    const budget = budgetRepository.create(input);
    auditRepository.record({
      tenantId: input.tenantId,
      action: 'budget.created',
      actorId: input.actorId,
      entityId: budget.id,
      metadata: { departmentId: input.departmentId, fiscalYear: input.fiscalYear }
    });
    return budget;
  },

  reserve(tenantId: string, departmentId: string, fiscalYear: number, amountCents: number): DepartmentBudget {
    const budget = budgetRepository.findForDepartment(tenantId, departmentId, fiscalYear);
    if (!budget) throw notFound('Budget');
    const available = budget.totalCents - budget.reservedCents - budget.spentCents;
    if (available < amountCents) {
      throw conflict('Insufficient available budget');
    }
    return budgetRepository.save({ ...budget, reservedCents: budget.reservedCents + amountCents });
  },

  release(tenantId: string, departmentId: string, fiscalYear: number, amountCents: number): DepartmentBudget {
    const budget = budgetRepository.findForDepartment(tenantId, departmentId, fiscalYear);
    if (!budget) throw notFound('Budget');
    return budgetRepository.save({ ...budget, reservedCents: Math.max(0, budget.reservedCents - amountCents) });
  },

  spendReserved(tenantId: string, departmentId: string, fiscalYear: number, amountCents: number): DepartmentBudget {
    const budget = budgetRepository.findForDepartment(tenantId, departmentId, fiscalYear);
    if (!budget) throw notFound('Budget');
    if (budget.reservedCents < amountCents) {
      throw conflict('Cannot spend more than reserved budget');
    }
    return budgetRepository.save({
      ...budget,
      reservedCents: budget.reservedCents - amountCents,
      spentCents: budget.spentCents + amountCents
    });
  }
};
