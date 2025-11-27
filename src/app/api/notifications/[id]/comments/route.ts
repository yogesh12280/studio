'use server';
import {NextResponse} from 'next/server';
import {initialNotifications} from '@/lib/data';
import type {Comment, Notification} from '@/lib/types';

// In a real app, this would be a database. For now, it's an in-memory array.
let notifications: Notification[] = [...initialNotifications];

export async function POST(
  request: Request,
  {params}: {params: {id: string}}
) {
  const notificationId = params.id;
  const body = await request.json();
  const {commentText, user} = body;

  if (!commentText || !user) {
    return NextResponse.json(
      {message: 'Comment text and user are required'},
      {status: 400}
    );
  }

  const notificationIndex = notifications.findIndex(n => n.id === notificationId);

  if (notificationIndex === -1) {
    return NextResponse.json(
      {message: 'Notification not found'},
      {status: 404}
    );
  }

  const newComment: Comment = {
    id: `comment-${Date.now()}`,
    user: {
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
    text: commentText,
    timestamp: new Date().toISOString(),
    replies: [],
  };

  notifications[notificationIndex].comments.push(newComment);

  return NextResponse.json(newComment, {status: 201});
}
