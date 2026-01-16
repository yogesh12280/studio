'use server';
import {NextResponse} from 'next/server';
import {reusableComponents} from '@/lib/data';

export async function PUT(
  request: Request,
  {params}: {params: {id: string}}
) {
  const componentId = params.id;
  const body = await request.json();
  
  const componentIndex = reusableComponents.findIndex(c => c.id === componentId);

  if (componentIndex === -1) {
    return NextResponse.json({message: 'Component not found'}, {status: 404});
  }

  reusableComponents[componentIndex] = { ...reusableComponents[componentIndex], ...body };
  
  return NextResponse.json(reusableComponents[componentIndex], {status: 200});
}

export async function DELETE(
  request: Request,
  {params}: {params: {id: string}}
) {
  const componentId = params.id;
  
  const componentIndex = reusableComponents.findIndex(c => c.id === componentId);

  if (componentIndex === -1) {
    return NextResponse.json({message: 'Component not found'}, {status: 404});
  }

  reusableComponents.splice(componentIndex, 1);
  
  return NextResponse.json({message: 'Component deleted'}, {status: 200});
}
