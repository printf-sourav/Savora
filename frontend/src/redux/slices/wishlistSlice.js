import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

// ─── Async Thunks (TASK 4) ───────────────────────────────────────────────────

export const addToWishlistAsync = createAsyncThunk(
  'wishlist/add',
  async (productId, { rejectWithValue }) => {
    try {
      const res = await authAPI.addToWishlist(productId);
      return res.data; // populated wishlist array from server
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeFromWishlistAsync = createAsyncThunk(
  'wishlist/remove',
  async (productId, { rejectWithValue }) => {
    try {
      const res = await authAPI.removeFromWishlist(productId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loadWishlistFromServer = createAsyncThunk(
  'wishlist/loadFromServer',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authAPI.getProfile();
      return res.data?.wishlist || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Local helpers (fallback for guest users) ────────────────────────────────
const loadLocalWishlist = () => {
  try {
    const w = localStorage.getItem('savora_wishlist');
    return w ? JSON.parse(w) : [];
  } catch { return []; }
};

const saveLocalWishlist = (items) => {
  localStorage.setItem('savora_wishlist', JSON.stringify(items));
};

const initialState = {
  items: loadLocalWishlist(),
  loading: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Synchronous toggle for guest users
    toggleWishlist: (state, action) => {
      const idx = state.items.findIndex(
        (item) => (item._id || item.id) === (action.payload._id || action.payload.id)
      );
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(action.payload);
      }
      saveLocalWishlist(state.items);
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(
        (item) => (item._id || item.id) !== action.payload
      );
      saveLocalWishlist(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      saveLocalWishlist([]);
    },
    setWishlist: (state, action) => {
      state.items = action.payload;
      saveLocalWishlist(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // addToWishlistAsync
      .addCase(addToWishlistAsync.pending, (state) => { state.loading = true; })
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.items = action.payload;
          saveLocalWishlist(state.items);
        }
      })
      .addCase(addToWishlistAsync.rejected, (state) => { state.loading = false; })

      // removeFromWishlistAsync
      .addCase(removeFromWishlistAsync.pending, (state) => { state.loading = true; })
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.items = action.payload;
          saveLocalWishlist(state.items);
        }
      })
      .addCase(removeFromWishlistAsync.rejected, (state) => { state.loading = false; })

      // loadWishlistFromServer
      .addCase(loadWishlistFromServer.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
          state.items = action.payload;
          saveLocalWishlist(state.items);
        }
      });
  },
});

export const {
  toggleWishlist, removeFromWishlist, clearWishlist, setWishlist,
} = wishlistSlice.actions;

export const selectIsInWishlist = (state, productId) =>
  state.wishlist.items.some((item) => (item._id || item.id) === productId);

export default wishlistSlice.reducer;
