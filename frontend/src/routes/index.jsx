import { createBrowserRouter, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

import Home from '../pages/Home';
import Shop from '../pages/Shop';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Dashboard from '../pages/Dashboard';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Wishlist from '../pages/Wishlist';
import OrderTracking from '../pages/OrderTracking';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminCoupons from '../pages/admin/AdminCoupons';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminBanners from '../pages/admin/AdminBanners';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'shop', element: <Shop /> },
      { path: 'product/:slug', element: <ProductDetails /> },
      { path: 'cart', element: <Cart /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'login', element: <Login /> },
      { path: 'track-order', element: <OrderTracking /> },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'wishlist',
        element: (
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'coupons', element: <AdminCoupons /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'banners', element: <AdminBanners /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export default router;
