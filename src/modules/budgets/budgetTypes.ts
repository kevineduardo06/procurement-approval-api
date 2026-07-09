export interface DepartmentBudget {
  id: string;
  tenantId: string;
  departmentId: string;
  fiscalYear: number;
  totalCents: number;
  reservedCents: number;
  spentCents: number;
}
