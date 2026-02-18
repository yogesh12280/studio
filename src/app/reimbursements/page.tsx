'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RedirPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/internet-reimbursement');
  }, [router]);
  return null;
}
