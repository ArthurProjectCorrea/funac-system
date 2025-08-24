import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Users, LogOut, Home } from 'lucide-react';
export function AppSidebar() {
  const items = [
    {
      title: 'Home',
      url: '/dashboard',
      icon: Home,
    },
    {
      title: 'Perfil',
      url: '/dashboard/profile',
      icon: User,
    },
    {
      title: 'Usuários',
      url: '/dashboard/users',
      icon: Users,
    },
  ];
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    setMounted(true);
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/signin');
  };
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // usePathname sempre reflete a rota atual, mesmo em navegação client-side
                const isActive = mounted && pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-2 transition-colors ${mounted && isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
                        aria-current={mounted && isActive ? 'page' : undefined}
                      >
                        <item.icon
                          className={`w-4 h-4 ${mounted && isActive ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="flex items-center gap-2 w-full justify-start"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* SidebarFooter removido para evitar botão duplicado */}
    </Sidebar>
  );
}
