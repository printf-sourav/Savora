import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FiHeart, FiArrowRight } from 'react-icons/fi';
import ProductCard from '../components/common/ProductCard';
import Breadcrumb from '../components/common/Breadcrumb';

const Wishlist = () => {
  const { items } = useSelector((state) => state.wishlist);

  return (
    <>
      <Helmet>
        <title>Wishlist | SAVORA</title>
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-cream min-h-screen">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-4">
          <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Wishlist', path: '/wishlist' }]} />
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pb-16">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-forest mb-8">My Wishlist</h1>

          {items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl premium-shadow gold-border">
              <FiHeart size={64} className="mx-auto text-olive/30 mb-6" />
              <h2 className="font-heading text-2xl font-bold text-forest mb-3">Your wishlist is empty</h2>
              <p className="text-olive font-body mb-8">Save items you love here to easily find them later.</p>
              <Link to="/shop" className="inline-flex items-center gap-2 bg-forest text-cream px-8 py-4 rounded-full font-body text-sm font-semibold hover:bg-forest-light transition-colors">
                Explore Products <FiArrowRight />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Wishlist;
