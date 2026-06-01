import { motion } from 'framer-motion';
import { FiInstagram } from 'react-icons/fi';
import SectionHeading from '../common/SectionHeading';
import { INSTAGRAM_GALLERY, BRAND } from '../../utils/constants';

const InstagramSection = () => {
  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6">
        <SectionHeading
          subtitle="Follow us @savora"
          title="Instagram Gallery"
          description="Tag #SavoraFlavors and get featured on our page."
        />
      </div>

      {/* Full-width Gallery */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-1 md:gap-2 max-w-7xl mx-auto px-4 md:px-6">
        {INSTAGRAM_GALLERY.map((image, index) => (
          <motion.a
            key={index}
            href={BRAND.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="group relative aspect-square rounded-xl overflow-hidden"
          >
            <img
              src={image}
              alt={`SAVORA Instagram ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/50 transition-all duration-300 flex items-center justify-center">
              <FiInstagram
                size={24}
                className="text-cream opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300"
              />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
};

export default InstagramSection;
