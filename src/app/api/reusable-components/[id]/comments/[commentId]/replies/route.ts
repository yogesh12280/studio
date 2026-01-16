'use server';
import {NextResponse} from 'next/server';
import {reusableComponents} from '@/lib/data';
import type {Comment} from '@/lib/types';

export async function POST(
  request: Request,
  {params}: {params: {id: string; commentId: string}}
) {
  const {id: componentId, commentId} = params;
  const body = await request.json();
  const {replyText, user} = body;

  if (!replyText || !user) {
    return NextResponse.json(
      {message: 'Reply text and user are required'},
      {status: 400}
    );
  }

  const componentIndex = reusableComponents.findIndex(n => n.id === componentId);

  if (componentIndex === -1) {
    return NextResponse.json(
      {message: 'Component not found'},
      {status: 404}
    );
  }

  const component = reusableComponents[componentIndex];
  const commentIndex = component.comments.findIndex(c => c.id === commentId);

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

  if (!component.comments[commentIndex].replies) {
    component.comments[commentIndex].replies = [];
  }

  component.comments[commentIndex].replies!.push(newReply);
  reusableComponents[componentIndex] = component;

  return NextResponse.json(newReply, {status: 201});
}
