export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'Admin' | 'Employee';
};

export type Employee = {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    avatarUrl: string;
};

export type Comment = {
  id: string;
  user: Pick<User, 'name' | 'avatarUrl'>;
  text: string;
  timestamp: string;
}

export type Bulletin = {
  id: string;
  author: Pick<User, 'name' | 'avatarUrl'>;
  category: 'Organization' | 'Employee';
  title: string;
  content: string;
  imageUrl?: string;
  link?: {
    url: string,
    text: string
  };
  likes: number;
  likedBy: string[];
  viewers: number;
  comments: Comment[];
  createdAt: string;
  scheduledFor?: string;
  endDate?: string;
};

export type Grievance = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatarUrl: string;
  subject: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  createdAt: string;
  resolvedAt?: string;
};
