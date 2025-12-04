'use server';
import {NextResponse} from 'next/server';
import {grievances} from '@/lib/data';
import type { Grievance, GrievanceComment } from '@/lib/types';

export async function POST(
  request: Request,
  {params}: {params: {id: string}}
) {
  const grievanceId = params.id;
  const body = await request.json();
  const { newStatus, comment, user } = body;

  if (!newStatus) {
    return NextResponse.json({message: 'New status is required'}, {status: 400});
  }

  const grievanceIndex = grievances.findIndex(g => g.id === grievanceId);

  if (grievanceIndex === -1) {
    return NextResponse.json({message: 'Grievance not found'}, {status: 404});
  }

  const updatedGrievance: Grievance = {
    ...grievances[grievanceIndex],
    status: newStatus,
    resolvedAt: newStatus === 'Resolved' ? new Date().toISOString() : grievances[grievanceIndex].resolvedAt,
  };

  if (comment && user) {
    const newComment: GrievanceComment = {
      id: `g-comment-${Date.now()}`,
      text: comment,
      user: {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      author: {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      createdAt: new Date().toISOString(),
      status: newStatus,
      replies: [],
    };
    if (!updatedGrievance.comments) {
        updatedGrievance.comments = [];
    }
    updatedGrievance.comments.push(newComment);
  }

  grievances[grievanceIndex] = updatedGrievance;

  return NextResponse.json(updatedGrievance);
}
