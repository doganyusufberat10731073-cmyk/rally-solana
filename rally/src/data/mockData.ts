import type { Activity, User } from '@/types';

export const mockUsers: Record<string, User> = {
  'u1': {
    id: 'u1',
    username: 'alex',
    walletAddress: '7xK...92Qa',
    reputation: 4.8,
    activitiesCompleted: 27,
    attendanceRate: 96,
    peopleMet: 54,
    bio: 'Builder, gamer, and always down for something.',
    badges: ['Reliable', 'Active', 'Team Player', 'Builder']
  },
  'u2': {
    id: 'u2',
    username: 'sarah_dev',
    walletAddress: '3mB...81Xx',
    reputation: 5.0,
    activitiesCompleted: 12,
    attendanceRate: 100,
    peopleMet: 22,
    bio: 'Rust engineer. Building the future on Solana.',
    badges: ['Builder', 'Reliable']
  },
  'u3': {
    id: 'u3',
    username: 'johndoe',
    walletAddress: '9pP...44Zc',
    reputation: 4.2,
    activitiesCompleted: 5,
    attendanceRate: 80,
    peopleMet: 12,
    bio: 'Just here for some good games.',
    badges: ['Active']
  },
  'u4': {
    id: 'u4',
    username: 'mike',
    walletAddress: '1aA...22Bb',
    reputation: 4.9,
    activitiesCompleted: 41,
    attendanceRate: 98,
    peopleMet: 89,
    bio: 'Sports enthusiast.',
    badges: ['Reliable', 'Team Player', 'Active']
  }
};

export const currentUser = mockUsers['u1'];

export const mockActivities: Activity[] = [
  {
    id: 'a1',
    title: 'CS2 Premier — Need 2 players',
    description: "We're looking for two players for a casual Premier session. No toxicity, just good games.",
    category: 'Gaming',
    location: 'Online',
    date: 'Today',
    time: '21:00',
    duration: '2 hours',
    creatorId: 'u3',
    participants: ['u3', 'u1', 'u2'],
    maxParticipants: 5,
    requirements: ['Mic required', 'Chill vibes'],
    status: 'Open',
    isOnline: true,
    createdAt: '2026-09-12T10:00:00Z'
  },
  {
    id: 'a2',
    title: 'Football Match',
    description: 'Weekly 5v5 match. We need a few more players to complete the teams.',
    category: 'Sports',
    location: 'Ankara, Merkez Park',
    date: 'Saturday',
    time: '19:00',
    duration: '90 mins',
    creatorId: 'u4',
    participants: ['u4', 'u2', 'u3', 'u1'],
    maxParticipants: 10,
    requirements: ['Bring turf shoes'],
    status: 'Open',
    isOnline: false,
    createdAt: '2026-09-10T12:00:00Z'
  },
  {
    id: 'a3',
    title: 'Solana Builder Team',
    description: 'Forming a team for the upcoming hackathon. Need one solid Rust developer.',
    category: 'Development',
    location: 'Online',
    date: 'Tomorrow',
    time: '20:00',
    duration: '1 month',
    creatorId: 'u2',
    participants: ['u2'],
    maxParticipants: 4,
    requirements: ['Rust experience', 'Anchor knowledge'],
    status: 'Open',
    isOnline: true,
    createdAt: '2026-09-11T15:00:00Z'
  },
  {
    id: 'a4',
    title: 'Weekend Hiking',
    description: 'Morning hike through the local trails. Moderate difficulty.',
    category: 'Sports',
    location: 'Bursa, Uludag',
    date: 'Sunday',
    time: '08:00',
    duration: '4 hours',
    creatorId: 'u1',
    participants: ['u1', 'u4'],
    maxParticipants: 8,
    requirements: ['Good hiking boots'],
    status: 'Open',
    isOnline: false,
    createdAt: '2026-09-09T09:00:00Z'
  },
  {
    id: 'a5',
    title: 'Study Group: Zero Knowledge',
    description: 'Reading group for ZK proofs. We will cover groth16 and plonk.',
    category: 'Learning',
    location: 'Online',
    date: 'Next Tuesday',
    time: '18:00',
    duration: '2 hours',
    creatorId: 'u2',
    participants: ['u2', 'u1', 'u3', 'u4'],
    maxParticipants: 4,
    requirements: ['Basic math background'],
    status: 'Full',
    isOnline: true,
    createdAt: '2026-09-08T11:00:00Z'
  },
  {
    id: 'a6',
    title: 'UI/UX Collaboration',
    description: 'Looking for a frontend dev to help me implement a Framer motion prototype.',
    category: 'Creative',
    location: 'Online',
    date: 'Friday',
    time: '14:00',
    duration: '3 hours',
    creatorId: 'u1',
    participants: ['u1'],
    maxParticipants: 2,
    requirements: ['React/Framer Motion experience'],
    status: 'Open',
    isOnline: true,
    createdAt: '2026-09-12T08:00:00Z'
  }
];
