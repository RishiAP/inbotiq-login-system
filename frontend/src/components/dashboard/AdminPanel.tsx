"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import Spinner from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '../ui/input';

type UserRow = { _id: string; name: string; email: string; role: string; banned?: boolean };

export default function AdminPanel() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; ban: boolean } | null>(null);

  async function fetchCurrentUser() {
    try {
      const res = await api.get('/auth/me');
      setCurrentUserId(res.data.user._id || res.data.user.id || null);
    } catch (err) {
      console.error('Failed to load current user', err);
    }
  }

  async function fetchUsers() {
    try {
      setLoadingUsers(true);
  const res = await api.get('/admin/users', { params: { page, limit, q, sortBy, order } });
      // ensure admins are not shown in the UI (server-side also filters)
  setUsers((res.data.users || []).filter((u: UserRow) => u.role !== 'admin'));
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // fetch users when page or debounced q changes
  useEffect(() => {
    fetchUsers();
  }, [page, q, sortBy, order]);

  // debounce searchTerm -> q
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(searchTerm);
      setPage(1);
    }, 600);
    return () => clearTimeout(t);
  }, [searchTerm]);

  function openConfirm(id: string, ban: boolean) {
    setConfirmTarget({ id, ban });
    setConfirmOpen(true);
  }

  async function confirmAction() {
    if (!confirmTarget) return;
    const { id, ban } = confirmTarget;
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      const url = `/admin/users/${id}/${ban ? 'ban' : 'unban'}`;
      await api.post(url);
      toast.success(ban ? 'User banned' : 'User unbanned');
      setUsers(prev => prev.map(u => (u._id === id ? { ...u, banned: ban } : u)));
    } catch (err) {
      console.error(err);
      toast.error('Action failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  }

  return (
    <section className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Admin panel</h2>

      <Card className="p-4 mb-4">
        <h3 className="font-medium mb-2">User management</h3>
        <div className="mb-2">
          <div className="flex gap-2">
            <Input placeholder="Search users..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); }} />
            <div className="flex items-center gap-2">
              <label className="text-sm">Sort:</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as 'createdAt' | 'updatedAt')} className="border p-1 rounded">
                <option value="createdAt">Created</option>
                <option value="updatedAt">Updated</option>
              </select>
              <button className="border rounded px-2 py-1" onClick={() => setOrder(o => (o === 'asc' ? 'desc' : 'asc'))}>{order === 'asc' ? '↑' : '↓'}</button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {loadingUsers ? (
            // show 4 skeleton rows while loading
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-3 border rounded">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <Skeleton className="w-48 h-4" />
                      <Skeleton className="w-64 h-3 mt-2" />
                    </div>
                    <div className="w-24">
                      <Skeleton className="w-24 h-8" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            users.map(u => (
              <Card key={u._id} className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{u.name} {u.banned ? <span className="text-red-600">(banned)</span> : null}</div>
                    <div className="text-sm text-muted-foreground">{u.email}</div>
                  </div>
                  <div className="flex gap-2">
                    {u._id === currentUserId ? null : (
                      u.banned ? (
                        <Dialog open={confirmOpen && confirmTarget?.id === u._id && confirmTarget?.ban === false} onOpenChange={setConfirmOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => openConfirm(u._id, false)}>Unban</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm unban</DialogTitle>
                              <DialogDescription>Are you sure you want to unban {u.name}? This will restore their access.</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => { setConfirmOpen(false); setConfirmTarget(null); }}>Cancel</Button>
                              <Button onClick={confirmAction} disabled={!!actionLoading[u._id]}>{actionLoading[u._id] ? <Spinner /> : 'Unban'}</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Dialog open={confirmOpen && confirmTarget?.id === u._id && confirmTarget?.ban === true} onOpenChange={setConfirmOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="destructive" onClick={() => openConfirm(u._id, true)}>{actionLoading[u._id] ? <Spinner /> : 'Ban'}</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm ban</DialogTitle>
                              <DialogDescription>Are you sure you want to ban {u.name}? Banned users cannot create notes or access the app.</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => { setConfirmOpen(false); setConfirmTarget(null); }}>Cancel</Button>
                              <Button variant="destructive" onClick={confirmAction} disabled={!!actionLoading[u._id]}>{actionLoading[u._id] ? <Spinner /> : 'Ban'}</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <div>{total} users</div>
          <div className="flex gap-2">
            <Button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
            <Button disabled={page * limit >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </Card>

    </section>
  );
}
