import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiHeart, FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { selectCartItemCount } from '../../redux/slices/cartSlice';
import { toggleMobileMenu, closeMobileMenu, toggleSearch, closeSearch } from '../../redux/slices/uiSlice';
import { setSearchQuery } from '../../redux/slices/productSlice';
import { publicAPI } from '../../services/api';
import { BRAND } from '../../utils/constants';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [announcement, setAnnouncement] = useState('Free Shipping on orders above ₹999 | Use code SAVORA10 for 10% off');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartCount = useSelector(selectCartItemCount);
  const wishlistCount = useSelector((state) => state.wishlist.items.length);
  const { mobileMenuOpen, searchOpen } = useSelector((state) => state.ui);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const response = await publicAPI.getSiteSettings();
        const settings = response.data;
        if (settings?.announcementBarText) {
          setAnnouncement(settings.announcementBarText);
        }
      } catch {
        // Keep the default announcement if the request fails.
      }
    };

    loadSiteSettings();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    dispatch(closeMobileMenu());
    dispatch(closeSearch());
  }, [navigate, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      dispatch(setSearchQuery(searchInput.trim()));
      navigate('/shop');
      dispatch(closeSearch());
      setSearchInput('');
    }
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-forest text-cream text-center py-2 text-xs md:text-sm font-body tracking-wide">
        <span className="text-gold">✨</span> {announcement}{' '}
        <span className="text-gold">✨</span>
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? 'bg-cream/95 backdrop-blur-md shadow-lg border-b border-gold/10'
            : 'bg-cream border-b border-gold/10'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 w-full">
          <div className="flex w-full items-center justify-between h-16 md:h-20">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="lg:hidden p-2 text-forest hover:text-gold transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex flex-col items-center">
                <span className="font-heading text-2xl md:text-3xl font-bold tracking-wider text-forest group-hover:text-gold transition-colors duration-300">
                  {BRAND.name}
                </span>
                <span className="text-[10px] md:text-xs tracking-[0.3em] text-olive font-body uppercase -mt-1">
                  {BRAND.tagline}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `relative font-body text-sm font-medium tracking-wide uppercase transition-colors duration-300 py-2 ${
                      isActive ? 'text-gold' : 'text-forest hover:text-gold'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-1 md:gap-3">
              {/* Search */}
              <button
                onClick={() => dispatch(toggleSearch())}
                className="p-2 text-forest hover:text-gold transition-colors relative"
                aria-label="Search"
              >
                <FiSearch size={20} />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-2 text-forest hover:text-gold transition-colors relative hidden sm:block"
              >
                <FiHeart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gold text-forest text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="p-2 text-forest hover:text-gold transition-colors relative">
                <FiShoppingCart size={20} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-gold text-forest text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>

              {/* User */}
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="p-2 text-forest hover:text-gold transition-colors hidden sm:block relative"
              >
                <FiUser size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-cream border-b border-gold/20 shadow-lg p-4"
            >
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto w-full relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for pickles, sweets, spices..."
                  className="w-full px-5 py-3 pr-12 bg-white rounded-full border border-gold/20 focus:border-gold focus:ring-2 focus:ring-gold/20 text-forest placeholder:text-olive/50 font-body text-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gold hover:text-gold-dark transition-colors"
                >
                  <FiSearch size={20} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-forest/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => dispatch(closeMobileMenu())}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-cream z-50 shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Close */}
                <div className="flex items-center justify-between mb-8">
                  <span className="font-heading text-2xl font-bold text-forest">{BRAND.name}</span>
                  <button
                    onClick={() => dispatch(closeMobileMenu())}
                    className="p-2 text-forest hover:text-gold"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* Mobile Nav Links */}
                <nav className="space-y-1">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <NavLink
                        to={link.path}
                        onClick={() => dispatch(closeMobileMenu())}
                        className={({ isActive }) =>
                          `block px-4 py-3 rounded-xl font-body text-sm font-medium tracking-wide uppercase transition-all ${
                            isActive
                              ? 'bg-forest text-cream'
                              : 'text-forest hover:bg-forest/5 hover:text-gold'
                          }`
                        }
                      >
                        {link.label}
                      </NavLink>
                    </motion.div>
                  ))}
                </nav>

                {/* Mobile Extra Links */}
                <div className="mt-8 pt-8 border-t border-gold/20 space-y-1">
                  <Link
                    to="/wishlist"
                    onClick={() => dispatch(closeMobileMenu())}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-forest hover:bg-forest/5 font-body text-sm"
                  >
                    <FiHeart size={18} />
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-auto bg-gold text-forest text-xs font-bold px-2 py-0.5 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to={isAuthenticated ? '/dashboard' : '/login'}
                    onClick={() => dispatch(closeMobileMenu())}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-forest hover:bg-forest/5 font-body text-sm"
                  >
                    <FiUser size={18} />
                    {isAuthenticated ? 'My Account' : 'Login / Sign Up'}
                  </Link>
                </div>

                {/* Contact Info */}
                <div className="mt-8 pt-8 border-t border-gold/20">
                  <p className="text-olive text-xs font-body mb-2">Need help?</p>
                  <a href={`tel:${BRAND.phone}`} className="text-forest font-body text-sm font-medium hover:text-gold">
                    {BRAND.phone}
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
