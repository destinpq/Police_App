'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from './services/AuthService';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is already logged in
    if (AuthService.isLoggedIn()) {
      router.push('/tasks');
    } else {
      router.push('/login');
    }
  }, [router]);

  return null;
}
