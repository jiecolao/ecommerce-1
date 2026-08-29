import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, ShoppingCart, LineChart } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto flex h-14 items-center px-4 sm:px-8">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2 text-slate-900">
            <Gamepad2 className="h-6 w-6 text-purple-600" />
            <span className="hidden font-bold sm:inline-block">GameKeyVault</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className={`transition-colors hover:text-slate-900 ${
                !isAdmin ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              Storefront
            </Link>
            <Link
              to="/admin/dashboard"
              className={`transition-colors hover:text-slate-900 ${
                isAdmin ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              Admin Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center">
            {!isAdmin ? (
              <>
                <Link to="/buyer/wishlist" className="text-sm font-medium text-slate-600 hover:text-slate-900 mr-4">
                  Wishlist
                </Link>
                <Link to="/buyer/orders" className="text-sm font-medium text-slate-600 hover:text-slate-900 mr-4">
                  My Games
                </Link>
                <Link to="/checkout/cart" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-slate-100 hover:text-slate-900 h-9 w-9">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Cart</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/admin/products" className="text-sm font-medium text-slate-600 hover:text-slate-900 mr-4">
                  Manage Keys
                </Link>
                <Link to="/admin/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  <LineChart className="h-5 w-5 inline mr-1" />
                  Metrics
                </Link>
              </>
            )}
            <Link to="/auth" className="ml-6 text-sm font-medium text-blue-600 hover:text-blue-700">
              Login / Signup
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

