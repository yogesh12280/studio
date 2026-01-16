'use server';
import {NextResponse} from 'next/server';
import {reusableComponents} from '@/lib/data';
import type {Comment} from '@/lib/types';

export async function POST(
  request: Request,
  {params}: {params: {id: string}}
) {
  const componentId = params.id;
  const body = await request.json();
  const {commentText, user} = body;

  if (!commentText || !user) {
    return NextResponse.json(
      {message: 'Comment text and user are required'},
      {status: 400}
    );
  }

  const componentIndex = reusableComponents.findIndex(c => c.id === componentId);

  if (componentIndex === -1) {
    return NextResponse.json(
      {message: 'Component not found'},
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

  reusableComponents[componentIndex].comments.push(newComment);

  return NextResponse.json(newComment, {status: 201});
}
