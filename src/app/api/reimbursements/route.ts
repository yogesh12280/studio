import { NextResponse } from 'next/server';
import { reimbursements } from '@/lib/data';
import { Reimbursement } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const isAdmin = searchParams.get('isAdmin') === 'true';

  let filtered = [...reimbursements];

  if (!isAdmin && userId) {
    filtered = filtered.filter(r => r.userId === userId);
  }

  // Sort by most recent submission
  filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, userName, userAvatar, amount, billDate, description, receiptUrl } = body;

  const newReimbursement: Reimbursement = {
    id: `re-${Date.now()}`,
    userId,
    userName,
    userAvatar,
    amount: Number(amount),
    billDate,
    description,
    receiptUrl,
    status: 'Pending',
    submittedAt: new Date().toISOString(),
  };

  reimbursements.unshift(newReimbursement);

  return NextResponse.json(newReimbursement, { status: 201 });
}
