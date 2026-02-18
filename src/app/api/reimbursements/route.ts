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

  // Validation: Check if a claim already exists for the same month and year (excluding Rejected ones)
  const newDate = new Date(billDate);
  const newMonth = newDate.getMonth();
  const newYear = newDate.getFullYear();

  const existingClaim = reimbursements.find(r => {
    const rDate = new Date(r.billDate);
    return r.userId === userId && 
           rDate.getMonth() === newMonth && 
           rDate.getFullYear() === newYear &&
           r.status !== 'Rejected';
  });

  if (existingClaim) {
    return NextResponse.json(
      { message: `A claim for ${newDate.toLocaleString('default', { month: 'long' })} ${newYear} already exists and is ${existingClaim.status.toLowerCase()}.` },
      { status: 400 }
    );
  }

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
