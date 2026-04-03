'use client';

import { useRouter } from 'next/navigation';
import TermsModal from '@/components/TermsModal';

export default function HubPage() {
  const router = useRouter();

  const handleAcceptTerms = () => {
    // Redirect to profile/main hub after accepting terms
    router.push('/profile');
  };

  return (
    <TermsModal onAccept={handleAcceptTerms} />
  );
}
