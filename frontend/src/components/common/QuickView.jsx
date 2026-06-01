import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { setQuickViewProduct } from '../../redux/slices/uiSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { formatPrice } from '../../utils/constants';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const QuickView = () => {
  const dispatch = useDispatch();
  const product = useSelector((state) => state.ui.quickViewProduct);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  if (!product) return null;

  const isInWishlist = wishlistItems.some((item) => item.id === product.id);
  const currentPrice = selectedVariant?.price || product.price;

  const handleAddToCart = () => {
    if (!product || !(product._id || product.id)) {
      toast.error('Unable to add product to cart');
      return;
    }
    dispatch(addToCart({ ...product, quantity, selectedVariant }));
    toast.success(`${product.title} added to cart!`, {
      style: { background: '#1E2B24', color: '#F5EFE4', borderRadius: '12px', border: '1px solid rgba(201,166,107,0.3)' },
      iconTheme: { primary: '#C9A66B', secondary: '#1E2B24' },
    });
    dispatch(setQuickViewProduct(null));
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-forest/60 backdrop-blur-sm z-[60]"
            onClick={() => dispatch(setQuickViewProduct(null))}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          >
            <div className="bg-cream rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto premium-shadow-lg gold-border">
              {/* Close Button */}
              <button
                onClick={() => dispatch(setQuickViewProduct(null))}
                className="absolute top-4 right-4 p-2 bg-white rounded-full text-forest hover:text-gold premium-shadow z-10"
              >
                <FiX size={20} />
              </button>

              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="aspect-square bg-cream-dark overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
                  <img
                    src={product.image || product.images?.[0]?.url || ''}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="p-6 md:p-8 flex flex-col">
                  <span className="text-[10px] text-gold uppercase tracking-[0.3em] font-body font-semibold">
                    {product.category?.name || product.category}
                  </span>
                  <h3 className="font-heading text-2xl font-bold text-forest mt-1">{product.title}</h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          size={14}
                          className={i < Math.floor(product.rating) ? 'text-gold fill-gold' : 'text-cream-dark'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-olive font-body">{product.rating} ({product.reviews} reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3 mt-4">
                    <span className="font-heading text-2xl font-bold text-forest">{formatPrice(currentPrice)}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-base text-olive/60 line-through font-body">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    {product.discount > 0 && (
                      <span className="text-xs bg-gold/20 text-gold-dark px-2 py-1 rounded-full font-body font-semibold">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-olive font-body mt-4 leading-relaxed line-clamp-3">
                    {product.description}
                  </p>

                  {/* Variants */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-forest font-body font-semibold mb-2">Size:</p>
                      <div className="flex gap-2 flex-wrap">
                        {product.variants.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariant(v)}
                            className={`px-4 py-2 rounded-xl text-xs font-body font-medium border transition-all ${
                              selectedVariant?.id === v.id
                                ? 'bg-forest text-cream border-forest'
                                : 'bg-white text-forest border-gold/20 hover:border-gold'
                            }`}
                          >
                            {v.name} — {formatPrice(v.price)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="mt-4">
                    <p className="text-xs text-forest font-body font-semibold mb-2">Quantity:</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gold/20 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-2 text-forest hover:bg-forest hover:text-cream transition-all"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="px-4 py-2 font-body text-sm font-medium text-forest">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(10, quantity + 1))}
                          className="px-3 py-2 text-forest hover:bg-forest hover:text-cream transition-all"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddToCart}
                      className="flex-1 bg-forest text-cream py-3 px-6 rounded-xl font-body text-sm font-semibold flex items-center justify-center gap-2 hover:bg-forest-light transition-colors"
                    >
                      <FiShoppingCart size={16} /> Add to Cart
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        dispatch(toggleWishlist(product));
                        toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!');
                      }}
                      className={`p-3 rounded-xl border transition-all ${
                        isInWishlist
                          ? 'bg-gold border-gold text-forest'
                          : 'border-gold/20 text-forest hover:border-gold'
                      }`}
                    >
                      <FiHeart size={18} fill={isInWishlist ? 'currentColor' : 'none'} />
                    </motion.button>
                  </div>

                  {/* View Full Details */}
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={() => dispatch(setQuickViewProduct(null))}
                    className="mt-4 text-center text-sm text-gold font-body font-medium hover:text-gold-dark transition-colors underline underline-offset-4"
                  >
                    View Full Details →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickView;
