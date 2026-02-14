import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useAuth } from '../auth/useAuth';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { BookOpen, FileText, Settings, LogOut, User, Menu } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ProfileSetupDialog from './ProfileSetupDialog';
import { useGetCallerUserRole } from '../hooks/useQueries';

export default function AppLayout() {
  const navigate = useNavigate();
  const { profile, isAdmin, isEngineer, logout } = useAuth();
  const { data: userRole } = useGetCallerUserRole();
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
  };

  const navItems = [
    { label: 'Browse', path: '/', icon: BookOpen, show: true },
    { label: 'My Posts', path: '/my-posts', icon: FileText, show: isEngineer || isAdmin },
    { label: 'Admin', path: '/admin', icon: Settings, show: isAdmin },
  ];

  // Display role label based on UserRole enum
  const getRoleLabel = (role: string | undefined): string => {
    if (!role) return 'User';
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'user':
        return 'Engineer';
      case 'guest':
        return 'Support';
      default:
        return 'User';
    }
  };

  if (!profile) {
    return <ProfileSetupDialog />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/assets/generated/kb-logo.dim_512x512.png" 
                alt="KB Logo" 
                className="h-10 w-10"
              />
              <span className="font-bold text-lg hidden sm:inline">Knowledge Base</span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.filter(item => item.show).map(item => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => navigate({ to: item.path })}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu */}
            <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {navItems.filter(item => item.show).map(item => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => {
                        navigate({ to: item.path });
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{profile.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">{getRoleLabel(userRole)}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-6 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Knowledge Base Portal • Built with ❤️ using{' '}
            <a 
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
