'use server';
import {NextResponse} from 'next/server';
import {grievances} from '@/lib/data';
import type {GrievanceComment, Grievance} from '@/lib/types';
import { useUser } from '@/contexts/user-context';


export async function POST(
  request: Request,
  {params}: {params: {id: string}}
) {
  const grievanceId = params.id;
  const body = await request.json();
  const {commentText, user} = body;

  if (!commentText || !user) {
    return NextResponse.json(
      {message: 'Comment text and user are required'},
      {status: 400}
    );
  }

  const grievanceIndex = grievances.findIndex(g => g.id === grievanceId);

  if (grievanceIndex === -1) {
    return NextResponse.json({message: 'Grievance not found'}, {status: 404});
  }

  const newComment: GrievanceComment = {
    id: `g-comment-${Date.now()}`,
    text: commentText,
    author: {
        name: user.name,
        avatarUrl: user.avatarUrl,
    },
    createdAt: new Date().toISOString(),
  };

  if (!grievances[grievanceIndex].comments) {
    grievances[grievanceIndex].comments = [];
  }

  grievances[grievanceIndex].comments!.push(newComment);
  
  return NextResponse.json(grievances[grievanceIndex], {status: 201});
}
