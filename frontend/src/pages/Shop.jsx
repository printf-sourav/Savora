import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import ProductCard from '../components/common/ProductCard';
import Breadcrumb from '../components/common/Breadcrumb';
import SectionHeading from '../components/common/SectionHeading';
import { publicAPI } from '../services/api';
import { fetchProducts } from '../redux/slices/productSlice';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

// Debounce hook
const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { items: products, total, pages, loading } = useSelector((state) => state.products);

  // Filter state driven by URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);

  const debouncedSearch = useDebounce(search, 400);
  const debouncedMin = useDebounce(minPrice, 600);
  const debouncedMax = useDebounce(maxPrice, 600);

  const LIMIT = 12;

  // Fetch categories from backend
  useEffect(() => {
    publicAPI.getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  // Sync state → URL params and dispatch fetchProducts thunk
  const fetchProductData = useCallback(async () => {
    const params = { page, limit: LIMIT, sort };
    if (debouncedSearch) params.search = debouncedSearch;
    if (category) params.category = category;
    if (debouncedMin) params.minPrice = debouncedMin;
    if (debouncedMax) params.maxPrice = debouncedMax;

    // Update URL
    const urlParams = {};
    if (debouncedSearch) urlParams.search = debouncedSearch;
    if (category) urlParams.category = category;
    if (debouncedMin) urlParams.minPrice = debouncedMin;
    if (debouncedMax) urlParams.maxPrice = debouncedMax;
    if (sort !== 'newest') urlParams.sort = sort;
    if (page > 1) urlParams.page = page;
    setSearchParams(urlParams, { replace: true });

    dispatch(fetchProducts(params));
  }, [debouncedSearch, category, debouncedMin, debouncedMax, sort, page, dispatch]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, debouncedMin, debouncedMax, sort]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const clearFilters = () => {
    setSearch(''); setCategory(''); setMinPrice(''); setMaxPrice(''); setSort('newest'); setPage(1);
  };

  const hasActiveFilters = search || category || minPrice || maxPrice || sort !== 'newest';

  const startItem = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const endItem = Math.min(page * LIMIT, total);

  return (
    <>
      <Helmet>
        <title>{category ? `${categories.find(c => c._id === category || c.slug === category)?.name || 'Products'} | Shop | Savora` : 'Shop | Savora — Artisan Indian Food'}</title>
        <meta name="description" content="Browse our collection of premium handcrafted Indian pickles, snacks, sweets, and spice powders. Filter by category and find your favourite flavours." />
        <meta property="og:title" content="Shop | Savora" />
        <meta property="og:description" content="Premium handcrafted Indian snacks, pickles, and condiments." />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {/* Hero Banner */}
        <div className="relative bg-forest py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&q=80" alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-forest to-forest/80" />
          </div>
          <div className="max-w-7xl mx-auto w-full px-4 md:px-6 relative z-10 text-center">
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-body font-semibold">✦ Our Collection ✦</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-cream mt-3">Shop</h1>
            <p className="text-cream/50 text-sm font-body mt-3 max-w-lg mx-auto">Authentic homemade delicacies crafted with love and tradition</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-8">
          <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Shop', path: '/shop' }]} />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* ─── Sidebar ─── */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-28 space-y-5">
                {/* Categories */}
                <div className="bg-white rounded-2xl p-6 premium-shadow gold-border">
                  <h3 className="font-heading text-base font-semibold text-forest mb-4">Categories</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setCategory('')}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-body transition-all ${!category ? 'bg-forest text-cream font-medium' : 'text-forest/70 hover:bg-cream-dark hover:text-forest'}`}
                    >
                      All Products
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => setCategory(cat._id)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-body transition-all ${category === cat._id ? 'bg-forest text-cream font-medium' : 'text-forest/70 hover:bg-cream-dark hover:text-forest'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="bg-white rounded-2xl p-6 premium-shadow gold-border">
                  <h3 className="font-heading text-base font-semibold text-forest mb-4">Price Range</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min ₹"
                      className="w-full px-3 py-2 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none"
                    />
                    <span className="text-olive text-sm">–</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max ₹"
                      className="w-full px-3 py-2 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-body hover:bg-red-50 transition-colors"
                  >
                    <FiX size={14} /> Clear All Filters
                  </button>
                )}
              </div>
            </aside>

            {/* ─── Main Content ─── */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-olive/40" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gold/20 bg-white text-forest text-sm font-body focus:border-gold focus:ring-2 focus:ring-gold/10 outline-none"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-olive/40 hover:text-forest">
                      <FiX size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gold/20 bg-white text-forest text-sm font-body hover:border-gold transition-colors"
                  >
                    <FiFilter size={14} /> Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-gold" />}
                  </button>

                  {/* Sort */}
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gold/20 bg-white text-forest text-sm font-body focus:border-gold outline-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mobile Filters Panel */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="lg:hidden bg-white rounded-2xl p-4 mb-6 premium-shadow gold-border"
                >
                  <h3 className="font-heading text-base font-semibold text-forest mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button onClick={() => { setCategory(''); setShowFilters(false); }} className={`px-4 py-2 rounded-full text-xs font-body transition-all ${!category ? 'bg-forest text-cream' : 'bg-cream text-forest border border-gold/20 hover:border-gold'}`}>All</button>
                    {categories.map((cat) => (
                      <button key={cat._id} onClick={() => { setCategory(cat._id); setShowFilters(false); }} className={`px-4 py-2 rounded-full text-xs font-body transition-all ${category === cat._id ? 'bg-forest text-cream' : 'bg-cream text-forest border border-gold/20 hover:border-gold'}`}>{cat.name}</button>
                    ))}
                  </div>
                  <h3 className="font-heading text-base font-semibold text-forest mb-3">Price Range</h3>
                  <div className="flex items-center gap-2">
                    <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min ₹" className="w-full px-3 py-2 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none" />
                    <span className="text-olive">–</span>
                    <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max ₹" className="w-full px-3 py-2 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none" />
                  </div>
                </motion.div>
              )}

              {/* Results count */}
              <p className="text-xs text-olive font-body mb-4">
                {loading ? 'Loading...' : total > 0 ? `Showing ${startItem}–${endItem} of ${total} products` : 'No products found'}
              </p>

              {/* Product Grid */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl animate-pulse">
                      <div className="h-48 bg-cream-dark rounded-t-2xl" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-cream-dark rounded w-3/4" />
                        <div className="h-3 bg-cream-dark rounded w-1/2" />
                        <div className="h-4 bg-cream-dark rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {products.map((product, index) => (
                    <ProductCard key={product._id} product={product} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="font-heading text-2xl text-forest/30 mb-2">No products found</p>
                  <p className="text-sm text-olive font-body">Try adjusting your search or filters</p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="mt-4 px-6 py-2.5 bg-forest text-cream rounded-xl text-sm font-body font-medium">Clear Filters</button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {pages > 1 && !loading && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl border border-gold/20 text-forest hover:bg-forest hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <FiChevronLeft size={18} />
                  </button>
                  {Array.from({ length: pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-body font-medium transition-all ${page === i + 1 ? 'bg-forest text-cream' : 'border border-gold/20 text-forest hover:bg-forest hover:text-cream'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(Math.min(pages, page + 1))}
                    disabled={page === pages}
                    className="p-2 rounded-xl border border-gold/20 text-forest hover:bg-forest hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <FiChevronRight size={18} />
                  </button>
                </div>
              )}

              {/* Showing X–Y of Z label */}
              {pages > 1 && !loading && (
                <p className="text-center text-xs text-olive font-body mt-3">
                  Showing {startItem}–{endItem} of {total} results
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Shop;
