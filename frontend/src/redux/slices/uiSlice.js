import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mobileMenuOpen: false,
  quickViewProduct: null,
  searchOpen: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false;
    },
    setQuickViewProduct: (state, action) => {
      state.quickViewProduct = action.payload;
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    closeSearch: (state) => {
      state.searchOpen = false;
    },
  },
});

export const { toggleMobileMenu, closeMobileMenu, setQuickViewProduct, toggleSearch, closeSearch } =
  uiSlice.actions;
export default uiSlice.reducer;
