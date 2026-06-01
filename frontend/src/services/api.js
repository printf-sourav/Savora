import axios from 'axios';
const getStore = () => import('../redux/store').then((m) => m.default);
const getPerformLogout = () => import('../redux/slices/authSlice').then((m) => m.performLogout);

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => { error ? prom.reject(error) : prom.resolve(); });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const message = error.response?.data?.message || error.message || 'Something went wrong';

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh-token') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/firebase-login') &&
      !originalRequest.url?.includes('/auth/logout')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => { failedQueue.push({ resolve, reject }); })
          .then(() => API(originalRequest))
          .catch(() => Promise.reject({ message: 'Session expired', status: 401 }));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        await axios.post(`${import.meta.env.VITE_API_URL || '/api'}/auth/refresh-token`, {}, { withCredentials: true });
        processQueue(null);
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        const [s, logoutThunk] = await Promise.all([getStore(), getPerformLogout()]);
        s.dispatch(logoutThunk());
        if (!window.location.pathname.includes('/login')) window.location.href = '/login';
        return Promise.reject({ message: 'Session expired. Please log in again.', status: 401 });
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject({ message, status: error.response?.status });
  }
);

// ===== Auth API =====
export const authAPI = {
  firebaseLogin: (data) => API.post('/auth/firebase-login', data),
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  logout: () => API.post('/auth/logout'),
  verifyEmail: (token) => API.get(`/auth/verify-email/${token}`),
  refreshToken: () => API.post('/auth/refresh-token'),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (token, data) => API.post(`/auth/reset-password/${token}`, data),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
  // Address book
  addAddress: (data) => API.post('/auth/addresses', data),
  updateAddress: (id, data) => API.put(`/auth/addresses/${id}`, data),
  deleteAddress: (id) => API.delete(`/auth/addresses/${id}`),
  setDefaultAddress: (id) => API.put(`/auth/addresses/${id}/default`),
  // Wishlist (TASK 4)
  addToWishlist: (productId) => API.post(`/auth/wishlist/${productId}`),
  removeFromWishlist: (productId) => API.delete(`/auth/wishlist/${productId}`),
  // Cart sync (TASK 6)
  getCart: () => API.get('/auth/cart'),
  syncCart: (cart) => API.put('/auth/cart', { cart }),
};

// ===== Product API =====
export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getBySlug: (slug) => API.get(`/products/slug/${slug}`),
};

// ===== Order API =====
export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getMyOrders: () => API.get('/orders/my'),
  getById: (id) => API.get(`/orders/${id}`),
  cancel: (id) => API.put(`/orders/${id}/cancel`),
};

// ===== Payment API (TASK 1) =====
export const paymentAPI = {
  createRazorpayOrder: (data) => API.post('/payments/create-order', data),
  verifyPayment: (data) => API.post('/payments/verify', data),
};

// ===== Coupon API =====
export const couponAPI = {
  validate: (data) => API.post('/validate-coupon', data),
};

// ===== Review API (TASK 5) =====
export const reviewAPI = {
  getByProduct: (productId) => API.get(`/products/${productId}/reviews`),
  create: (productId, data) => API.post(`/products/${productId}/reviews`, data),
  delete: (reviewId) => API.delete(`/reviews/${reviewId}`),
};

// ===== Admin API =====
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getProducts: () => API.get('/admin/products'),
  createProduct: (data) => API.post('/admin/products', data),
  updateProduct: (id, data) => API.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => API.delete(`/admin/products/${id}`),
  getOrders: () => API.get('/admin/orders'),
  updateOrderStatus: (id, data) => API.put(`/admin/orders/${id}`, data),
  getUsers: () => API.get('/admin/users'),
  toggleBlockUser: (id) => API.put(`/admin/users/${id}/block`),
  getCoupons: () => API.get('/admin/coupons'),
  createCoupon: (data) => API.post('/admin/coupons', data),
  updateCoupon: (id, data) => API.put(`/admin/coupons/${id}`, data),  // TASK 6
  deleteCoupon: (id) => API.delete(`/admin/coupons/${id}`),
  getCategories: () => API.get('/admin/categories'),
  createCategory: (data) => API.post('/admin/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCategory: (id, data) => API.put(`/admin/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteCategory: (id) => API.delete(`/admin/categories/${id}`),
  // Banners (TASK 3)
  getBanners: () => API.get('/admin/banners'),
  createBanner: (data) => API.post('/admin/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  activateBanner: (id) => API.put(`/admin/banners/${id}/activate`),
  deleteBanner: (id) => API.delete(`/admin/banners/${id}`),
  getActiveBanner: () => API.get('/banners/active'),
  getSiteSettings: () => API.get('/admin/site-settings'),
  updateSiteSettings: (data) => API.put('/admin/site-settings', data),
};

export const publicAPI = {
  getSiteSettings: () => API.get('/site-settings'),
  getCategories: () => API.get('/categories'),
};

export default API;
