import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { adminAPI } from '../../services/api';

const HeroSection = () => {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    adminAPI.getActiveBanner()
      .then(res => { if (res.data) setBanner(res.data); })
      .catch(() => {}); // gracefully fall back to static
  }, []);

  // If a live banner is active, render it fullscreen
  if (banner) {
    return (
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-end overflow-hidden">
        {/* Banner image */}
        <div className="absolute inset-0">
          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest/80 via-forest/60 to-transparent" />
        </div>
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full pb-20 pt-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-heading text-4xl md:text-6xl xl:text-7xl font-bold text-cream leading-tight mb-4">{banner.title}</h1>
            {banner.subtitle && (
              <p className="text-cream/70 text-base md:text-xl font-body mb-8 max-w-xl">{banner.subtitle}</p>
            )}
            <Link to={banner.ctaLink || '/shop'}
              className="inline-flex items-center gap-2 bg-gold text-forest px-8 py-4 rounded-full font-body text-sm font-semibold uppercase tracking-wider hover:bg-gold-light transition-all premium-shadow-lg">
              {banner.ctaText || 'Shop Now'} <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  // Fallback: static hero
  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden bg-forest">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&q=80"
          alt="Indian spices and ingredients"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/90 to-forest/60" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-gold/5 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block text-gold text-xs tracking-[0.4em] uppercase font-body font-semibold mb-6 border border-gold/30 px-4 py-2 rounded-full">
                ✦ Handcrafted with Love ✦
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-cream leading-[1.1] mb-6"
            >
              Taste the{' '}
              <span className="text-gradient-gold">Tradition</span>
              <br />
              of India
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-cream/60 text-base md:text-lg font-body leading-relaxed max-w-lg mb-8"
            >
              Premium homemade pickles, sweets, snacks & spices crafted from 
              authentic family recipes passed down through generations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 bg-gold text-forest px-8 py-4 rounded-full font-body text-sm font-semibold uppercase tracking-wider hover:bg-gold-light transition-all duration-300 premium-shadow-lg"
              >
                Shop Now
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 border border-cream/30 text-cream px-8 py-4 rounded-full font-body text-sm font-semibold uppercase tracking-wider hover:bg-cream/10 hover:border-cream/50 transition-all duration-300"
              >
                Our Story
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-12 flex items-center gap-6 md:gap-8"
            >
              {[
                { number: '100%', label: 'Organic' },
                { number: '50K+', label: 'Happy Customers' },
                { number: '4.9', label: 'Average Rating' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="font-heading text-xl md:text-2xl font-bold text-gold">{stat.number}</p>
                  <p className="text-[10px] md:text-xs text-cream/40 font-body uppercase tracking-wider mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="hidden lg:block relative"
          >
            <div className="relative">
              {/* Main Image */}
              <div className="w-[450px] h-[450px] rounded-full overflow-hidden border-4 border-gold/20 mx-auto premium-shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&q=80"
                  alt="Premium Indian spices and food"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Badge 1 */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-4 top-20 bg-cream/95 backdrop-blur-sm rounded-2xl p-4 premium-shadow-lg gold-border"
              >
                <p className="font-heading text-lg font-bold text-forest">100%</p>
                <p className="text-[10px] text-olive font-body uppercase tracking-wider">Natural</p>
              </motion.div>

              {/* Floating Badge 2 */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -right-4 bottom-20 bg-cream/95 backdrop-blur-sm rounded-2xl p-4 premium-shadow-lg gold-border"
              >
                <p className="font-heading text-lg font-bold text-forest">FSSAI</p>
                <p className="text-[10px] text-olive font-body uppercase tracking-wider">Certified</p>
              </motion.div>

              {/* Decorative Ring */}
              <div className="absolute -inset-8 rounded-full border border-gold/10 animate-spin" style={{ animationDuration: '30s' }} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-cream/30 flex items-start justify-center pt-2">
          <div className="w-1 h-2 bg-gold rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
