'use server';
import {NextResponse} from 'next/server';
import {grievances} from '@/lib/data';

export async function PUT(
  request: Request,
  {params}: {params: {id: string}}
) {
  const grievanceId = params.id;
  const body = await request.json();
  
  const grievanceIndex = grievances.findIndex(g => g.id === grievanceId);

  if (grievanceIndex === -1) {
    return NextResponse.json({message: 'Grievance not found'}, {status: 404});
  }

  grievances[grievanceIndex] = { ...grievances[grievanceIndex], ...body };
  
  return NextResponse.json(grievances[grievanceIndex], {status: 200});
}

export async function DELETE(
  request: Request,
  {params}: {params: {id: string}}
) {
  const grievanceId = params.id;
  
  const grievanceIndex = grievances.findIndex(g => g.id === grievanceId);

  if (grievanceIndex === -1) {
    return NextResponse.json({message: 'Grievance not found'}, {status: 404});
  }

  grievances.splice(grievanceIndex, 1);
  
  return NextResponse.json({message: 'Grievance deleted'}, {status: 200});
}
