import { createId } from '../../shared/id.js';
import type { AuditAction, AuditEvent } from './auditTypes.js';

const events: AuditEvent[] = [];

export const auditRepository = {
  record(input: {
    tenantId: string;
    action: AuditAction;
    actorId: string;
    entityId: string;
    metadata?: Record<string, unknown>;
  }): AuditEvent {
    const event: AuditEvent = {
      id: createId('aud'),
      tenantId: input.tenantId,
      action: input.action,
      actorId: input.actorId,
      entityId: input.entityId,
      metadata: input.metadata ?? {},
      createdAt: new Date().toISOString()
    };
    events.push(event);
    return event;
  },

  listByTenant(tenantId: string): AuditEvent[] {
    return events.filter((event) => event.tenantId === tenantId);
  },

  clear(): void {
    events.length = 0;
  }
};
