import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
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
          <CardTitle style={{ fontSize: 28, fontWeight: 700 }}>
            Bem-vindo ao Sistema FUNAC
          </CardTitle>
        </CardHeader>
        <CardContent
          style={{
            padding: '0 32px 32px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', width: '100%' }}>
            <Link href="/auth/signin">
              <Button variant="default" size="lg" style={{ width: 140 }}>
                Entrar
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="secondary" size="lg" style={{ width: 140 }}>
                Cadastrar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
