'use client';

import { Suspense } from 'react';
import AccountContent from './account-content';

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="section" style={{ paddingTop: '6rem', textAlign: 'center' }}>Chargement...</div>}>
      <AccountContent />
    </Suspense>
  );
}
