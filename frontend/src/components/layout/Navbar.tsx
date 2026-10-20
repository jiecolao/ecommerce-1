import { Link, useLocation } from 'react-router-dom';
import { Heart, KeyRound, Search, ShoppingCart, ExternalLink, Store, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthSession } from '../../lib/auth';
import { Select } from '../ui/select';
import AdminAccountMenu from '../account/AdminAccountMenu';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller');
  const isAccountPage = ['/profile', '/wishlist', '/payment-methods', '/buyer/orders'].includes(location.pathname);

  const { user } = useAuthSession();

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    enabled: Boolean(user?.isBuyer),
    queryFn: async () => {
      const res = await api.get('/buyer/cart');
      return res.data;
    },
    staleTime: 5000,
  });

  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist'],
    enabled: Boolean(user?.isBuyer),
    queryFn: async () => {
      const res = await api.get('/buyer/wishlist');
      return res.data;
    },
    staleTime: 5000,
  });

  const cartCount = cartData?.orderLines?.reduce((sum: number, line: any) => sum + (line.quantity || 1), 0) ?? 0;
  const wishlistCount = Array.isArray(wishlistData) ? wishlistData.length : 0;

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email ? user.email.split('@')[0] : (isAdmin ? 'Admin Console' : 'My Account');
  const initials = user?.firstName ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase() : (isAdmin ? 'AD' : 'ME');

  return (
    <header className="sticky top-0 z-50 w-full border-b-[2.5px] border-[#0e0917] bg-[#150d22]/95 backdrop-blur shadow-[0_4px_0_#0e0917] print:hidden">
      <div className="mx-auto flex min-h-[72px] items-center gap-3 sm:gap-4 px-4 sm:px-8 max-w-[1440px]">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <Link to="/catalog" className="flex shrink-0 items-center gap-2.5 sm:gap-3 text-white group">
            <span className="grid h-10 w-10 place-items-center border-2 border-[#0e0917] bg-[#e5a93c] text-[#0e0917] shadow-[2.5px_2.5px_0_#0e0917] transition-transform group-hover:-translate-y-0.5 group-hover:shadow-[3.5px_3.5px_0_#0e0917]">
              <KeyRound className="h-5 w-5 stroke-[2.5]" />
            </span>
            <span className="font-display text-base font-black uppercase tracking-wider text-[#f2edf7] drop-shadow-[2px_2px_0_#0e0917] group-hover:text-[#f0b849] transition-colors">
              MystiKeys
            </span>
          </Link>

          {isAdmin && (
            <span className="hidden sm:inline-flex items-center gap-1 border-2 border-[#0e0917] bg-[#581c87] px-2 py-0.5 font-display text-[9px] font-black uppercase text-[#e5a93c] shadow-[1.5px_1.5px_0_#0e0917] tracking-wider">
              <ShieldCheck className="h-3 w-3" />
              Console
            </span>
          )}
        </div>

        {/* Unified Mode Switcher: Store & Admin Panel */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/catalog"
            className={`font-display flex items-center gap-1.5 px-3 py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all ${
              !isAdmin
                ? 'border-2 border-[#0e0917] bg-[#e5a93c] text-[#0e0917] shadow-[2.5px_2.5px_0_#0e0917]'
                : 'border-2 border-[#0e0917] bg-[#221437] text-[#d6c7ea] hover:bg-[#301b4c] hover:text-white hover:border-[#e5a93c] shadow-[2px_2px_0_#0e0917]'
            }`}
          >
            <Store className="h-3.5 w-3.5" />
            <span>Store</span>
          </Link>
          {user?.isAdmin && <Link
            to="/admin/dashboard"
            className={`font-display px-3 py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all ${
              isAdmin
                ? 'border-2 border-[#0e0917] bg-[#e5a93c] text-[#0e0917] shadow-[2.5px_2.5px_0_#0e0917]'
                : 'border-2 border-[#0e0917]/0 text-[#bdaecf] hover:border-[#0e0917] hover:bg-[#25153b] hover:text-white hover:shadow-[2.5px_2.5px_0_#0e0917]'
            }`}
          >
            Admin Panel
          </Link>}
        </nav>

        {/* ADMIN MODE HEADER VIEW */}
        {isAdmin ? (
          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            {/* Live Store Quick Preview */}
            <Link
              to="/catalog"
              className="comic-action-btn flex h-10 items-center gap-2 border-2 border-[#0e0917] bg-[#25153b] px-3.5 text-[10px] font-black uppercase text-[#e5a93c] hover:bg-[#341b52] hover:text-[#ffd45e] shadow-[2.5px_2.5px_0_#0e0917]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View Live Store</span>
            </Link>

            {/* Admin User Badge */}
            {user?.isAdmin && <AdminAccountMenu
              className="flex items-center gap-2.5 sm:gap-3 border-l-2 border-[#0e0917] pl-3"
            >
              <span className="grid h-10 w-10 place-items-center border-2 border-[#0e0917] bg-[#581c87] font-display text-[11px] font-black text-white shadow-[2px_2px_0_#0e0917]">
                {initials}
              </span>
              <span className="hidden md:block">
                <strong className="block text-xs text-[#f2edf7]">{displayName}</strong>
                <span className="block text-[10px] font-bold text-[#e5a93c]">Administrator</span>
              </span>
            </AdminAccountMenu>}
          </div>
        ) : (
          /* STORE MODE HEADER VIEW */
          <>
            <div className="ml-auto hidden h-11 max-w-[580px] flex-1 border-2 border-[#0e0917] bg-[#ede7f5] shadow-[3.5px_3.5px_0_#0e0917] transition-all focus-within:shadow-[4.5px_4.5px_0_#e5a93c] lg:flex">
              <div className="relative w-40 shrink-0 border-r-2 border-[#0e0917] bg-[#e1d7eb]">
                <Select
                  variant="navbar"
                  defaultValue="All Items"
                  options={['All Items', 'Game Keys', 'Top-Ups', 'Subscriptions']}
                  ariaLabel="Product category"
                  className="w-full h-full"
                />
              </div>
              <label className="flex min-w-0 flex-1 items-center gap-3 px-4">
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#170e24] outline-none placeholder:text-[#88789c]"
                  placeholder="Search for games, gift cards, or keys..."
                />
                <Search className="h-5 w-5 text-[#241338]" />
              </label>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 ml-auto lg:ml-0">
              <div className="hidden sm:block">
                <Select
                  variant="compact"
                  defaultValue="PHP"
                  options={['PHP', 'USD', 'EUR']}
                  ariaLabel="Select currency"
                  className="w-24"
                  triggerClassName="h-10 text-[10px] bg-[#25153b] text-[#e0d3ef] shadow-[2.5px_2.5px_0_#0e0917]"
                />
              </div>
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="relative grid h-10 w-10 place-items-center border-2 border-[#0e0917] bg-[#25153b] text-[#e0d3ef] shadow-[2.5px_2.5px_0_#0e0917] transition-all hover:-translate-y-0.5 hover:border-[#e5a93c] hover:text-[#f0b849] hover:shadow-[3.5px_3.5px_0_#0e0917]"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center border-2 border-[#0e0917] bg-[#e5a93c] px-1 font-display text-[10px] font-black text-[#0e0917] shadow-[1.5px_1.5px_0_#0e0917]">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                to="/checkout/cart"
                aria-label="Cart"
                className="relative grid h-10 w-10 place-items-center border-2 border-[#0e0917] bg-[#25153b] text-[#e0d3ef] shadow-[2.5px_2.5px_0_#0e0917] transition-all hover:-translate-y-0.5 hover:border-[#e5a93c] hover:text-[#f0b849] hover:shadow-[3.5px_3.5px_0_#0e0917]"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center border-2 border-[#0e0917] bg-[#e5a93c] px-1 font-display text-[10px] font-black text-[#0e0917] shadow-[1.5px_1.5px_0_#0e0917]">
                    {cartCount}
                  </span>
                )}
              </Link>
              {user?.isAdmin ? (
                <AdminAccountMenu className="flex items-center gap-3 border-l-2 border-[#0e0917] pl-3">
                  <span className="grid h-10 w-10 place-items-center border-2 border-[#0e0917] bg-[#581c87] font-display text-[11px] font-black text-white shadow-[2.5px_2.5px_0_#0e0917]">
                    {initials}
                  </span>
                  <span className="hidden sm:block">
                    <strong className="block text-sm text-[#f2edf7]">{displayName}</strong>
                    <span className="block text-[10px] text-[#a99bb5]">Administrator</span>
                  </span>
                </AdminAccountMenu>
              ) : user || isAccountPage ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-3 border-l-2 border-[#0e0917] pl-3"
                >
                  <span className="grid h-10 w-10 place-items-center border-2 border-[#0e0917] bg-[#581c87] font-display text-[11px] font-black text-white shadow-[2.5px_2.5px_0_#0e0917]">
                    {initials}
                  </span>
                  <span className="hidden sm:block">
                    <strong className="block text-sm text-[#f2edf7]">{displayName}</strong>
                    <span className="block text-[10px] text-[#a99bb5]">
                      {user?.role === 'admin' ? 'Administrator' : 'Shopper'}
                    </span>
                  </span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="comic-action-btn flex h-10 items-center bg-[#e5a93c] px-5 text-[11px] font-black uppercase text-[#0e0917] hover:bg-[#f0b849]"
                >
                  Login
                </Link>
              )}
            </div>
          </>
        )}
      </div>

      {/* Store mobile search bar */}
      {!isAdmin && (
        <label className="mx-5 mb-3 flex h-10 items-center gap-3 border-2 border-[#0e0917] bg-[#ede7f5] px-3 shadow-[3px_3px_0_#0e0917] focus-within:shadow-[4px_4px_0_#e5a93c] lg:hidden">
          <input
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#170e24] outline-none placeholder:text-[#88789c]"
            placeholder="Search games, cards, or keys..."
          />
          <Search className="h-4 w-4 text-[#241338]" />
        </label>
      )}
    </header>
  );
}
