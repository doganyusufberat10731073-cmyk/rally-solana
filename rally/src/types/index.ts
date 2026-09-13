export type Category = 'Gaming' | 'Sports' | 'Development' | 'Learning' | 'Creative' | 'Social' | 'Other';

export interface User {
  id: string;
  username: string;
  walletAddress: string;
  reputation: number;
  activitiesCompleted: number;
  attendanceRate: number;
  peopleMet: number;
  bio: string;
  avatarUrl?: string;
  badges: string[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: Category;
  location: string;
  date: string;
  time: string;
  duration: string;
  creatorId: string;
  participants: string[]; // User IDs
  maxParticipants: number;
  requirements: string[];
  status: 'Open' | 'Full' | 'Completed' | 'Cancelled';
  isOnline: boolean;
  createdAt: string;
  creator?: User;
  participantUsers?: User[];
  isJoined?: boolean;
  isCreator?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  read: boolean;
}
