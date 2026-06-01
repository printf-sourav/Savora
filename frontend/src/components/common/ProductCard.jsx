import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiEye, FiStar } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { setQuickViewProduct } from '../../redux/slices/uiSlice';
import { formatPrice } from '../../utils/constants';
import toast from 'react-hot-toast';

const ProductCard = ({ product, index = 0 }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isInWishlist = wishlistItems.some((item) => item.id === product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product || !(product._id || product.id)) {
      toast.error('Unable to add product to cart');
      return;
    }
    dispatch(addToCart({ ...product, quantity: 1 }));
    toast.success(`${product.title} added to cart!`, {
      style: {
        background: '#1E2B24',
        color: '#F5EFE4',
        borderRadius: '12px',
        border: '1px solid rgba(201,166,107,0.3)',
      },
      iconTheme: { primary: '#C9A66B', secondary: '#1E2B24' },
    });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
    toast.success(
      isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!',
      {
        style: {
          background: '#1E2B24',
          color: '#F5EFE4',
          borderRadius: '12px',
          border: '1px solid rgba(201,166,107,0.3)',
        },
        iconTheme: { primary: '#C9A66B', secondary: '#1E2B24' },
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/product/${product.slug}`} className="group block">
        <div className="bg-white rounded-2xl overflow-hidden premium-shadow hover:premium-shadow-lg transition-all duration-500 gold-border">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-cream-dark">
            <img
              src={product.image || product.images?.[0]?.url || ''}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />

            {/* Badge */}
            {product.badge && (
              <span className="absolute top-3 left-3 bg-forest text-cream text-[10px] font-body font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                {product.badge}
              </span>
            )}

            {/* Discount Badge */}
            {product.discount > 0 && (
              <span className="absolute top-3 right-3 bg-gold text-forest text-[10px] font-body font-bold px-2 py-1 rounded-full">
                -{product.discount}%
              </span>
            )}

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/20 transition-all duration-500 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlist}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isInWishlist
                    ? 'bg-gold text-forest'
                    : 'bg-white text-forest hover:bg-gold hover:text-forest'
                }`}
              >
                <FiHeart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAddToCart}
                className="w-10 h-10 rounded-full bg-white text-forest hover:bg-gold hover:text-forest flex items-center justify-center transition-all shadow-lg"
              >
                <FiShoppingCart size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  dispatch(setQuickViewProduct(product));
                }}
                className="w-10 h-10 rounded-full bg-white text-forest hover:bg-gold hover:text-forest flex items-center justify-center transition-all shadow-lg"
              >
                <FiEye size={16} />
              </motion.button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-[10px] text-olive uppercase tracking-widest font-body mb-1">{product.category?.name || product.category}</p>
            <h3 className="font-heading text-base font-semibold text-forest group-hover:text-gold transition-colors line-clamp-1">
              {product.title}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-1.5 mb-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={12}
                    className={i < Math.floor(product.rating) ? 'text-gold fill-gold' : 'text-cream-dark'}
                  />
                ))}
              </div>
              <span className="text-[10px] text-olive font-body">({Array.isArray(product.reviews) ? product.reviews.length : (product.reviews || 0)})</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold text-forest">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-olive/60 line-through font-body">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
