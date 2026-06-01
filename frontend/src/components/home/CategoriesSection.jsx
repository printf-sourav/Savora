import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import SectionHeading from '../common/SectionHeading';
import { CATEGORIES } from '../../utils/constants';

const CategoriesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6">
        <SectionHeading
          subtitle="Our Collections"
          title="Explore Categories"
          description="From tangy pickles to aromatic spices, discover the finest homemade delicacies crafted with tradition."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={`/shop?category=${category.slug}`}
                className="group relative block rounded-2xl overflow-hidden aspect-[3/4] premium-shadow hover:premium-shadow-lg transition-all duration-500"
              >
                {/* Background Image */}
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <span className="text-[10px] text-gold font-body uppercase tracking-widest">
                    {category.itemCount} Products
                  </span>
                  <h3 className="font-heading text-lg md:text-xl font-bold text-cream mt-1 group-hover:text-gold transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-cream/60 font-body mt-1 line-clamp-2 hidden md:block">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-gold text-xs font-body font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Explore <FiArrowRight size={12} />
                  </div>
                </div>

                {/* Hover Border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/30 rounded-2xl transition-all duration-500" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
