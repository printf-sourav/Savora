import { motion } from 'framer-motion';
import SectionHeading from '../common/SectionHeading';
import ProductCard from '../common/ProductCard';
import { PRODUCTS } from '../../utils/constants';

const TrendingProducts = () => {
  const trending = PRODUCTS.filter((p) => p.isTrending).slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6">
        <SectionHeading
          subtitle="What's Hot"
          title="Trending Now"
          description="The flavors everyone is talking about. Don't miss out on these popular picks."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {trending.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
