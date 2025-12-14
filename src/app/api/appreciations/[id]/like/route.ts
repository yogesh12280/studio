'use server';
import {NextResponse} from 'next/server';
import {appreciations} from '@/lib/data';

export async function POST(
  request: Request,
  {params}: {params: {id: string}}
) {
  const appreciationId = params.id;
  const { userId } = await request.json();
  
  const appreciationIndex = appreciations.findIndex(a => a.id === appreciationId);

  if (appreciationIndex === -1) {
    return NextResponse.json({message: 'Appreciation not found'}, {status: 404});
  }

  const appreciation = appreciations[appreciationIndex];
  const likedIndex = appreciation.likedBy.indexOf(userId);

  if (likedIndex > -1) {
    appreciation.likes--;
    appreciation.likedBy.splice(likedIndex, 1);
  } else {
    appreciation.likes++;
    appreciation.likedBy.push(userId);
  }
  
  appreciations[appreciationIndex] = appreciation;

  return NextResponse.json(appreciation, {status: 200});
}
