import { createSlice } from '@reduxjs/toolkit';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { authAPI } from '../../services/api';
import { clearCart } from './cartSlice';
import { clearWishlist } from './wishlistSlice';

// TASK 1: No longer read tokens from localStorage — auth is managed via httpOnly cookies.
// We only persist the user profile in localStorage for UI display (name, role, avatar etc.)
const savedUser = localStorage.getItem('savora_user');

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedUser,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      localStorage.setItem('savora_user', JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('savora_user');
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('savora_user', JSON.stringify(state.user));
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile, clearError } = authSlice.actions;

export const performLogout = () => async (dispatch) => {
  try {
    await authAPI.logout();
  } catch {
    // Ignore server logout errors and still clear the local session.
  }

  try {
    await signOut(auth);
  } catch {
    // Ignore Firebase sign-out failures; the local Redux state still gets cleared.
  }

  dispatch(clearCart());
  dispatch(clearWishlist());
  dispatch(logout());
};

export const fetchAndHydrateProfile = () => async (dispatch) => {
  const { authAPI } = await import('../../services/api');
  const res = await authAPI.getProfile();
  dispatch(loginSuccess({ user: res.data }));
  return res.data;
};

// TASK 4+6: Thunk that fires after login to load wishlist + cart from server
export const onLoginSuccess = (userData) => async (dispatch) => {
  dispatch(loginSuccess({ user: userData }));
  try {
    // Lazy-import to avoid circular dependency
    const { loadWishlistFromServer } = await import('./wishlistSlice');
    const { loadCartFromServer } = await import('./cartSlice');
    dispatch(loadWishlistFromServer());
    dispatch(loadCartFromServer());
  } catch { /* non-critical */ }
};

export default authSlice.reducer;
