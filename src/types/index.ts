export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Department {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  issueCount?: number;
}

export interface Issue {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  status: 'received' | 'in_progress' | 'resolved' | 'rejected';
  departmentId: number | null;
  assignedBy: number | null;
  adminNotes: string | null;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userEmail?: string;
  departmentName?: string | null;
}

export interface Vote {
  id: number;
  issueId: number;
  userId: number;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  issueId: number | null;
  message: string;
  type: string | null;
  isRead: boolean;
  createdAt: string;
  issue?: {
    id: number;
    title: string;
    status: string;
  } | null;
}

export interface Stats {
  totalIssues: number;
  issuesByStatus: {
    received: number;
    in_progress: number;
    resolved: number;
    rejected: number;
  };
  issuesByCategory: { [key: string]: number };
  totalVotes: number;
  mostVotedIssue: {
    id: number;
    title: string;
    voteCount: number;
  } | null;
  recentIssues: Array<{
    id: number;
    title: string;
    status: string;
    createdAt: string;
  }>;
  resolutionRate: number;
  averageVotesPerIssue: number;
  issuesByDepartment: { [key: string]: number };
  issuesLast7Days: number;
  issuesLast30Days: number;
}
