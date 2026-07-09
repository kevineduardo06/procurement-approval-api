export type SupplierStatus = 'active' | 'blocked';

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  taxId: string;
  status: SupplierStatus;
  createdAt: string;
}
