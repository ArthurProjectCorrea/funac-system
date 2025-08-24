'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '../../components/app-sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/signin');
    }
  }, [router]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
