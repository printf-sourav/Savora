import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      toast.success('Thank you for subscribing! 🎉', {
        style: { background: '#1E2B24', color: '#F5EFE4', borderRadius: '12px', border: '1px solid rgba(201,166,107,0.3)' },
        iconTheme: { primary: '#C9A66B', secondary: '#1E2B24' },
      });
      setEmail('');
    }
  };

  return (
    <section className="py-16 md:py-24 bg-forest relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/5 blur-3xl" />
      <div className="absolute top-10 left-10 w-20 h-20 border border-gold/10 rounded-full" />
      <div className="absolute bottom-10 right-10 w-32 h-32 border border-gold/10 rounded-full" />

      <div className="max-w-3xl mx-auto w-full px-4 md:px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-gold text-xs tracking-[0.3em] uppercase font-body font-semibold">
            ✦ Stay Connected ✦
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-cream mt-3">
            Join the SAVORA Family
          </h2>
          <p className="text-cream/50 text-sm md:text-base font-body mt-4 max-w-lg mx-auto">
            Subscribe to receive exclusive offers, new product launches, and traditional recipes straight to your inbox.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-1 px-6 py-4 rounded-full bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/30 font-body text-sm focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="bg-gold text-forest px-8 py-4 rounded-full font-body text-sm font-semibold uppercase tracking-wider hover:bg-gold-light transition-colors flex items-center justify-center gap-2"
          >
            Subscribe <FiSend size={14} />
          </motion.button>
        </motion.form>

        <p className="text-cream/30 text-xs font-body mt-4">
          No spam, unsubscribe at any time. We respect your privacy.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSection;
