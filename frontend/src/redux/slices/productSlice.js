import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productAPI } from '../../services/api';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await productAPI.getAll(params);
      const data = res.data || res;
      // Normalise: API returns { products, total, page, pages } or flat array
      return {
        products: data.products || data,
        total: data.total || (data.products?.length ?? 0),
        page: data.page || params.page || 1,
        pages: data.pages || 1,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchProductBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const res = await productAPI.getBySlug(slug);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Product not found');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  items: [],
  selectedProduct: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pages: 1,
  // Legacy local-filter state (kept for backward compat with any components using them)
  recentlyViewed: [],
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    addToRecentlyViewed: (state, action) => {
      const existing = state.recentlyViewed.findIndex(
        (p) => (p._id || p.id) === (action.payload._id || action.payload.id)
      );
      if (existing >= 0) {
        state.recentlyViewed.splice(existing, 1);
      }
      state.recentlyViewed.unshift(action.payload);
      if (state.recentlyViewed.length > 6) {
        state.recentlyViewed = state.recentlyViewed.slice(0, 6);
      }
    },
    clearProductError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action) => {
      // Mock search query setter if needed
    },
  },
  extraReducers: (builder) => {
    // fetchProducts
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchProductBySlug
    builder
      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedProduct = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedProduct, addToRecentlyViewed, clearProductError, setSearchQuery } =
  productSlice.actions;

// Selectors
export const selectProducts = (state) => state.products.items;
export const selectSelectedProduct = (state) => state.products.selectedProduct;
export const selectProductsLoading = (state) => state.products.loading;

export default productSlice.reducer;
