import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import CatalogPage from './pages/buyer/CatalogPage';
import ProductDetailsPage from './pages/buyer/ProductDetailsPage';
import CheckoutPage from './pages/buyer/CheckoutPage';
import OrdersPage from './pages/buyer/OrdersPage';
import DashboardPage from './pages/seller/DashboardPage';
import ProductsPage from './pages/seller/ProductsPage';
import CreateProductPage from './pages/seller/CreateProductPage';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            {/* Buyer Routes */}
            <Route path="/" element={<CatalogPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/checkout/:id" element={<CheckoutPage />} />
            <Route path="/buyer/orders" element={<OrdersPage />} />
            
            {/* Seller Routes */}
            <Route path="/seller/dashboard" element={<DashboardPage />} />
            <Route path="/seller/products" element={<ProductsPage />} />
            <Route path="/seller/products/new" element={<CreateProductPage />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
