'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface User {
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
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
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Carregando...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-col items-center">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <CardTitle>{user.name || 'Usuário'}</CardTitle>
          <div className="text-muted-foreground mb-2">{user.email}</div>
          <Badge className="mt-2" variant="secondary">
            {user.role}
          </Badge>
        </CardHeader>
      </Card>
    </div>
  );
}
