'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
// REMOVA esta linha:
// import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Operações', icon: TrendingUp, href: '/dashboard/operacoes' },
  { name: 'Equipe', icon: Users, href: '/dashboard/equipe' },
  { name: 'Configurações', icon: Settings, href: '/dashboard/configuracoes' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
            <h1 className="text-xl font-bold">Trade Platform</h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-gray-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation - Usando div normal com overflow */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setSidebarOpen(false);
                    }}
                    className={`
                      flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-gray-800 text-white' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Info */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <img
                src={session.user?.image || '/default-avatar.png'}
                alt={session.user?.name || 'User'}
                className="h-10 w-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>
            <Button
              onClick={() => signOut({ callbackUrl: '/login' })}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center border-b bg-white px-6 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Trade Platform</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
