'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/dashboard' : '/login');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading TaskFlow...</p>
      </div>
    </div>
  );
}
