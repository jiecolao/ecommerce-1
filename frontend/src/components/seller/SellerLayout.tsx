import type { ReactNode } from 'react';
import { Activity, BarChart3, Box, LogOut, PackagePlus, ShoppingBag, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Products', icon: Box, to: '/admin/products' },
  { label: 'Add product', icon: PackagePlus, to: '/admin/products/new' },
  { label: 'Orders', icon: ShoppingBag, to: '/admin/orders' },
  { label: 'Customers', icon: Users, to: '/admin/customers' },
  { label: 'Analytics', icon: BarChart3, to: '/admin/dashboard' },
  { label: 'Activity logs', icon: Activity, to: '/admin/activity-logs' },
];

type SellerLayoutProps = {
  children: ReactNode;
  pageName: string;
  contentClassName?: string;
};

export default function SellerLayout({ children, pageName: _pageName, contentClassName }: SellerLayoutProps) {
  const location = useLocation();

  const isItemActive = (to: string) => {
    if (to === '/admin/products/new') {
      return location.pathname === '/admin/products/new' || location.pathname === '/seller/products/new';
    }
    if (to === '/admin/products') {
      return (
        (location.pathname === '/admin/products' || location.pathname === '/seller/products') ||
        (location.pathname.startsWith('/admin/products/') && location.pathname !== '/admin/products/new')
      );
    }
    if (to === '/admin/orders') {
      return location.pathname === '/admin/orders' || location.pathname === '/seller/orders';
    }
    if (to === '/admin/customers') {
      return location.pathname === '/admin/customers' || location.pathname === '/seller/customers';
    }
    if (to === '/admin/dashboard') {
      return (
        location.pathname === '/admin/dashboard' ||
        location.pathname === '/seller/dashboard' ||
        location.pathname === '/admin' ||
        location.pathname === '/seller'
      );
    }
    if (to === '/admin/activity-logs') {
      return location.pathname === '/admin/activity-logs' || location.pathname === '/seller/activity-logs';
    }
    return location.pathname === to;
  };

  return (
    <div className="w-full flex-1 flex flex-col lg:flex-row text-[#eee8f5] min-h-[calc(100vh-72px)]">
      {/* Sidebar */}
      <aside className="w-full lg:w-60 xl:w-64 shrink-0 border-b-2 lg:border-b-0 lg:border-r-2 border-[#0e0917] bg-[#140c1f]/95 backdrop-blur flex flex-col lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)]">
        <div className="hidden lg:flex items-center justify-between px-5 py-4 border-b-2 border-[#0e0917] bg-[#1d122d]">
          <span className="font-display text-[10px] font-black uppercase tracking-wider text-[#e5a93c]">Console Nav</span>
          <span className="border border-[#0e0917] bg-[#581c87] px-2 py-0.5 font-display text-[8px] font-bold text-white uppercase shadow-[1.5px_1.5px_0_#0e0917]">
            Active
          </span>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-3 lg:mt-2 lg:flex-col lg:overflow-visible lg:px-3">
          {navItems.map(({ label, icon: Icon, to }) => {
            const isActive = isItemActive(to);
            return (
              <Link
                key={label}
                to={to}
                className={`flex h-11 shrink-0 items-center gap-3 px-4 font-display text-[11px] uppercase tracking-wider transition-all ${
                  isActive
                    ? 'border-2 border-[#0e0917] bg-[#e5a93c] text-[#0e0917] shadow-[2.5px_2.5px_0_#0e0917] font-black'
                    : 'border-2 border-transparent text-[#bdaecf] hover:border-[#0e0917] hover:bg-[#25153b] hover:text-white hover:shadow-[2px_2px_0_#0e0917] font-bold'
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>

        <Link
          to="/catalog"
          className="mt-auto hidden lg:flex items-center gap-2.5 border-t-2 border-[#0e0917] bg-[#1a0f2b] px-5 py-4 font-display text-[10px] font-bold uppercase text-[#a99bb5] hover:text-[#f0b849] hover:bg-[#26153e] transition-colors"
        >
          <LogOut className="h-4 w-4" /> Return to Store
        </Link>
      </aside>

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 flex flex-col bg-transparent">
        <main className={`flex-1 ${contentClassName ?? 'p-5 sm:p-7 lg:p-9'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
