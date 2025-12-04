'use server';
import {NextResponse} from 'next/server';
import {grievances} from '@/lib/data';
import type {GrievanceComment, Grievance} from '@/lib/types';

export async function POST(
  request: Request,
  {params}: {params: {id: string; commentId: string}}
) {
  const {id: grievanceId, commentId} = params;
  const body = await request.json();
  const {replyText, user} = body;

  if (!replyText || !user) {
    return NextResponse.json(
      {message: 'Reply text and user are required'},
      {status: 400}
    );
  }

  const grievanceIndex = grievances.findIndex(g => g.id === grievanceId);

  if (grievanceIndex === -1) {
    return NextResponse.json(
      {message: 'Grievance not found'},
      {status: 404}
    );
  }

  const grievance = grievances[grievanceIndex];
  const commentIndex = (grievance.comments || []).findIndex(c => c.id === commentId);

  if (commentIndex === -1) {
    return NextResponse.json({message: 'Comment not found'}, {status: 404});
  }

  const newReply: GrievanceComment = {
    id: `g-reply-${Date.now()}`,
    user: {
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
    author: {
        name: user.name,
        avatarUrl: user.avatarUrl,
    },
    text: replyText,
    createdAt: new Date().toISOString(),
    parentId: commentId,
    replies: [],
  };

  if (!grievance.comments![commentIndex].replies) {
    grievance.comments![commentIndex].replies = [];
  }

  grievance.comments![commentIndex].replies!.push(newReply);
  // Also add to the flat list for easier lookup if needed, but for now we'll just nest it.
  // grievance.comments.push(newReply);

  grievances[grievanceIndex] = grievance;

  return NextResponse.json(grievance, {status: 201});
}
