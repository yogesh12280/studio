'use server';
import {NextResponse} from 'next/server';
import { reusableComponents } from '@/lib/data';
import type { ReusableComponent } from '@/lib/types';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 500));
  return NextResponse.json(reusableComponents);
}

export async function POST(request: Request) {
  const newComponentData = await request.json();
  
  const newComponent: ReusableComponent = {
    ...newComponentData,
    id: `rc-${Date.now()}`,
    likes: 0,
    likedBy: [],
    viewers: 0,
    viewedBy: [],
    comments: [],
    registeredDate: new Date().toISOString(),
  };

  reusableComponents.unshift(newComponent);
  
  return NextResponse.json(newComponent, {status: 201});
}
