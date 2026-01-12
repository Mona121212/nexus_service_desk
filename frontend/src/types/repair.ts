export interface RepairRequest {
  id: string;
  title: string;
  description: string;
  status: string; // Pending / Approved / Rejected / Completed
    approvalStatus: string; // Pending / Quoted / Approved / Rejected
    isCancelled: boolean;
  createdTime: string; // ISO format timestamp
  teacherId?: string;
  electricianQuote?: number; // Quote amount
  adminNote?: string;
}

export type RepairRequestList = RepairRequest[];
