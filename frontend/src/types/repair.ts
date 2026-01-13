export interface RepairRequest {
  id: string;
  title: string;
  description: string;
  building: string;
  room: string;
  status: string; // Pending / Approved / Rejected / Completed
  approvalStatus: string; // Pending / Quoted / Approved / Rejected
  isCancelled: boolean;
  submittedAt?: string; // ISO format timestamp - business field
  creationTime?: string; // ISO format timestamp - ABP audit field
  createdTime?: string; // ISO format timestamp - legacy field name
  teacherId?: string;
  electricianQuote?: number; // Quote amount (QuotedAmount from backend)
  electricianNote?: string; // Electrician note
  requestNo?: string; // Request number
  adminNote?: string;
  cancelledReason?: string; // Cancellation reason
  cancelledAt?: string; // ISO format timestamp when cancelled
}

export type RepairRequestList = RepairRequest[];
