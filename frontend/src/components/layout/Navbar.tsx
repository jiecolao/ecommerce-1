import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Heart, KeyRound, Search, ShoppingCart } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isSeller = location.pathname.startsWith('/seller');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#49345d] bg-[#18151b]/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center gap-4 px-5 sm:px-8">
        <Link to="/catalog" className="flex shrink-0 items-center gap-3 text-white">
          <KeyRound className="h-6 w-6 text-[#f4b72b]" />
          <span className="font-display text-sm font-black uppercase sm:text-base">MystiKeys</span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          <Link
            to="/catalog"
            className={`font-display text-[10px] font-bold uppercase ${!isSeller ? 'text-[#f4b72b]' : 'text-[#9d90a8] hover:text-white'}`}
          >
            Store
          </Link>
          <Link
            to="/seller/dashboard"
            className={`font-display text-[10px] font-bold uppercase ${isSeller ? 'text-[#f4b72b]' : 'text-[#9d90a8] hover:text-white'}`}
          >
            Seller
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
          <Link to="/buyer/orders" aria-label="Wishlist" className="relative grid h-10 w-10 place-items-center text-[#b9adc4] hover:text-[#f4b72b]">
            <Heart className="h-5 w-5" />
            <span className="absolute right-0 top-0 text-[9px] font-bold text-[#f4b72b]">0</span>
          </Link>
          <Link to="/checkout/cart" aria-label="Cart" className="relative grid h-10 w-10 place-items-center text-[#b9adc4] hover:text-[#f4b72b]">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute right-0 top-0 text-[9px] font-bold text-[#f4b72b]">2</span>
          </Link>
          <button className="font-display h-10 border border-[#675376] bg-[#242027] px-4 text-[10px] font-bold uppercase text-white transition-colors hover:border-[#f4b72b] sm:px-6">
            Login
          </button>
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
