import { lazy, Suspense } from 'react';
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
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import VerifyEmailPage from './pages/Auth/VerifyEmailPage';
import OrdersPage from './pages/buyer/OrdersPage';
import ProductsPage from './pages/seller/ProductsPage';
import CreateProductPage from './pages/seller/CreateProductPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import CustomersPage from './pages/seller/CustomersPage';
import ActivityLogsPage from './pages/seller/ActivityLogsPage';
import PromoTestPage from './pages/PromoTestPage';
import { Toaster } from './components/ui/toaster';
import { Auth } from './pages/Auth/Auth';
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

const DashboardPage = lazy(() => import('./pages/seller/DashboardPage'));

function AppShell() {
  const location = useLocation();
  const isCatalog = location.pathname === '/catalog' || location.pathname === '/';
  const isAuth = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(location.pathname);
  const isSeller = location.pathname.startsWith('/seller') || location.pathname.startsWith('/test/seller');

  return (
    <>
      <div className="flex min-h-screen flex-col bg-[#1c191f] text-[#f4eef9]">
        {!isAuth && !isSeller && <Navbar />}
        <main className={isAuth || isCatalog || isSeller ? 'flex-1' : 'app-page flex-1'}>
          <Routes>
            {/* Buyer Routes */}
            <Route path="/" element={<CatalogPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/checkout/cart" element={<CartPage />} />
            <Route path="/checkout/success" element={<OrderCompletePage />} />
            <Route path="/checkout/:id" element={<CheckoutPage />} />
            <Route path="/buyer/orders" element={<OrdersPage />} />
            <Route path="/promo-test" element={<PromoTestPage />} />
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

            {/* Seller Routes */}
            <Route path="/seller" element={<Navigate to="/seller/products" replace />} />
            <Route path="/seller/dashboard" element={<Suspense fallback={<div className="font-display p-10 text-center text-[#f4b72b]">Loading analytics...</div>}><DashboardPage /></Suspense>} />
            <Route path="/seller/products" element={<ProductsPage />} />
            <Route path="/seller/products/new" element={<CreateProductPage />} />
            <Route path="/seller/products/:id/edit" element={<CreateProductPage />} />
            <Route path="/seller/orders" element={<SellerOrdersPage />} />
            <Route path="/seller/customers" element={<CustomersPage />} />
            <Route path="/seller/activity-logs" element={<ActivityLogsPage />} />

            {/* Admin Routes (upstream's pages, accessible for reference) */}
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/products/new" element={<AdminCreateProductPage />} />

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
        {!isAuth && !isSeller && <Footer />}
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
