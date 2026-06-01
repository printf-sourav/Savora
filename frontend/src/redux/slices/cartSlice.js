import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

// ─── Server sync thunks (TASK 6) ─────────────────────────────────────────────

// Fetch server cart and merge with local cart on login
export const loadCartFromServer = createAsyncThunk(
  'cart/loadFromServer',
  async (_, { getState, rejectWithValue }) => {
    try {
      const res = await authAPI.getCart();
      const serverCart = res.data || [];
      // Convert server format to frontend format and merge with local
      return serverCart;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Push local cart state to server (call after mutations)
export const syncCartToServer = createAsyncThunk(
  'cart/syncToServer',
  async (cartItems, { rejectWithValue }) => {
    try {
      const serverCart = cartItems.map((item) => ({
        product: item._id || item.id,
        quantity: item.quantity,
        variant: item.selectedVariant?.name || '',
      }));
      await authAPI.syncCart(serverCart);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Local persistence helpers ────────────────────────────────────────────────

const loadCart = () => {
  try {
    const cart = localStorage.getItem('savora_cart');
    return cart ? JSON.parse(cart) : [];
  } catch { return []; }
};

const saveCart = (items) => {
  localStorage.setItem('savora_cart', JSON.stringify(items));
};

// Debounce helper for server sync
let syncTimeout = null;
const debouncedSync = (items, dispatch) => {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    dispatch(syncCartToServer(items));
  }, 600);
};

const initialState = {
  items: loadCart(),
  coupon: null,
  couponDiscount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const payload = action.payload || {};
      const { _id, id, selectedVariant } = payload;
      const pid = _id || id || payload.slug || null;
      if (!payload || !pid) return; // ignore invalid add-to-cart calls
      const variantId = selectedVariant?.id || selectedVariant?.name || null;
      const existingIndex = state.items.findIndex(
        (item) => (item._id || item.id) === pid && (item.selectedVariant?.id || item.selectedVariant?.name || null) === variantId
      );
      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += payload.quantity || 1;
      } else {
        state.items.push({
          ...payload,
          id: pid,
          quantity: payload.quantity || 1,
          selectedVariant: selectedVariant || null,
        });
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((_, index) => index !== action.payload);
      saveCart(state.items);
    },
    updateQuantity: (state, action) => {
      const { index, quantity } = action.payload;
      if (quantity > 0 && quantity <= 10) {
        state.items[index].quantity = quantity;
        saveCart(state.items);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      state.couponDiscount = 0;
      saveCart([]);
    },
    applyCoupon: (state, action) => {
      state.coupon = action.payload.code;
      state.couponDiscount = action.payload.discount;
    },
    removeCoupon: (state) => {
      state.coupon = null;
      state.couponDiscount = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadCartFromServer.fulfilled, (state, action) => {
      const serverItems = action.payload;
      if (!serverItems || serverItems.length === 0) return;

      // Merge: for items present in both, take the higher quantity
      serverItems.forEach((serverItem) => {
        const product = serverItem.product;
        if (!product) return;
        const pid = product._id || product.id;
        const localIdx = state.items.findIndex((i) => (i._id || i.id) === pid);
        if (localIdx >= 0) {
          // Keep the higher quantity
          state.items[localIdx].quantity = Math.max(
            state.items[localIdx].quantity,
            serverItem.quantity
          );
        } else {
          // Add server item to local cart
          state.items.push({
            ...product,
            id: pid,
            quantity: serverItem.quantity,
            selectedVariant: serverItem.variant ? { name: serverItem.variant } : null,
          });
        }
      });
      saveCart(state.items);
    });
  },
});

export const {
  addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon,
} = cartSlice.actions;

// Re-export thunks with debounce wrapper for use in components
export const addToCartWithSync = (item) => (dispatch, getState) => {
  dispatch(addToCart(item));
  const { items } = getState().cart;
  debouncedSync(items, dispatch);
};

export const removeFromCartWithSync = (index) => (dispatch, getState) => {
  dispatch(removeFromCart(index));
  const { items } = getState().cart;
  debouncedSync(items, dispatch);
};

export const updateQuantityWithSync = (payload) => (dispatch, getState) => {
  dispatch(updateQuantity(payload));
  const { items } = getState().cart;
  debouncedSync(items, dispatch);
};

// Selectors
export const selectCartTotal = (state) =>
  state.cart.items.reduce((total, item) => {
    const price = item.selectedVariant?.price || item.discountPrice || item.price;
    return total + price * item.quantity;
  }, 0);

export const selectCartItemCount = (state) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

export default cartSlice.reducer;
