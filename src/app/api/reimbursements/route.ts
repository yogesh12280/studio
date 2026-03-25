import { NextResponse } from 'next/server';
import { reimbursements } from '@/lib/data';
import { Reimbursement } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const isAdmin = searchParams.get('isAdmin') === 'true';

  let filtered = [...reimbursements];

  // If a specific userId is requested, always filter by it.
  // This is crucial for the Calendar view which looks at one person at a time.
  if (userId) {
    filtered = filtered.filter(r => r.userId === userId);
  } else if (!isAdmin) {
    // Regular users must have a userId provided (handled by client, but good to be safe)
    // If no userId and not admin, return empty to prevent unauthorized access to all data
    return NextResponse.json([]);
  }
  // If isAdmin is true and NO userId is provided, return all (used in the main table list view).

  // Sort by most recent submission
  filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, userName, userAvatar, amount, billDate, description, receiptUrl } = body;

  // Amount limit validation
  if (Number(amount) > 2000) {
    return NextResponse.json(
      { message: "Claim amount cannot exceed ₹2,000." },
      { status: 400 }
    );
  }

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
