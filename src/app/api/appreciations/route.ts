'use server';
import {NextResponse} from 'next/server';
import { appreciations, users, employees } from '@/lib/data';
import type {Appreciation} from '@/lib/types';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 500));
  return NextResponse.json(appreciations);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { fromUserId, toUser, message } = body;
  
  const allUsers = [...users, ...employees];
  const fromUser = allUsers.find(u => u.id === fromUserId);

  if (!fromUser) {
    return NextResponse.json({ message: 'From user not found' }, { status: 404 });
  }

  const newAppreciation: Appreciation = {
    id: `appreciation-${Date.now()}`,
    fromUser: {
      id: fromUser.id,
      name: fromUser.name,
      avatarUrl: fromUser.avatarUrl,
    },
    toUser: toUser,
    message: message,
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
  };

  appreciations.unshift(newAppreciation);
  
  return NextResponse.json(newAppreciation, {status: 201});
}
