import { CreditCard, Heart, History, LogOut, Settings, UserRound } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const accountLinks = [
  { label: 'Profile information', icon: UserRound, to: '/profile' },
  { label: 'Wishlist', icon: Heart, to: '/wishlist' },
  { label: 'Purchase history', icon: History, to: '/buyer/orders' },
  { label: 'Payment methods', icon: CreditCard, to: '/payment-methods' },
  { label: 'Settings', icon: Settings, to: '#' },
];

type AccountSidebarProps = {
  email?: string;
  avatarUrl?: string | null;
};

export default function AccountSidebar({ email = 'john@example.com', avatarUrl }: AccountSidebarProps) {
  const location = useLocation();

  return (
    <aside className="lg:sticky lg:top-28">
      <div className="flex items-center gap-4 border-b-2 border-[#0e0917] pb-7">
        <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden border-2 border-[#0e0917] bg-[#581c87] font-display text-lg font-black text-[#f2edf7] shadow-[3.5px_3.5px_0_#0e0917]">
          {avatarUrl ? <img src={avatarUrl} alt="John Doe" className="h-full w-full object-cover" /> : 'JD'}
        </span>
        <div className="min-w-0">
          <p className="font-display font-black text-[#f2edf7] text-base">John Doe</p>
          <p className="mt-1 truncate text-xs font-semibold text-[#a99bb5]">{email}</p>
        </div>
      </div>

      <nav className="mt-7 space-y-2">
        {accountLinks.map(({ label, icon: Icon, to }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={label}
              to={to}
              className={`flex h-12 w-full items-center gap-3 px-4 text-left font-display text-xs font-black uppercase tracking-wider transition-all ${
                isActive
                  ? 'border-2 border-[#0e0917] bg-[#e5a93c] text-[#0e0917] shadow-[3px_3px_0_#0e0917]'
                  : 'border-2 border-transparent text-[#bdaecf] hover:border-[#0e0917] hover:bg-[#25153b] hover:text-[#f2edf7] hover:shadow-[3px_3px_0_#0e0917] hover:translate-x-1'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          );
        })}
      </nav>

      <button className="mt-7 flex h-12 w-full items-center gap-3 border-t-2 border-[#0e0917] px-4 pt-6 font-display text-xs font-black uppercase tracking-wider text-[#8f8398] hover:text-[#e5a93c] transition-colors cursor-pointer">
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </aside>
  );
}
