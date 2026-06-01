import { motion } from 'framer-motion';

const AuthenticitySection = () => {
  return (
    <section className="py-16 md:py-24 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Image */}
              <div className="rounded-3xl overflow-hidden premium-shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&q=80"
                  alt="Traditional Indian kitchen"
                  className="w-full h-[400px] md:h-[500px] object-cover"
                  loading="lazy"
                />
              </div>

              {/* Overlapping Image */}
              <div className="absolute -bottom-8 -right-4 md:-right-8 w-48 md:w-56 rounded-2xl overflow-hidden premium-shadow-lg border-4 border-cream">
                <img
                  src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80"
                  alt="Fresh spices"
                  className="w-full h-48 md:h-56 object-cover"
                  loading="lazy"
                />
              </div>

              {/* Experience Badge */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -left-4 md:-left-6 bg-gold text-forest rounded-full w-24 h-24 md:w-28 md:h-28 flex flex-col items-center justify-center premium-shadow-lg"
              >
                <span className="font-heading text-2xl md:text-3xl font-bold">25+</span>
                <span className="text-[8px] md:text-[9px] uppercase tracking-wider font-body font-semibold">Years Legacy</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-body font-semibold">
              ✦ Our Heritage ✦
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-forest mt-3 leading-tight">
              Made in Home,{' '}
              <span className="text-gradient-gold">Made with Heart</span>
            </h2>
            <p className="text-olive text-sm md:text-base font-body leading-relaxed mt-6">
              At SAVORA, every product begins in a kitchen that feels like home. Our artisans follow 
              time-honored recipes handed down through generations, using only the freshest organic 
              ingredients sourced directly from Indian farms.
            </p>
            <p className="text-olive text-sm md:text-base font-body leading-relaxed mt-4">
              No machines, no shortcuts — just patient hands, traditional techniques, and an 
              unwavering commitment to authenticity. From sun-drying pickles on terraces to 
              stone-grinding spices by hand, every step preserves the taste of India's culinary heritage.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gold/20">
              {[
                { value: '200+', label: 'Family Recipes' },
                { value: '50+', label: 'Artisans' },
                { value: '15', label: 'Indian States' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="font-heading text-2xl md:text-3xl font-bold text-forest">{stat.value}</p>
                  <p className="text-[10px] md:text-xs text-olive font-body uppercase tracking-wider mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuthenticitySection;
