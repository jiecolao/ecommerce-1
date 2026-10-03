import type { ReactNode } from 'react';
import { Activity, BarChart3, Box, ChevronRight, KeyRound, LogOut, PackagePlus, ShoppingBag, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Products', icon: Box, to: '/seller/products' },
  { label: 'Add product', icon: PackagePlus, to: '/seller/products/new' },
  { label: 'Orders', icon: ShoppingBag, to: '/seller/orders' },
  { label: 'Customers', icon: Users, to: '/seller/customers' },
  { label: 'Analytics', icon: BarChart3, to: '/seller/dashboard' },
  { label: 'Activity logs', icon: Activity, to: '/seller/activity-logs' },
];

type SellerLayoutProps = {
  children: ReactNode;
  pageName: string;
};

export default function SellerLayout({ children, pageName }: SellerLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#1c191f] text-[#f4eef9] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-[#49345d] bg-[#171419] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <Link to="/seller/products" className="flex h-18 items-center gap-3 border-b border-[#49345d] px-5 text-white">
          <span className="grid h-10 w-10 place-items-center bg-[#f4b72b] text-[#171419]"><KeyRound className="h-5 w-5" /></span>
          <span className="font-display text-sm font-black uppercase">MystiKeys</span>
        </Link>
        <p className="hidden px-5 pt-6 font-display text-[8px] font-bold uppercase text-[#756b7b] lg:block">Management</p>
        <nav className="flex gap-2 overflow-x-auto p-3 lg:mt-2 lg:flex-col lg:overflow-visible lg:px-3">
          {navItems.map(({ label, icon: Icon, to }) => {
            const isActive = location.pathname === to;
            return (
              <Link key={label} to={to} className={`flex h-11 shrink-0 items-center gap-3 px-4 text-sm font-bold transition-transform hover:translate-x-0.5 ${isActive ? 'bg-[#f4b72b] text-[#171419]' : 'text-[#a99bb5] hover:bg-[#252028] hover:text-white'}`}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <Link to="/catalog" className="mt-auto hidden h-14 items-center gap-3 border-t border-[#49345d] px-6 text-sm font-bold text-[#8f8398] hover:text-[#f4b72b] lg:flex"><LogOut className="h-4 w-4" /> Exit management</Link>
      </aside>

      <div className="min-w-0">
        <header className="flex h-18 items-center justify-between border-b border-[#49345d] bg-[#211d23] px-5 sm:px-7">
          <div className="flex items-center gap-2 text-sm text-[#8f8398]"><span>Management</span><ChevronRight className="h-4 w-4" /><strong className="text-white">{pageName}</strong></div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center bg-[#6b2fa2] font-display text-[9px] font-black text-white">AU</span>
            <span className="hidden sm:block"><strong className="block text-sm text-white">Admin User</strong><span className="block text-[10px] text-[#8f8398]">MystiKeys Administrator</span></span>
          </div>
        </header>
        <main className="p-5 sm:p-7 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
