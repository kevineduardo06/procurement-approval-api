export type PurchaseRequestStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface PurchaseRequestItem {
  description: string;
  quantity: number;
  unitPriceCents: number;
}

export interface ApprovalRecord {
  approverId: string;
  approvedAt: string;
}

export interface PurchaseRequest {
  id: string;
  tenantId: string;
  departmentId: string;
  supplierId: string;
  requesterId: string;
  fiscalYear: number;
  status: PurchaseRequestStatus;
  items: PurchaseRequestItem[];
  totalCents: number;
  requiredApprovals: number;
  approvals: ApprovalRecord[];
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}
