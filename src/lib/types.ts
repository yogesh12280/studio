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

export type GrievanceComment = {
  id: string;
  text: string;
  user: Pick<User, 'name' | 'avatarUrl'>;
  author: Pick<User, 'name' | 'avatarUrl'>; // for backwards compatibility
  createdAt: string;
  status?: Grievance['status'];
  parentId?: string;
  replies?: GrievanceComment[];
}

export type Grievance = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatarUrl: string;
  subject: string;
  description: string;
  status: 'Initiated' | 'In Progress' | 'Resolved';
  createdAt: string;
  resolvedAt?: string;
  comments?: GrievanceComment[];
};

export type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  author: Pick<User, 'name' | 'avatarUrl'>;
  category: 'Organization' | 'Employee';
  createdAt: string;
  endDate?: string;
  votedBy: string[];
};

export type Suggestion = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatarUrl: string;
  title: string;
  description: string;
  createdAt: string;
  upvotes: number;
  upvotedBy: string[];
  comments: Comment[];
};

export type Appreciation = {
  id: string;
  fromUser: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  toUser: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  message: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
};

export type Notification = {
    id: string;
    author: {
        name: string;
        avatarUrl: string;
    };
    category: 'Organization' | 'Employee';
    title: string;
    content: string;
    imageUrl?: string;
    link?: {
        url: string;
        text: string;
    };
    likes: number;
    likedBy: string[];
    viewers: number;
    viewedBy: string[];
    comments: Comment[];
    createdAt: string;
    scheduledFor?: string;
    endDate?: string;
};

export type ReusableComponent = {
  id: string;
  technology: 'Web' | 'PC' | 'AI' | 'QC';
  name: string;
  description: string;
  registeredBy: Pick<User, 'name' | 'avatarUrl'>;
  utilizationByProjects: string[];
  originProject: string;
  benefit: string;
  registeredDate: string;
  likes: number;
  likedBy: string[];
  viewers: number;
  viewedBy: string[];
  comments: Comment[];
};
    
