import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderAPI } from '../../services/api';
import { clearCart } from './cartSlice';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const res = await orderAPI.getMyOrders();
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await orderAPI.getById(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Order not found');
    }
  }
);

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { dispatch, rejectWithValue }) => {
    try {
      const res = await orderAPI.create(orderData);
      dispatch(clearCart());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to place order');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (id, { rejectWithValue }) => {
    try {
      const res = await orderAPI.cancel(id);
      return res.data; // Returns updated order
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to cancel order');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearOrderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchMyOrders
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchOrderById
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // placeOrder
    builder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // cancelOrder
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const idx = state.orders.findIndex((o) => o._id === updated._id);
        if (idx >= 0) state.orders[idx] = updated;
        if (state.currentOrder?._id === updated._id) {
          state.currentOrder = updated;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentOrder, clearOrderError } = orderSlice.actions;

// Selectors
export const selectOrders = (state) => state.orders.orders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrdersLoading = (state) => state.orders.loading;

export default orderSlice.reducer;
