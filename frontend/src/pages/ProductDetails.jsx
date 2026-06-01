import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiMinus, FiPlus, FiShoppingCart, FiHeart, FiStar, FiShare2, FiTruck, FiShield, FiClock, FiChevronRight } from 'react-icons/fi';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { fetchProductBySlug, addToRecentlyViewed } from '../redux/slices/productSlice';
import { formatPrice } from '../utils/constants';
import Breadcrumb from '../components/common/Breadcrumb';
import ProductCard from '../components/common/ProductCard';
import ReviewSection from '../components/product/ReviewSection';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  // TASK 3: read from Redux state instead of local useState
  const product = useSelector((state) => state.products.selectedProduct);
  const loading = useSelector((state) => state.products.loading);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // TASK 3: dispatch thunk instead of calling productAPI directly
  useEffect(() => {
    dispatch(fetchProductBySlug(slug)).then((action) => {
      if (action.payload) {
        const p = action.payload;
        setSelectedVariant(p.variants?.[1] || p.variants?.[0] || null);
        dispatch(addToRecentlyViewed(p));
        window.scrollTo(0, 0);
      }
    });
  }, [slug, dispatch]);

  // Reset variant when product changes
  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants?.[1] || product.variants?.[0] || null);
    }
  }, [product?._id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 py-20 text-center">
        <h2 className="font-heading text-3xl text-forest mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-gold hover:text-gold-dark font-body underline">Back to Shop</Link>
      </div>
    );
  }

  const isInWishlist = wishlistItems.some((item) => item._id === product._id || item.id === product._id);
  const currentPrice = selectedVariant?.price || product.discountPrice || product.price;
  const images = product.images?.map((img) => img.url || img) || [];

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity, selectedVariant }));
    toast.success(`${product.title} added to cart!`, {
      style: { background: '#1E2B24', color: '#F5EFE4', borderRadius: '12px', border: '1px solid rgba(201,166,107,0.3)' },
      iconTheme: { primary: '#C9A66B', secondary: '#1E2B24' },
    });
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ ...product, quantity, selectedVariant }));
    window.location.href = '/checkout';
  };

  const handleMouseMove = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <>
      <Helmet>
        <title>{`${product.seoTitle || product.title} | Savora`}</title>
        <meta name="description" content={product.seoDescription || product.shortDescription || product.description?.slice(0, 160)} />
        <meta property="og:title" content={`${product.title} | Savora`} />
        <meta property="og:description" content={product.shortDescription || product.description?.slice(0, 160)} />
        <meta property="og:image" content={images[0]} />
        <meta property="og:type" content="product" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://savora.in/product/${product.slug}`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.title,
          "description": product.shortDescription || product.description,
          "image": images,
          "offers": {
            "@type": "Offer",
            "price": product.discountPrice || product.price,
            "priceCurrency": "INR",
            "availability": product.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock"
          },
          ...(product.ratings > 0 ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": product.ratings.toFixed(1),
              "reviewCount": product.reviews?.length || 0
            }
          } : {})
        })}</script>
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-cream min-h-screen">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-4">
          <Breadcrumb items={[
            { label: 'Home', path: '/' },
            { label: 'Shop', path: '/shop' },
            { label: product.title, path: `/product/${product.slug}` },
          ]} />
        </div>

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              {/* Main Image */}
              <div
                className="relative aspect-square rounded-3xl overflow-hidden bg-white premium-shadow-lg gold-border cursor-crosshair"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  src={images[selectedImage] || 'https://placehold.co/600x600/1E2B24/C9A66B?text=Savora'}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-300"
                  style={isZoomed ? { transform: 'scale(2)', transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
                />
                {product.bestseller && (
                  <span className="absolute top-4 left-4 bg-forest text-cream text-xs font-body font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full">
                    Bestseller
                  </span>
                )}
                {product.discountPrice && product.price > product.discountPrice && (
                  <span className="absolute top-4 right-4 bg-gold text-forest text-xs font-body font-bold px-3 py-1.5 rounded-full">
                    -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 mt-4">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === i ? 'border-gold premium-shadow' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`${product.title} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-body font-semibold">
                {product.category?.name || product.category}
              </span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-forest mt-2 leading-tight">{product.title}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={16} className={i < Math.floor(product.rating || 4.5) ? 'text-gold fill-gold' : 'text-cream-dark'} />
                  ))}
                </div>
                <span className="text-sm text-olive font-body">{product.rating || '4.5'}</span>
                <span className="text-sm text-olive/50 font-body">({product.reviews || 0} reviews)</span>
                <button className="ml-auto p-2 text-olive hover:text-gold transition-colors"><FiShare2 size={18} /></button>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-5">
                <span className="font-heading text-3xl font-bold text-forest">{formatPrice(currentPrice)}</span>
                {product.price > product.discountPrice && product.discountPrice && (
                  <span className="text-lg text-olive/50 line-through font-body">{formatPrice(product.price)}</span>
                )}
              </div>

              <p className="text-olive text-sm font-body leading-relaxed mt-5">{product.shortDescription || product.description}</p>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-forest font-body font-semibold mb-3">Select Size:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v, idx) => (
                      <button
                        key={v._id || idx}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-body font-medium border-2 transition-all ${
                          selectedVariant?._id === v._id || selectedVariant?.name === v.name
                            ? 'bg-forest text-cream border-forest'
                            : 'bg-white text-forest border-gold/20 hover:border-gold'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm text-forest font-body font-semibold mb-3">Quantity:</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-gold/20 rounded-xl overflow-hidden">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-forest hover:bg-forest hover:text-cream transition-all"><FiMinus size={16} /></button>
                      <span className="px-6 py-3 font-body text-base font-semibold text-forest border-x-2 border-gold/20">{quantity}</span>
                      <button onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))} className="px-4 py-3 text-forest hover:bg-forest hover:text-cream transition-all"><FiPlus size={16} /></button>
                    </div>
                    <span className={`text-xs font-body ${
                      product.stock === 0 
                        ? 'text-red-500 font-semibold' 
                        : product.stock < 20 
                          ? 'text-amber-600 font-semibold' 
                          : 'text-green-600 font-medium'
                    }`}>
                      {product.stock === 0 
                        ? 'Out of stock' 
                        : product.stock < 20 
                          ? `Hurry, only ${product.stock} left!` 
                          : 'In Stock'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-forest text-cream py-4 rounded-xl font-body text-sm font-semibold flex items-center justify-center gap-2 hover:bg-forest-light transition-colors premium-shadow disabled:opacity-50">
                    <FiShoppingCart size={18} /> Add to Cart
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 bg-gold text-forest py-4 rounded-xl font-body text-sm font-semibold hover:bg-gold-light transition-colors premium-shadow disabled:opacity-50">
                    Buy Now
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { dispatch(toggleWishlist(product)); toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!'); }}
                    className={`p-4 rounded-xl border-2 transition-all ${isInWishlist ? 'bg-gold border-gold text-forest' : 'border-gold/20 text-forest hover:border-gold'}`}>
                    <FiHeart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
                  </motion.button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-gold/15">
                {[
                  { icon: FiTruck, text: 'Free delivery above ₹999' },
                  { icon: FiShield, text: 'FSSAI Certified' },
                  { icon: FiClock, text: `Shelf Life: ${product.shelfLife || 'N/A'}` },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-1.5">
                    <Icon size={18} className="text-gold" />
                    <span className="text-[10px] text-olive font-body">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Tabs: Description, Ingredients, Reviews */}
          <div className="mt-16">
            <div className="flex gap-1 border-b border-gold/15 overflow-x-auto">
              {['description', 'ingredients', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-body font-medium capitalize transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab ? 'border-gold text-forest' : 'border-transparent text-olive hover:text-forest'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="py-8">
              {activeTab === 'description' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl">
                  <p className="text-olive font-body leading-relaxed">{product.description}</p>
                  {product.shelfLife && (
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4 gold-border">
                        <p className="text-xs text-olive font-body uppercase tracking-wider mb-1">Shelf Life</p>
                        <p className="font-body font-semibold text-forest">{product.shelfLife}</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 gold-border">
                        <p className="text-xs text-olive font-body uppercase tracking-wider mb-1">Availability</p>
                        <p className={`font-body font-semibold ${
                          product.stock === 0 
                            ? 'text-red-500' 
                            : product.stock < 20 
                              ? 'text-amber-600' 
                              : 'text-green-600'
                        }`}>{product.stock === 0 
                          ? 'Out of stock' 
                          : product.stock < 20 
                            ? `Only ${product.stock} left` 
                            : 'In stock'}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              {activeTab === 'ingredients' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl">
                  <p className="text-sm text-olive font-body mb-4">All natural, no preservatives. Our ingredients are sourced from certified organic farms.</p>
                  {product.ingredients && product.ingredients.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.ingredients.map((ing, i) => (
                        <span key={i} className="px-4 py-2 bg-white rounded-full text-sm font-body text-forest gold-border">{ing}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-olive font-body">No ingredients information available.</p>
                  )}
                </motion.div>
              )}
              {activeTab === 'reviews' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="text-center">
                      <p className="font-heading text-5xl font-bold text-forest">{product.rating || '4.5'}</p>
                      <div className="flex gap-0.5 mt-1 justify-center">
                        {[...Array(5)].map((_, i) => <FiStar key={i} size={14} className={i < Math.floor(product.rating || 4.5) ? 'text-gold fill-gold' : 'text-cream-dark'} />)}
                      </div>
                      <p className="text-xs text-olive font-body mt-1">{product.reviews || 0} reviews</p>
                    </div>
                  </div>
                  <p className="text-olive font-body">No reviews yet. Be the first to review!</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      {/* TASK 5: Real reviews section */}
      {product && <ReviewSection productId={product._id} />}
    </>
  );
};

export default ProductDetails;
