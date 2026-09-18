import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CatalogPage from './pages/buyer/CatalogPage';
import ProductDetailsPage from './pages/buyer/ProductDetailsPage';
import CheckoutPage from './pages/buyer/CheckoutPage';
import OrdersPage from './pages/buyer/OrdersPage';
import DashboardPage from './pages/seller/DashboardPage';
import ProductsPage from './pages/seller/ProductsPage';
import CreateProductPage from './pages/seller/CreateProductPage';
import PromoTestPage from './pages/PromoTestPage';
import { Toaster } from './components/ui/toaster';

function AppShell() {
  const location = useLocation();
  const isCatalog = location.pathname === '/catalog' || location.pathname === '/';

  return (
    <>
      <div className="flex min-h-screen flex-col bg-[#1c191f] text-[#f4eef9]">
        <Navbar />
        <main className={isCatalog ? 'flex-1' : 'app-page flex-1'}>
          <Routes>
            {/* Buyer Routes */}
            <Route path="/" element={<CatalogPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/checkout/:id" element={<CheckoutPage />} />
            <Route path="/buyer/orders" element={<OrdersPage />} />
            <Route path="/promo-test" element={<PromoTestPage />} />

            {/* Seller Routes */}
            <Route path="/seller/dashboard" element={<DashboardPage />} />
            <Route path="/seller/products" element={<ProductsPage />} />
            <Route path="/seller/products/new" element={<CreateProductPage />} />
          </Routes>
        </main>
        <Footer />
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
