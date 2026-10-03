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
      <div className="flex items-center gap-4 border-b border-[#49345d] pb-7">
        <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden border-2 border-[#f4b72b] bg-[#6b2fa2] font-display text-lg font-black text-white">
          {avatarUrl ? <img src={avatarUrl} alt="John Doe" className="h-full w-full object-cover" /> : 'JD'}
        </span>
        <div className="min-w-0">
          <p className="font-bold text-white">John Doe</p>
          <p className="mt-1 truncate text-sm text-[#a99bb5]">{email}</p>
        </div>
      </div>

      <nav className="mt-7 space-y-2">
        {accountLinks.map(({ label, icon: Icon, to }) => {
          const isActive = location.pathname === to;
          return (
            <Link key={label} to={to} className={`flex h-12 w-full items-center gap-3 px-4 text-left text-sm font-bold transition-transform hover:translate-x-1 ${isActive ? 'bg-[#f4b72b] text-[#171419]' : 'text-[#a99bb5] hover:bg-[#2b2130] hover:text-white'}`}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          );
        })}
      </nav>

      <button className="mt-7 flex h-12 w-full items-center gap-3 border-t border-[#49345d] px-4 pt-6 text-sm font-bold text-[#8f8398] hover:text-[#f4b72b]">
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </aside>
  );
}
