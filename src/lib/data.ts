import type { User, Employee, ReusableComponent, Reimbursement } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImageUrl = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const users: User[] = [
  { id: 'user-1', name: 'Neha M', avatarUrl: getImageUrl('avatar1'), role: 'Admin', birthdate: '1985-05-20' },
  { id: 'user-2', name: 'Yogesh Patel', avatarUrl: getImageUrl('avatar2'), role: 'Employee', birthdate: '1992-08-15' },
];

export const employees: Employee[] = [
    { id: 'emp-1', name: 'Charlie Green', email: 'charlie@sembconnect.com', role: 'Software Engineer', department: 'Technology', avatarUrl: getImageUrl('avatar3'), birthdate: '1990-03-12' },
    { id: 'emp-2', name: 'Diana Prince', email: 'diana@sembconnect.com', role: 'Product Manager', department: 'Product', avatarUrl: getImageUrl('avatar4'), birthdate: '1988-11-25' },
    { id: 'emp-3', name: 'Dinesh R', email: 'bruce@sembconnect.com', role: 'CEO', department: 'Executive', avatarUrl: getImageUrl('avatar5'), birthdate: '1975-01-30' },
    { id: 'emp-4', name: 'Clark Kent', email: 'clark@sembconnect.com', role: 'Marketing Lead', department: 'Marketing', avatarUrl: getImageUrl('avatar6'), birthdate: '1982-06-18' },
    { id: 'emp-5', name: 'Barry Allen', email: 'barry@sembconnect.com', role: 'QA Engineer', department: 'Technology', avatarUrl: getImageUrl('avatar1'), birthdate: '1995-09-01' },
    { id: 'emp-6', name: 'Hal Jordan', email: 'hal@sembconnect.com', role: 'Sales Director', department: 'Sales', avatarUrl: getImageUrl('avatar2'), birthdate: '1980-12-05' },
];

const now = new Date();

export const initialReusableComponents: ReusableComponent[] = [
  {
    id: 'rc-1',
    technology: 'Web',
    name: 'Dynamic Form Generator',
    description: 'A React component that generates complex forms from a JSON schema. Supports validation, conditional fields, and custom styling.',
    registeredBy: { name: 'Yogesh Patel', avatarUrl: getImageUrl('avatar2') },
    utilizationByProjects: [
      { projectId: 'proj-1', projectName: 'Project Phoenix', utilizedBy: { id: 'user-2', name: 'Yogesh Patel' } },
      { projectId: 'proj-2', projectName: 'Internal Tools', utilizedBy: { id: 'emp-1', name: 'Charlie Green' } }
    ],
    originProject: 'Internal Tools',
    benefit: 'Reduces form development time by up to 70%. Ensures consistency across applications.',
    bitBucketUrl: 'https://bitbucket.org/example/dynamic-form-generator',
    registeredDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    likes: 22,
    likedBy: ['user-1'],
    viewers: 150,
    viewedBy: ['user-1', 'user-2'],
    comments: [],
  },
  {
    id: 'rc-2',
    technology: 'AI',
    name: 'Sentiment Analysis API',
    description: 'A Genkit flow that analyzes user feedback from various sources and returns a sentiment score (positive, negative, neutral) along with key topics mentioned.',
    registeredBy: { name: 'Charlie Green', avatarUrl: getImageUrl('avatar3') },
    utilizationByProjects: [
      { projectId: 'proj-3', projectName: 'Customer Support Dashboard', utilizedBy: { id: 'emp-2', name: 'Diana Prince' } }
    ],
    originProject: 'Customer Support Dashboard',
    benefit: 'Automates feedback analysis, provides real-time insights into customer sentiment, and helps prioritize product improvements.',
    bitBucketUrl: 'https://bitbucket.org/example/sentiment-analysis-api',
    registeredDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    likes: 45,
    likedBy: ['user-1', 'user-2'],
    viewers: 210,
    viewedBy: ['user-1', 'user-2'],
    comments: [
      { id: 'rc-comment-1', user: { name: 'Neha M', avatarUrl: getImageUrl('avatar1') }, text: 'This has been incredibly useful for the product team!', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(), replies: [] }
    ],
  },
];

export let reusableComponents: ReusableComponent[] = [...initialReusableComponents];

export let reimbursements: Reimbursement[] = [
  {
    id: 're-1',
    userId: 'user-2',
    userName: 'Yogesh Patel',
    userAvatar: getImageUrl('avatar2'),
    amount: 45.50,
    billDate: new Date(now.getFullYear(), now.getMonth(), 5).toISOString(),
    description: 'Internet bill for current month',
    status: 'Pending',
    submittedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 're-2',
    userId: 'emp-1',
    userName: 'Charlie Green',
    userAvatar: getImageUrl('avatar3'),
    amount: 55.00,
    billDate: new Date(now.getFullYear(), now.getMonth() - 1, 10).toISOString(),
    description: 'Last month high-speed internet',
    status: 'Approved',
    submittedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 25).toISOString(),
  }
];
