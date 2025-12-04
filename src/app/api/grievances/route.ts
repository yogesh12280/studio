'use server';
import {NextResponse} from 'next/server';
import {initialGrievances, grievances} from '@/lib/data';
import type {Grievance} from '@/lib/types';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 500));
  return NextResponse.json(grievances);
}

export async function POST(request: Request) {
  const newGrievanceData = await request.json();
  
  const newGrievance: Grievance = {
    ...newGrievanceData,
    id: `grievance-${Date.now()}`,
    comments: [],
    createdAt: new Date().toISOString(),
  };

  grievances.unshift(newGrievance);
  
  return NextResponse.json(newGrievance, {status: 201});
}
