import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Heart, KeyRound, Search, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api, { getStoredUser, type StoredUser } from '../../lib/api';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller');
  const isAccountPage = ['/profile', '/wishlist', '/payment-methods', '/buyer/orders'].includes(location.pathname);

  const [user, setUser] = useState<StoredUser | null>(getStoredUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };
    window.addEventListener('auth-state-change', handleAuthChange);
    return () => window.removeEventListener('auth-state-change', handleAuthChange);
  }, []);

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/buyer/cart');
      return res.data;
    },
    staleTime: 5000,
  });

  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('/buyer/wishlist');
      return res.data;
    },
    staleTime: 5000,
  });

  const cartCount = cartData?.orderLines?.reduce((sum: number, line: any) => sum + (line.quantity || 1), 0) ?? 0;
  const wishlistCount = Array.isArray(wishlistData) ? wishlistData.length : 0;

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email ? user.email.split('@')[0] : 'Member';
  const initials = user?.firstName ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#49345d] bg-[#18151b]/95 backdrop-blur print:hidden">
      <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center gap-4 px-5 sm:px-8">
        <Link to="/catalog" className="flex shrink-0 items-center gap-3 text-white">
          <KeyRound className="h-6 w-6 text-[#f4b72b]" />
          <span className="font-display text-sm font-black uppercase sm:text-base">MystiKeys</span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          <Link
            to="/catalog"
            className={`font-display text-[10px] font-bold uppercase ${!isAdmin ? 'text-[#f4b72b]' : 'text-[#9d90a8] hover:text-white'}`}
          >
            Store
          </Link>
          <Link
            to="/admin/dashboard"
            className={`font-display text-[10px] font-bold uppercase ${isAdmin ? 'text-[#f4b72b]' : 'text-[#9d90a8] hover:text-white'}`}
          >
            Admin Panel
          </Link>
        </nav>

        <div className="ml-auto hidden h-11 max-w-[620px] flex-1 border border-[#675376] bg-[#f7f4f8] lg:flex">
          <label className="relative flex w-36 shrink-0 items-center border-r border-[#b8aebe] bg-white px-3">
            <select aria-label="Product category" className="h-full w-full appearance-none bg-transparent pr-5 text-xs font-semibold text-[#403747] outline-none">
              <option>All Categories</option>
              <option>Game Keys</option>
              <option>Top-Ups</option>
              <option>Subscriptions</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[#756681]" />
          </label>
          <label className="flex min-w-0 flex-1 items-center gap-3 px-4">
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#2b2430] outline-none placeholder:text-[#9c92a3]"
              placeholder="Search for games, gift cards, or keys..."
            />
            <Search className="h-5 w-5 text-[#6f6179]" />
          </label>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="font-display hidden h-10 items-center gap-1 px-2 text-[10px] font-bold text-[#c8bdcf] hover:text-white sm:flex">
            PHP <ChevronDown className="h-3 w-3" />
          </button>
          <Link to="/wishlist" aria-label="Wishlist" className="relative grid h-10 w-10 place-items-center text-[#b9adc4] hover:text-[#f4b72b]">
            <Heart className="h-5 w-5" />
            <span className="absolute right-0 top-0 text-[9px] font-bold text-[#f4b72b]">{wishlistCount}</span>
          </Link>
          <Link to="/checkout/cart" aria-label="Cart" className="relative grid h-10 w-10 place-items-center text-[#b9adc4] hover:text-[#f4b72b]">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute right-0 top-0 text-[9px] font-bold text-[#f4b72b]">{cartCount}</span>
          </Link>
          {user || isAccountPage ? (
            <Link to="/profile" className="flex items-center gap-3 border-l border-[#49345d] pl-3">
              <span className="grid h-10 w-10 place-items-center bg-[#6b2fa2] font-display text-[10px] font-black text-white">{initials}</span>
              <span className="hidden sm:block">
                <strong className="block text-sm text-white">{displayName}</strong>
                <span className="block text-[10px] text-[#a99bb5]">{user?.role === 'admin' ? 'Administrator' : 'Shopper'}</span>
              </span>
            </Link>
          ) : (
            <Link to="/login" className="font-display flex h-10 items-center border border-[#675376] bg-[#242027] px-4 text-[10px] font-bold uppercase text-white transition-colors hover:border-[#f4b72b] sm:px-6">
              Login
            </Link>
          )}
        </div>
      </div>

      <label className="mx-5 mb-3 flex h-10 items-center gap-3 border border-[#675376] bg-[#f7f4f8] px-3 lg:hidden">
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-[#2b2430] outline-none placeholder:text-[#9c92a3]"
          placeholder="Search games, cards, or keys..."
        />
        <Search className="h-4 w-4 text-[#6f6179]" />
      </label>
    </header>
  );
}
