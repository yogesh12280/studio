'use server';
import {NextResponse} from 'next/server';
import {appreciations} from '@/lib/data';

export async function PUT(
  request: Request,
  {params}: {params: {id: string}}
) {
  const appreciationId = params.id;
  const body = await request.json();
  
  const appreciationIndex = appreciations.findIndex(a => a.id === appreciationId);

  if (appreciationIndex === -1) {
    return NextResponse.json({message: 'Appreciation not found'}, {status: 404});
  }

  appreciations[appreciationIndex] = { ...appreciations[appreciationIndex], ...body };
  
  return NextResponse.json(appreciations[appreciationIndex], {status: 200});
}

export async function DELETE(
  request: Request,
  {params}: {params: {id: string}}
) {
  const appreciationId = params.id;
  
  const appreciationIndex = appreciations.findIndex(a => a.id === appreciationId);

  if (appreciationIndex === -1) {
    return NextResponse.json({message: 'Appreciation not found'}, {status: 404});
  }

  appreciations.splice(appreciationIndex, 1);
  
  return NextResponse.json({message: 'Appreciation deleted'}, {status: 200});
}
