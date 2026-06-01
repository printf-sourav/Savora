import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionHeading from '../common/SectionHeading';
import ProductCard from '../common/ProductCard';
import { PRODUCTS } from '../../utils/constants';
import { FiArrowRight } from 'react-icons/fi';

const BestSellers = () => {
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6">
        <SectionHeading
          subtitle="Customer Favorites"
          title="Best Sellers"
          description="Our most loved products, chosen by thousands of happy customers across India."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {bestSellers.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 border-2 border-forest text-forest px-8 py-3 rounded-full font-body text-sm font-semibold uppercase tracking-wider hover:bg-forest hover:text-cream transition-all duration-300"
          >
            View All Products
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default BestSellers;
