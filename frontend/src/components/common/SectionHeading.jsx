import { motion } from 'framer-motion';

// Section heading component with decorative elements
const SectionHeading = ({ subtitle, title, description, center = true, light = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-10 md:mb-14 ${center ? 'text-center' : ''}`}
    >
      {subtitle && (
        <span
          className={`inline-block text-xs tracking-[0.3em] uppercase font-body font-semibold mb-3 ${
            light ? 'text-gold-light' : 'text-gold'
          }`}
        >
          ✦ {subtitle} ✦
        </span>
      )}
      <h2
        className={`font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight ${
          light ? 'text-cream' : 'text-forest'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-sm md:text-base max-w-2xl font-body leading-relaxed ${
            center ? 'mx-auto' : ''
          } ${light ? 'text-cream/60' : 'text-olive'}`}
        >
          {description}
        </p>
      )}
      {/* Decorative Line */}
      <div className={`mt-6 flex items-center gap-2 ${center ? 'justify-center' : ''}`}>
        <div className={`h-px w-12 ${light ? 'bg-gold/40' : 'bg-gold/30'}`} />
        <div className={`w-2 h-2 rounded-full ${light ? 'bg-gold' : 'bg-gold'}`} />
        <div className={`h-px w-12 ${light ? 'bg-gold/40' : 'bg-gold/30'}`} />
      </div>
    </motion.div>
  );
};

export default SectionHeading;
