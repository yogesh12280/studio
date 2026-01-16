'use server';
import { NextResponse } from 'next/server';
import { reusableComponents } from '@/lib/data';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const componentId = params.id;
  const body = await request.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
  }

  const componentIndex = reusableComponents.findIndex(c => c.id === componentId);

  if (componentIndex === -1) {
    return NextResponse.json({ message: 'Component not found' }, { status: 404 });
  }

  const component = reusableComponents[componentIndex];
  const isLiked = component.likedBy.includes(userId);

  if (isLiked) {
    component.likes -= 1;
    component.likedBy = component.likedBy.filter(id => id !== userId);
  } else {
    component.likes += 1;
    component.likedBy.push(userId);
  }

  reusableComponents[componentIndex] = component;

  return NextResponse.json(component);
}
