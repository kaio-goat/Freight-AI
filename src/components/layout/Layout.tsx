
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Ship, Anchor, LayoutDashboard, FilePlus, History, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Layout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Forecast', path: '/forecast/new', icon: FilePlus },
    { name: 'Forecast History', path: '/history', icon: History },
    { name: 'Fleet Match', path: '/fleet', icon: Ship },
    { name: 'Routes', path: '/routes', icon: Anchor },
    { name: 'Market Intelligence', path: '/market', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center font-bold tracking-tighter">
              F//
            </div>
            <div>
              <div className="font-bold tracking-tight text-lg leading-tight">FREIGHT//IQ</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Procurement Intelligence</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-secondary text-secondary-foreground" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link 
            to="/data-sources" 
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Data Sources</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (simplified for prototype) */}
        <header className="md:hidden border-b border-border bg-card p-4 flex items-center justify-between sticky top-0 z-10">
          <Link to="/" className="flex items-center space-x-2">
            <div className="font-bold tracking-tight">FREIGHT//IQ</div>
          </Link>
          <div className="text-xs font-medium px-2 py-1 bg-secondary rounded-full">Menu</div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
