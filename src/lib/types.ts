export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'Admin' | 'Employee';
  birthdate: string;
};

export type Employee = {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    avatarUrl: string;
    birthdate: string;
};

export type ReimbursementStatus = 'Pending' | 'Approved' | 'Rejected';

export type Reimbursement = {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  amount: number;
  billDate: string;
  description: string;
  receiptUrl?: string;
  status: ReimbursementStatus;
  submittedAt: string;
  paidAt?: string;
  transactionId?: string;
  remarks?: string;
};
