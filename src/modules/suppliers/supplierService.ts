import { conflict } from '../../shared/errors.js';
import { auditRepository } from '../audit/auditRepository.js';
import { supplierRepository } from './supplierRepository.js';
import type { Supplier } from './supplierTypes.js';

export const supplierService = {
  createSupplier(input: {
    tenantId: string;
    name: string;
    taxId: string;
    actorId: string;
    status?: 'active' | 'blocked';
  }): Supplier {
    const duplicated = supplierRepository
      .listByTenant(input.tenantId)
      .some((supplier) => supplier.taxId === input.taxId);
    if (duplicated) {
      throw conflict('Supplier tax id already exists for tenant');
    }
    const supplier = supplierRepository.create(input);
    auditRepository.record({
      tenantId: input.tenantId,
      action: 'supplier.created',
      actorId: input.actorId,
      entityId: supplier.id,
      metadata: { taxId: input.taxId }
    });
    return supplier;
  }
};
