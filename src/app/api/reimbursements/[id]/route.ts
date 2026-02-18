import { NextResponse } from 'next/server';
import { reimbursements } from '@/lib/data';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();
  const { status, transactionId, remarks, paidAt } = body;

  const index = reimbursements.findIndex(r => r.id === id);
  if (index === -1) {
    return NextResponse.json({ message: 'Reimbursement not found' }, { status: 404 });
  }

  reimbursements[index] = { 
    ...reimbursements[index], 
    status,
    transactionId: transactionId || reimbursements[index].transactionId,
    remarks: remarks || reimbursements[index].remarks,
    paidAt: paidAt || reimbursements[index].paidAt
  };

  return NextResponse.json(reimbursements[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  const index = reimbursements.findIndex(r => r.id === id);
  
  if (index === -1) {
    return NextResponse.json({ message: 'Reimbursement not found' }, { status: 404 });
  }

  // Directly modifying the array reference
  reimbursements.splice(index, 1);
  
  return NextResponse.json({ message: 'Deleted successfully' });
}
