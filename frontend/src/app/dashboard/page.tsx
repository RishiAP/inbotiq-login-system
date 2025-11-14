"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AdminPanel from '@/components/dashboard/AdminPanel';
import UserPanel from '@/components/dashboard/UserPanel';

type User = { id: string; name: string; email: string; role: 'user' | 'admin' };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    api.get('/auth/me')
      .then(res => {
        if (mounted) setUser(res.data.user);
      })
      .catch((err: unknown) => {
        console.error('Not authenticated', err);
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        const message = e.response?.data?.message ?? e.message ?? 'Not authenticated';
        toast.error(message);
        router.push('/login');
      });
    return () => { mounted = false; };
  }, [router]);

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
      toast.success('Logged out');
      router.push('/login');
    } catch (err) {
      console.error(err);
      toast.error('Logout failed');
    }
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen p-6">
      <Card className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user.name} ({user.role === 'admin' ? 'Admin' : 'User'})</h1>
          <div>
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        </div>

        <div>
          {user.role === 'admin' ? (
            <AdminPanel />
          ) : (
            <UserPanel name={user.name} email={user.email} />
          )}
        </div>
      </Card>
    </div>
  );
}
