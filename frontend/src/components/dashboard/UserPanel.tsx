"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search } from 'lucide-react';
import DatePicker from '@/components/ui/date-picker';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Spinner from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  name?: string;
  email?: string;
};

type Note = {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
};

export default function UserPanel({ name, email }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [createdFrom, setCreatedFrom] = useState<string>('');
  const [createdTo, setCreatedTo] = useState<string>('');
  const [updatedFrom, setUpdatedFrom] = useState<string>('');
  const [updatedTo, setUpdatedTo] = useState<string>('');
  const [newContent, setNewContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingNotes(true);
        const res = await api.get('/notes', { params: { page, limit, q, sortBy, order, createdFrom: createdFrom || undefined, createdTo: createdTo || undefined, updatedFrom: updatedFrom || undefined, updatedTo: updatedTo || undefined } });
        if (!mounted) return;
        setNotes(res.data.notes || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load notes');
      } finally {
        setLoadingNotes(false);
      }
    })();
    return () => { mounted = false; };
  }, [page, q, sortBy, order, limit, createdFrom, createdTo, updatedFrom, updatedTo]);

  // debounce searchTerm -> q
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(searchTerm);
      setPage(1);
    }, 600);
    return () => clearTimeout(t);
  }, [searchTerm]);

  async function handleCreate() {
    if (!newContent.trim()) return toast.error('Type something');
    try {
      setCreating(true);
      const res = await api.post('/notes', { content: newContent });
      setNewContent('');
      toast.success('Note created');
      // prepend
      setNotes(prev => [res.data.note, ...prev].slice(0, limit));
      setTotal(t => t + 1);
    } catch (err) {
      console.error(err);
      toast.error('Create failed');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    // open confirmation dialog
    setDeletingId(id);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!deletingId) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/notes/${deletingId}`);
      setNotes(prev => prev.filter(n => n._id !== deletingId));
      setTotal(t => Math.max(0, t - 1));
      toast.success('Deleted');
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setDeletingId(null);
    }
  }

  function startEdit(n: Note) {
    setEditingId(n._id);
    setEditingContent(n.content);
  }

  async function saveEdit() {
    if (!editingId) return;
    try {
      setSavingId(editingId);
      const res = await api.put(`/notes/${editingId}`, { content: editingContent });
      setNotes(prev => prev.map(n => (n._id === editingId ? res.data.note : n)));
      setEditingId(null);
      setEditingContent('');
      toast.success('Updated');
    } catch (err) {
      console.error(err);
      toast.error('Update failed');
    }
    finally {
      setSavingId(null);
    }
  }

  return (
    <section className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Your notes</h2>

      <Card className="p-4">
        <div className="mb-2">
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        <div className="mb-4">
          <Textarea
            value={newContent}
            onChange={e => setNewContent((e.target as HTMLTextAreaElement).value)}
            rows={3}
            placeholder="Write a new note..."
          />
          <div className="mt-2">
              <Button onClick={handleCreate} disabled={creating}>{creating ? <Spinner /> : 'Create note'}</Button>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2">
            <div className="flex gap-2">
              <Input placeholder="Search notes..." value={searchTerm} onChange={e => { setSearchTerm((e.target as HTMLInputElement).value); }} />
              <Button onClick={() => { setPage(1); }} aria-label="Search"><Search size={16} /></Button>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setPage(1); }}>Clear</Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex gap-2">
              <DatePicker label="Created from" value={createdFrom} onChange={(v) => { setCreatedFrom(v || ''); setPage(1); }} />
              <DatePicker label="Created to" value={createdTo} onChange={(v) => { setCreatedTo(v || ''); setPage(1); }} />
            </div>
            <div className="flex gap-2">
              <DatePicker label="Updated from" value={updatedFrom} onChange={(v) => { setUpdatedFrom(v || ''); setPage(1); }} />
              <DatePicker label="Updated to" value={updatedTo} onChange={(v) => { setUpdatedTo(v || ''); setPage(1); }} />
            </div>
            <div>
              <Button variant="outline" onClick={() => { setCreatedFrom(''); setCreatedTo(''); setUpdatedFrom(''); setUpdatedTo(''); setPage(1); }}>Clear dates</Button>
            </div>
          </div>
        </div>

        <div>
          <Table>
            <TableHeader>
              <tr>
                  <TableHead>Content</TableHead>
                  <TableHead onClick={() => { setSortBy('createdAt'); setOrder(o => (o === 'asc' ? 'desc' : 'asc')); }} style={{ cursor: 'pointer' }}>
                    Created {sortBy === 'createdAt' ? (order === 'asc' ? ' ↑' : ' ↓') : ''}
                  </TableHead>
                  <TableHead onClick={() => { setSortBy('updatedAt'); setOrder(o => (o === 'asc' ? 'desc' : 'asc')); }} style={{ cursor: 'pointer' }}>
                    Updated {sortBy === 'updatedAt' ? (order === 'asc' ? ' ↑' : ' ↓') : ''}
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
            </TableHeader>
            <TableBody>
              {loadingNotes ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="p-2 border rounded">
                          <div className="flex justify-between items-center">
                            <div className="w-3/4">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-3 w-1/2 mt-2" />
                            </div>
                            <div className="w-24">
                              <Skeleton className="h-8 w-24" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                notes.map(n => (
                  <TableRow key={n._id}>
                    <TableCell>
                      {editingId === n._id ? (
                        <Textarea className="w-full" value={editingContent} onChange={e => setEditingContent((e.target as HTMLTextAreaElement).value)} rows={4} />
                      ) : (
                        <div className="whitespace-pre-wrap">{n.content}</div>
                      )}
                    </TableCell>
                    <TableCell>{new Date(n.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{n.updatedAt ? new Date(n.updatedAt).toLocaleString() : '—'}</TableCell>
                    <TableCell>
                      {editingId === n._id ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit} disabled={savingId === editingId}>{savingId === editingId ? <Spinner /> : 'Save'}</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => startEdit(n)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(n._id)}>Delete</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div>{total} notes</div>
          <div className="flex gap-2">
            <Button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
            <Button disabled={page * limit >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
        
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete note</DialogTitle>
              <DialogDescription>Are you sure you want to delete this note? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={deleteLoading}>
                {deleteLoading ? <Spinner /> : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </section>
  );
}
