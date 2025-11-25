import { NextResponse } from 'next/server';
import { users } from '@/lib/data';

export async function GET() {
  // In a real application, you would fetch this data from a database.
  // We'll add a short delay to simulate network latency.
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(users);
}
