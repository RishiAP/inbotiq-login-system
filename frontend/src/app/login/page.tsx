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
  email: z.email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { handleSubmit } = form;

  async function onSubmit(values: FormValues) {
    try {
      const res = await api.post('/auth/login', values);
      const message = res?.data?.message ?? 'Logged in successfully';
      toast.success(message);

      if (res.status === 200 && res.data?.user) {
        router.push('/dashboard');
      } else {
        console.warn('Login returned unexpected response', res);
      }
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const message = err.response?.data?.message ?? err.message ?? 'Login failed';
      if (err.response?.status === 401) {
        // Invalid credentials: show a top-level notification rather than mapping to both fields
        toast.error(message);
      } else {
        toast.error(message);
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4">Log in</h2>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-busy={form.formState.isSubmitting}>
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

            <div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Spinner
                  loading={form.formState.isSubmitting}
                  text="Login"
                  textPosition="right"
                />
              </Button>
            </div>
            <div className="text-sm text-center mt-2">
              <span>Don&apos;t have an account? </span>
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
