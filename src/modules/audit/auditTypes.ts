export type AuditAction =
  | 'supplier.created'
  | 'budget.created'
  | 'purchase_request.created'
  | 'purchase_request.approved'
  | 'purchase_request.rejected'
  | 'purchase_request.cancelled';

export interface AuditEvent {
  id: string;
  tenantId: string;
  action: AuditAction;
  actorId: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}
