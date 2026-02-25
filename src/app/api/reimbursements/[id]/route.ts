import { NextResponse } from 'next/server';
import { reimbursements } from '@/lib/data';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();
  const { status, transactionId, remarks, paidAt, approvedBy, paidAmount } = body;

  const index = reimbursements.findIndex(r => r.id === id);
  if (index === -1) {
    return NextResponse.json({ message: 'Reimbursement not found' }, { status: 404 });
  }

  // Update only fields that are provided in the body
  reimbursements[index] = { 
    ...reimbursements[index], 
    status: status !== undefined ? status : reimbursements[index].status,
    transactionId: transactionId !== undefined ? transactionId : reimbursements[index].transactionId,
    remarks: remarks !== undefined ? remarks : reimbursements[index].remarks,
    paidAt: paidAt !== undefined ? paidAt : reimbursements[index].paidAt,
    approvedBy: approvedBy !== undefined ? approvedBy : reimbursements[index].approvedBy,
    paidAmount: paidAmount !== undefined ? paidAmount : reimbursements[index].paidAmount
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
