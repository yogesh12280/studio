'use server';
import {NextResponse} from 'next/server';
import {initialNotifications} from '@/lib/data';
import type {Comment, Notification} from '@/lib/types';

// In a real app, this would be a database. For now, it's an in-memory array.
let notifications: Notification[] = [...initialNotifications];

export async function POST(
  request: Request,
  {params}: {params: {id: string; commentId: string}}
) {
  const {id: notificationId, commentId} = params;
  const body = await request.json();
  const {replyText, user} = body;

  if (!replyText || !user) {
    return NextResponse.json(
      {message: 'Reply text and user are required'},
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

  const notification = notifications[notificationIndex];
  const commentIndex = notification.comments.findIndex(c => c.id === commentId);

  if (commentIndex === -1) {
    return NextResponse.json({message: 'Comment not found'}, {status: 404});
  }

  const newReply: Comment = {
    id: `reply-${Date.now()}`,
    user: {
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
    text: replyText,
    timestamp: new Date().toISOString(),
  };

  if (!notification.comments[commentIndex].replies) {
    notification.comments[commentIndex].replies = [];
  }

  notification.comments[commentIndex].replies!.push(newReply);
  notifications[notificationIndex] = notification;

  return NextResponse.json(newReply, {status: 201});
}
