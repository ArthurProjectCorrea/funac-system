'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = { name, email, password };
      console.log('Enviando para API:', payload);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('Status da resposta:', res.status);
      const resBody = await res
        .clone()
        .json()
        .catch(() => null);
      console.log('Resposta da API:', resBody);
      if (!res.ok) {
        let apiError = 'Erro ao cadastrar';
        try {
          const errJson = await res.clone().json();
          if (errJson && errJson.message) {
            apiError = errJson.message;
          }
          // eslint-disable-next-line no-empty
        } catch {}
        setError(apiError);
        return;
      }
      setSuccess('Cadastro realizado! Faça login.');
      setTimeout(() => router.push('/auth/signin'), 1500);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Erro ao cadastrar');
    }
  };

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f6fa',
      }}
    >
      <Card
        style={{
          minWidth: 420,
          maxWidth: 480,
          width: '100%',
          padding: 0,
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
        }}
      >
        <CardHeader style={{ padding: '32px 32px 16px 32px', textAlign: 'center' }}>
          <CardTitle style={{ fontSize: 24, fontWeight: 700 }}>Cadastrar</CardTitle>
        </CardHeader>
        <CardContent style={{ padding: '0 32px 32px 32px' }}>
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="name" style={{ fontWeight: 500 }}>
                Nome
              </label>
              <input
                id="name"
                type="text"
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="email" style={{ fontWeight: 500 }}>
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="password" style={{ fontWeight: 500 }}>
                Senha
              </label>
              <input
                id="password"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', width: '100%' }}
              />
            </div>
            <Button type="submit" variant="secondary" size="lg" style={{ width: '100%' }}>
              Cadastrar
            </Button>
            {error && (
              <Alert variant="destructive" style={{ marginTop: 12 }}>
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="default" style={{ marginTop: 12 }}>
                <AlertTitle>Sucesso</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <span style={{ fontSize: 15 }}>
                Já tem uma conta?{' '}
                <Link
                  href="/auth/signin"
                  style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'underline' }}
                >
                  Entrar
                </Link>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
