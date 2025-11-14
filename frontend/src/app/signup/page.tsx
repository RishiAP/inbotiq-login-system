"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'admin']),
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { handleSubmit } = form;

  async function onSubmit(values: FormValues) {
    try {
      // call API and wait for response
      const res = await api.post('/auth/signup', values);
      const message = res?.data?.message ?? 'Signed up successfully';
      toast.success(message);

      // only redirect when we have a user object in the response
      if (res.status === 201 && res.data?.user) {
        router.push('/dashboard');
      } else {
        console.warn('Signup returned unexpected response', res);
      }
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const status = err.response?.status;
      const message = err.response?.data?.message ?? err.message ?? 'Signup failed';
      if (status === 409) {
        form.setError('email', { type: 'server', message });
      } else {
        toast.error(message);
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4">Sign up</h2>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-busy={form.formState.isSubmitting}>
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} onChange={field.onChange} disabled={form.formState.isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} value={field.value ?? ''} onChange={field.onChange} disabled={form.formState.isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} value={field.value ?? ''} onChange={field.onChange} disabled={form.formState.isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="role"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select onValueChange={(val) => field.onChange(val)} value={field.value ?? ''} disabled={form.formState.isSubmitting}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Button type="submit">
                <Spinner
                  loading={form.formState.isSubmitting}
                  text="Sign up"
                  textPosition="right"
                />
              </Button>
            </div>
            <div className="text-sm text-center mt-2">
              <span>Already have an account? </span>
              <Link href="/login" className="text-blue-600 hover:underline">
                Log in
              </Link>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
