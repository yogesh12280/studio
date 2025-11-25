import { NextResponse } from 'next/server';
import { initialNotifications } from '@/lib/data';
import type { Notification } from '@/lib/types';

export async function GET() {
  // In a real application, you would fetch this data from a database.
  // We'll add a short delay to simulate network latency.
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(initialNotifications);
}

export async function POST(request: Request) {
  const newNotificationData = await request.json();
  // In a real app, you'd save this to a database and get a new ID.
  // For now, we'll just create a new object.
  const newNotification: Notification = {
    ...newNotificationData,
    id: `notification-${Date.now()}`,
    likes: 0,
    likedBy: [],
    viewers: 0,
    viewedBy: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };

  // Note: This won't actually persist the data across requests in this mock setup.
  // In a real backend, you'd add this to your database.
  // initialNotifications.unshift(newNotification); 
  
  return NextResponse.json(newNotification, { status: 201 });
}
