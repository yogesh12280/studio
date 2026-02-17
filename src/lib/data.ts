import type { User, Employee, Reimbursement } from './types';
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
