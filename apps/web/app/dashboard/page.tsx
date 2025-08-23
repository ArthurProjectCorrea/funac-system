'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Dashboard() {
  interface User {
    name: string;
    email: string;
    role: string;
  }
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/signin');
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Não autenticado');
        setUser(await res.json());
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/auth/signin');
      });
  }, [router]);

  if (!user)
    return (
      <Card className="max-w-md mx-auto mt-20">
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
        </CardHeader>
      </Card>
    );

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="max-w-md mx-auto mt-20">
        <CardHeader>
          <CardTitle>Bem-vindo, {user.name}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Você está logado como <b>{user.email}</b>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
