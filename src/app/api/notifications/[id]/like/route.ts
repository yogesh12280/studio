import { NextResponse } from 'next/server';
import { initialNotifications } from '@/lib/data';
import type { Notification } from '@/lib/types';

// In a real app, this would be a database. For now, it's an in-memory array.
let notifications: Notification[] = [...initialNotifications];

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const notificationId = params.id;
  const body = await request.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
  }

  const notificationIndex = notifications.findIndex(n => n.id === notificationId);

  if (notificationIndex === -1) {
    return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
  }

  const notification = notifications[notificationIndex];
  const isLiked = notification.likedBy.includes(userId);

  if (isLiked) {
    notification.likes -= 1;
    notification.likedBy = notification.likedBy.filter(id => id !== userId);
  } else {
    notification.likes += 1;
    notification.likedBy.push(userId);
  }

  notifications[notificationIndex] = notification;

  return NextResponse.json(notification);
}
