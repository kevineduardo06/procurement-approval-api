import { createId } from '../../shared/id.js';
import type { Supplier, SupplierStatus } from './supplierTypes.js';

const suppliers: Supplier[] = [];

export const supplierRepository = {
  create(input: { tenantId: string; name: string; taxId: string; status?: SupplierStatus }): Supplier {
    const supplier: Supplier = {
      id: createId('sup'),
      tenantId: input.tenantId,
      name: input.name,
      taxId: input.taxId,
      status: input.status ?? 'active',
      createdAt: new Date().toISOString()
    };
    suppliers.push(supplier);
    return supplier;
  },

  findById(id: string): Supplier | undefined {
    return suppliers.find((supplier) => supplier.id === id);
  },

  listByTenant(tenantId: string): Supplier[] {
    return suppliers.filter((supplier) => supplier.tenantId === tenantId);
  },

  clear(): void {
    suppliers.length = 0;
  }
};
