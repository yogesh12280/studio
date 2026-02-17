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

export type Comment = {
  id: string;
  user: Pick<User, 'name' | 'avatarUrl'>;
  text: string;
  timestamp: string;
  replies?: Comment[];
}

export type ProjectUtilization = {
  projectId: string;
  projectName: string;
  utilizedBy: {
    id: string;
    name: string;
  };
};

export type ReusableComponent = {
  id: string;
  technology: 'Web' | 'PC' | 'AI' | 'QC';
  name: string;
  description: string;
  registeredBy: Pick<User, 'name' | 'avatarUrl'>;
  utilizationByProjects: ProjectUtilization[];
  originProject: string;
  benefit: string;
  bitBucketUrl?: string;
  registeredDate: string;
  likes: number;
  likedBy: string[];
  viewers: number;
  viewedBy: string[];
  comments: Comment[];
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
};
