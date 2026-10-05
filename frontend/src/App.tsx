import { useEffect } from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CatalogPage from './pages/buyer/CatalogPage';
import ProductDetailsPage from './pages/buyer/ProductDetailsPage';
import CheckoutPage from './pages/buyer/CheckoutPage';
import CartPage from './pages/buyer/CartPage';
import OrderCompletePage from './pages/buyer/OrderCompletePage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/buyer/ProfilePage';
import WishlistPage from './pages/buyer/WishlistPage';
import PaymentMethodsPage from './pages/buyer/PaymentMethodsPage';
import FAQPage from './pages/FAQPage';
import ContactSupportPage from './pages/ContactSupportPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import OrdersPage from './pages/buyer/OrdersPage';
import { Toaster } from './components/ui/toaster';
import { Auth } from './pages/auth/Auth';
import CatalogPageOriginal from './pages/test/CatalogPageOriginal';
import ProductDetailsPageOriginal from './pages/test/ProductDetailsPageOriginal';
import CheckoutPageOriginal from './pages/test/CheckoutPageOriginal';
import OrdersPageOriginal from './pages/test/OrdersPageOriginal';
import DashboardPageOriginal from './pages/test/DashboardPageOriginal';
import ProductsPageOriginal from './pages/test/ProductsPageOriginal';
import CreateProductPageOriginal from './pages/test/CreateProductPageOriginal';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import AdminCreateProductPage from './pages/admin/CreateProductPage';
import AdminActivityLogsPage from './pages/admin/ActivityLogsPage';
import AdminOrdersPage from './pages/admin/SellerOrdersPage';
import AdminCustomersPage from './pages/admin/CustomersPage';
import ComicPageDecorations from './components/layout/ComicPageDecorations';

function AppShell() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const isCatalog = location.pathname === '/catalog' || location.pathname === '/';
  const isAuth = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(location.pathname);
  const isAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller');
  return (
    <>
      <div className="comic-page-bg relative flex min-h-screen flex-col text-[#eee8f5]">
        <ComicPageDecorations />
        {!isAuth && <Navbar />}
        <main className={`relative z-10 ${isAuth || isCatalog || isAdmin ? 'flex-1 w-full flex flex-col' : 'app-page flex-1'}`}>
          <Routes>
            {/* Buyer Routes */}
            <Route path="/" element={<CatalogPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/checkout/cart" element={<CartPage />} />
            <Route path="/checkout/success" element={<OrderCompletePage />} />
            <Route path="/checkout/:id" element={<CheckoutPage />} />
            <Route path="/buyer/orders" element={<OrdersPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/payment-methods" element={<PaymentMethodsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactSupportPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Auth (upstream) */}
            <Route path="/auth" element={<Auth />} />

            {/* Seller / Admin Routes (Standardized) */}
            <Route path="/seller" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/seller/dashboard" element={<AdminDashboardPage />} />
            <Route path="/seller/products" element={<AdminProductsPage />} />
            <Route path="/seller/products/new" element={<AdminCreateProductPage />} />
            <Route path="/seller/products/:id/edit" element={<AdminCreateProductPage />} />
            <Route path="/seller/orders" element={<AdminOrdersPage />} />
            <Route path="/seller/customers" element={<AdminCustomersPage />} />
            <Route path="/seller/activity-logs" element={<AdminActivityLogsPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/products/new" element={<AdminCreateProductPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/customers" element={<AdminCustomersPage />} />
            <Route path="/admin/activity-logs" element={<AdminActivityLogsPage />} />

            {/* Test Routes — original team's pages preserved for reference */}
            <Route path="/test/catalog" element={<CatalogPageOriginal />} />
            <Route path="/test/product/:id" element={<ProductDetailsPageOriginal />} />
            <Route path="/test/checkout/:id" element={<CheckoutPageOriginal />} />
            <Route path="/test/orders" element={<OrdersPageOriginal />} />
            <Route path="/test/seller/dashboard" element={<DashboardPageOriginal />} />
            <Route path="/test/seller/products" element={<ProductsPageOriginal />} />
            <Route path="/test/seller/products/new" element={<CreateProductPageOriginal />} />
          </Routes>
        </main>
        {!isAuth && !isAdmin && <Footer />}
      </div>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
