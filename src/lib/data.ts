
import type { User, Employee, Bulletin, Grievance } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImageUrl = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const users: User[] = [
  { id: 'user-1', name: 'Alex Hartman', avatarUrl: getImageUrl('avatar1'), role: 'Admin' },
  { id: 'user-2', name: 'Yogesh Patel', avatarUrl: getImageUrl('avatar2'), role: 'Employee' },
];

export const employees: Employee[] = [
    { id: 'emp-1', name: 'Charlie Green', email: 'charlie@orgablast.com', role: 'Software Engineer', department: 'Technology', avatarUrl: getImageUrl('avatar3') },
    { id: 'emp-2', name: 'Diana Prince', email: 'diana@orgablast.com', role: 'Product Manager', department: 'Product', avatarUrl: getImageUrl('avatar4') },
    { id: 'emp-3', name: 'Bruce Wayne', email: 'bruce@orgablast.com', role: 'CEO', department: 'Executive', avatarUrl: getImageUrl('avatar5') },
    { id: 'emp-4', name: 'Clark Kent', email: 'clark@orgablast.com', role: 'Marketing Lead', department: 'Marketing', avatarUrl: getImageUrl('avatar6') },
    { id: 'emp-5', name: 'Barry Allen', email: 'barry@orgablast.com', role: 'QA Engineer', department: 'Technology', avatarUrl: getImageUrl('avatar1') },
    { id: 'emp-6', name: 'Hal Jordan', email: 'hal@orgablast.com', role: 'Sales Director', department: 'Sales', avatarUrl: getImageUrl('avatar2') },
];

const now = new Date();
const staticNow = new Date('2025-11-05T07:25:07.254Z');

export const initialBulletins: Bulletin[] = [
  {
    id: 'bulletin-1',
    author: { name: 'Alex Hartman', avatarUrl: getImageUrl('avatar1') },
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
    id: 'bulletin-2',
    author: { name: 'Alex Hartman', avatarUrl: getImageUrl('avatar1') },
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
    id: 'bulletin-3',
    author: { name: 'Bruce Wayne', avatarUrl: getImageUrl('avatar5') },
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
  },
];

