import { motion } from 'framer-motion';
import { FiSun, FiHome, FiShield, FiTruck, FiAward, FiHeart } from 'react-icons/fi';
import SectionHeading from '../common/SectionHeading';
import { WHY_CHOOSE } from '../../utils/constants';

const iconMap = {
  leaf: FiSun,
  home: FiHome,
  shield: FiShield,
  truck: FiTruck,
  award: FiAward,
  heart: FiHeart,
};

const WhyChoose = () => {
  return (
    <section className="py-16 md:py-24 bg-forest relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-gold/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-gold/5 blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 relative z-10">
        <SectionHeading
          subtitle="The SAVORA Promise"
          title="Why Choose Us"
          description="Every jar, every packet carries the warmth of home and the purity of tradition."
          light
        />

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {WHY_CHOOSE.map((item, index) => {
            const Icon = iconMap[item.icon] || FiLeaf;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-cream/5 backdrop-blur-sm border border-cream/10 rounded-2xl p-6 md:p-8 hover:bg-cream/10 hover:border-gold/30 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <Icon size={22} className="text-gold" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-cream mb-2">{item.title}</h3>
                <p className="text-sm text-cream/50 font-body leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
