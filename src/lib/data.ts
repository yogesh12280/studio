
import type { User, Employee, Notification, Grievance, Poll, Suggestion, Appreciation } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImageUrl = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const users: User[] = [
  { id: 'user-1', name: 'Neha M', avatarUrl: getImageUrl('avatar1'), role: 'Admin', birthdate: '1985-05-20' },
  { id: 'user-2', name: 'Yogesh Patel', avatarUrl: getImageUrl('avatar2'), role: 'Employee', birthdate: '1992-08-15' },
];

export const employees: Employee[] = [
    { id: 'emp-1', name: 'Charlie Green', email: 'charlie@orgablast.com', role: 'Software Engineer', department: 'Technology', avatarUrl: getImageUrl('avatar3'), birthdate: '1990-03-12' },
    { id: 'emp-2', name: 'Diana Prince', email: 'diana@orgablast.com', role: 'Product Manager', department: 'Product', avatarUrl: getImageUrl('avatar4'), birthdate: '1988-11-25' },
    { id: 'emp-3', name: 'Dinesh R', email: 'bruce@orgablast.com', role: 'CEO', department: 'Executive', avatarUrl: getImageUrl('avatar5'), birthdate: '1975-01-30' },
    { id: 'emp-4', name: 'Clark Kent', email: 'clark@orgablast.com', role: 'Marketing Lead', department: 'Marketing', avatarUrl: getImageUrl('avatar6'), birthdate: '1982-06-18' },
    { id: 'emp-5', name: 'Barry Allen', email: 'barry@orgablast.com', role: 'QA Engineer', department: 'Technology', avatarUrl: getImageUrl('avatar1'), birthdate: '1995-09-01' },
    { id: 'emp-6', name: 'Hal Jordan', email: 'hal@orgablast.com', role: 'Sales Director', department: 'Sales', avatarUrl: getImageUrl('avatar2'), birthdate: '1980-12-05' },
];

const now = new Date();
const staticNow = new Date('2025-11-05T07:25:07.254Z');

export const initialNotifications: Notification[] = [
  {
    id: 'notification-1',
    author: { name: 'Neha M', avatarUrl: getImageUrl('avatar1') },
    category: 'Organization',
    title: 'Announcing Our Annual Company Retreat 2024!',
    content: 'Get ready for an unforgettable experience! This year, we are heading to the mountains for a weekend of team-building, workshops, and fun. More details to follow next week. Make sure to clear your calendars for the first weekend of October.',
    imageUrl: getImageUrl('postImage1'),
    likes: 12,
    likedBy: ['user-2'],
    viewers: 58,
    viewedBy: ['user-1', 'user-2'],
    comments: [
        { id: 'comment-1', user: { name: 'Yogesh Patel', avatarUrl: getImageUrl('avatar2') }, text: 'So excited for this!', timestamp: new Date(staticNow.getTime() - 1000 * 60 * 5).toISOString() }
    ],
    createdAt: new Date(staticNow.getTime() - 1000 * 60 * 60 * 2).toISOString(),
    endDate: new Date(staticNow.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: 'notification-2',
    author: { name: 'Yogesh Patel', avatarUrl: getImageUrl('avatar2') },
    category: 'Employee',
    title: 'Project Phoenix: Official Launch',
    content: 'We are thrilled to announce the successful launch of Project Phoenix. This is a huge milestone for our team and the company. A big thank you to everyone in the Technology and Product departments for their hard work and dedication.',
    imageUrl: getImageUrl('postImage2'),
    likes: 25,
likedBy: ['user-1', 'user-2'],
    viewers: 75,
    viewedBy: ['user-1', 'user-2'],
    comments: [],
    createdAt: new Date(staticNow.getTime() - 1000 * 60 * 60 * 24).toISOString(),
    endDate: new Date(staticNow.getTime() + 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: 'notification-3',
    author: { name: 'Dinesh R', avatarUrl: getImageUrl('avatar5') },
    category: 'Organization',
    title: 'Q3 Financial Results & Town Hall Meeting',
    content: 'Join us for the upcoming town hall where we will discuss our strong Q3 financial results and outline our strategic priorities for Q4. The meeting is scheduled for this Friday at 10:00 AM PST.',
    link: { url: 'https://meeting.example.com/q3-townhall', text: 'Join Town Hall Meeting' },
    likes: 8,
    likedBy: ['user-2'],
    viewers: 62,
    viewedBy: ['user-1', 'user-2'],
    comments: [],
    createdAt: new Date(staticNow.getTime() - 1000 * 60 * 60 * 72).toISOString(),
    scheduledFor: new Date(staticNow.getTime() + 1000 * 60 * 60 * 24 * 2).toISOString(), // Scheduled for 2 days from now
    endDate: new Date(staticNow.getTime() + 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
];

export const initialGrievances: Grievance[] = [
  {
    id: 'grievance-1',
    employeeId: 'user-2',
    employeeName: 'Yogesh Patel',
    employeeAvatarUrl: getImageUrl('avatar2'),
    subject: 'Issue with new workstation',
    description: 'The new workstation provided is missing a secondary monitor, which is affecting my productivity. I had requested one during the setup process.',
    status: 'Pending',
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(),
    comments: [],
  },
  {
    id: 'grievance-2',
    employeeId: 'emp-1',
    employeeName: 'Charlie Green',
    employeeAvatarUrl: getImageUrl('avatar3'),
    subject: 'Unresolved IT Ticket #12345',
    description: 'My IT ticket regarding VPN access issues has been open for over a week without any resolution. I am unable to access critical development servers.',
    status: 'In Progress',
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    comments: [
        {
            id: 'g-comment-1',
            text: 'We are looking into this with high priority.',
            author: { name: 'Neha M', avatarUrl: getImageUrl('avatar1')},
            createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(),
            status: 'In Progress'
        }
    ],
  },
  {
    id: 'grievance-3',
    employeeId: 'user-2',
    employeeName: 'Yogesh Patel',
    employeeAvatarUrl: getImageUrl('avatar2'),
    subject: 'Expense Report Reimbursement Delay',
    description: 'My expense report for the Q2 conference has not been reimbursed yet. It was submitted over a month ago.',
    status: 'Resolved',
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    resolvedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    comments: [
         {
            id: 'g-comment-2',
            text: 'The reimbursement was processed and should reflect in your account within 2-3 business days.',
            author: { name: 'Neha M', avatarUrl: getImageUrl('avatar1')},
            createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
            status: 'Resolved'
        }
    ],
  },
];

export const initialPolls: Poll[] = [
  {
    id: 'poll-1',
    question: 'What should be our team-building activity for this quarter?',
    options: [
      { id: 'opt-1-1', text: 'Escape Room Challenge', votes: 12 },
      { id: 'opt-1-2', text: 'Go-Kart Racing', votes: 28 },
      { id: 'opt-1-3', text: 'Paintball', votes: 15 },
      { id: 'opt-1-4', text: 'Cooking Class', votes: 8 },
    ],
    author: { name: 'Neha M', avatarUrl: getImageUrl('avatar1') },
    category: 'Organization',
    createdAt: new Date(staticNow.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    endDate: new Date(staticNow.getTime() + 1000 * 60 * 60 * 24 * 9).toISOString(),
    votedBy: ['user-1'],
  },
  {
    id: 'poll-2',
    question: 'Which new coffee machine should we get for the office?',
    options: [
      { id: 'opt-2-1', text: 'Nespresso Vertuo', votes: 35 },
      { id: 'opt-2-2', text: 'Jura E8', votes: 10 },
      { id: 'opt-2-3', text: 'Breville Barista Express', votes: 20 },
    ],
    author: { name: 'Yogesh Patel', avatarUrl: getImageUrl('avatar2') },
    category: 'Employee',
    createdAt: new Date(staticNow.getTime() - 1000 * 60 * 60 * 48).toISOString(),
    votedBy: [],
  },
  {
    id: 'poll-3',
    question: 'Where should we hold the next annual company offsite?',
    options: [
      { id: 'opt-3-1', text: 'Beach Resort in Goa', votes: 42 },
      { id: 'opt-3-2', text: 'Mountain Retreat in Himalayas', votes: 25 },
      { id: 'opt-3-3', text: 'Cultural Trip in Rajasthan', votes: 18 },
    ],
    author: { name: 'Dinesh R', avatarUrl: getImageUrl('avatar5') },
    category: 'Organization',
    createdAt: new Date(staticNow.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    endDate: new Date(staticNow.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(), // Expired
    votedBy: ['user-1', 'user-2'],
  },
];

export const initialSuggestions: Suggestion[] = [
    {
        id: 'sugg-1',
        employeeId: 'user-2',
        employeeName: 'Yogesh Patel',
        employeeAvatarUrl: getImageUrl('avatar2'),
        title: 'Implement a "Focus Friday" initiative',
        description: 'Designate Fridays as no-meeting days to allow for deep work and reduce weekend overwork. This could improve productivity and employee well-being.',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        upvotes: 15,
        upvotedBy: ['user-1'],
        comments: [],
    },
    {
        id: 'sugg-2',
        employeeId: 'emp-1',
        employeeName: 'Charlie Green',
        employeeAvatarUrl: getImageUrl('avatar3'),
        title: 'Mentorship Program',
        description: 'Establish a formal mentorship program to connect senior and junior employees. This can aid in skill development, career growth, and knowledge transfer.',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        upvotes: 22,
        upvotedBy: [],
        comments: [],
    }
];

export const initialAppreciations: Appreciation[] = [
  {
    id: 'app-1',
    fromUser: { id: 'user-1', name: 'Neha M', avatarUrl: getImageUrl('avatar1') },
    toUser: { id: 'user-2', name: 'Yogesh Patel', avatarUrl: getImageUrl('avatar2') },
    message: 'Great job on the Project Phoenix launch! Your dedication and hard work were key to its success.',
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    likes: 5,
    likedBy: [],
  },
  {
    id: 'app-2',
    fromUser: { id: 'emp-2', name: 'Diana Prince', avatarUrl: getImageUrl('avatar4') },
    toUser: { id: 'emp-1', name: 'Charlie Green', avatarUrl: getImageUrl('avatar3') },
    message: 'Thanks for always being so helpful and patient with my questions on the new system. You are a lifesaver!',
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(),
    likes: 10,
    likedBy: ['user-1', 'user-2'],
  }
];
