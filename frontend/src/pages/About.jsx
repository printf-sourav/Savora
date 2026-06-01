import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiHeart, FiUsers, FiAward, FiGlobe } from 'react-icons/fi';
import SectionHeading from '../components/common/SectionHeading';
import { BRAND } from '../utils/constants';

const About = () => {
  const timeline = [
    { year: '1998', title: 'The Beginning', desc: 'Started as a small kitchen in Jaipur, making pickles for family and friends.' },
    { year: '2005', title: 'Growing Love', desc: 'Word spread across neighborhoods. We began supplying to local stores.' },
    { year: '2015', title: 'Going Digital', desc: 'Launched our online store, bringing authentic homemade flavors to all of India.' },
    { year: '2024', title: 'SAVORA is Born', desc: 'Rebranded as SAVORA — The Art of Taste, serving 50,000+ happy customers.' },
  ];

  return (
    <>
      <Helmet>
        <title>About Us | SAVORA — The Art of Taste</title>
        <meta name="description" content="Discover the story behind SAVORA — a legacy of authentic Indian homemade food crafted with love, tradition, and the finest organic ingredients." />
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Hero */}
        <div className="relative bg-forest py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=1600&q=80" alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-forest to-forest/90" />
          </div>
          <div className="max-w-4xl mx-auto w-full px-4 md:px-6 relative z-10 text-center">
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-body font-semibold">✦ Our Story ✦</span>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-cream mt-4">The Art of Taste</h1>
            <p className="text-cream/60 text-base md:text-lg font-body mt-6 max-w-2xl mx-auto leading-relaxed">
              A journey that began in a humble kitchen in Rajasthan, fueled by a grandmother's recipes 
              and a passion for preserving India's culinary heritage.
            </p>
          </div>
        </div>

        {/* Brand Story */}
        <section className="py-16 md:py-24 bg-cream">
          <div className="max-w-7xl mx-auto w-full px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="relative">
                  <div className="rounded-3xl overflow-hidden premium-shadow-lg">
                    <img src="https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=800" alt="Traditional cooking" className="w-full h-[450px] object-cover" loading="lazy" />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-gold rounded-2xl p-6 premium-shadow-lg">
                    <p className="font-heading text-3xl font-bold text-forest">25+</p>
                    <p className="text-xs font-body text-forest/70 uppercase tracking-wider">Years of Legacy</p>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <span className="text-gold text-xs tracking-[0.3em] uppercase font-body font-semibold">✦ Brand Journey ✦</span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-forest mt-3 leading-tight">From Grandmother's Kitchen to Your Table</h2>
                <p className="text-olive text-sm md:text-base font-body leading-relaxed mt-6">
                  SAVORA was born from the belief that the best food comes from home. Our story started in 1998 
                  when our founder's grandmother, Kamala Devi, began making her legendary mango pickle for the entire neighborhood.
                </p>
                <p className="text-olive text-sm md:text-base font-body leading-relaxed mt-4">
                  What started as a passion project soon became a movement — to bring authentic, preservative-free, 
                  homemade Indian food to every household. Today, SAVORA employs over 50 women artisans from rural 
                  Rajasthan, empowering communities while preserving culinary traditions.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto w-full px-4 md:px-6">
            <SectionHeading subtitle="What Drives Us" title="Our Values" description="Four pillars that define everything we do at SAVORA." />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: FiHeart, title: 'Authenticity', desc: 'We never compromise on traditional recipes and methods.' },
                { icon: FiUsers, title: 'Community', desc: 'Empowering rural artisans, especially women, through fair employment.' },
                { icon: FiAward, title: 'Quality', desc: 'FSSAI certified, organic ingredients, zero preservatives.' },
                { icon: FiGlobe, title: 'Sustainability', desc: 'Eco-friendly packaging and sustainable sourcing practices.' },
              ].map((value, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-cream rounded-2xl p-6 md:p-8 text-center premium-shadow gold-border hover:premium-shadow-lg transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/20 transition-colors">
                    <value.icon size={24} className="text-gold" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-forest mb-2">{value.title}</h3>
                  <p className="text-sm text-olive font-body">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 md:py-24 bg-forest">
          <div className="max-w-4xl mx-auto w-full px-4 md:px-6">
            <SectionHeading subtitle="Our Journey" title="Milestones" light />
            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gold/20 md:-translate-x-px" />
              {timeline.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  className={`relative flex items-start gap-6 mb-10 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} md:text-${i % 2 === 0 ? 'right' : 'left'}`}>
                  <div className="hidden md:block flex-1" />
                  <div className="relative z-10 w-8 h-8 rounded-full bg-gold flex items-center justify-center flex-shrink-0 premium-shadow">
                    <div className="w-3 h-3 rounded-full bg-forest" />
                  </div>
                  <div className="flex-1 bg-cream/5 border border-cream/10 rounded-2xl p-5 backdrop-blur-sm">
                    <span className="text-gold font-heading text-xl font-bold">{item.year}</span>
                    <h3 className="font-heading text-lg font-semibold text-cream mt-1">{item.title}</h3>
                    <p className="text-sm text-cream/50 font-body mt-2">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-cream text-center">
          <div className="max-w-3xl mx-auto w-full px-4">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-forest">Taste the Difference</h2>
            <p className="text-olive font-body mt-4 mb-8">Experience the authentic flavors of India, crafted with love and tradition.</p>
            <a href="/shop" className="inline-flex items-center gap-2 bg-gold text-forest px-8 py-4 rounded-full font-body text-sm font-semibold uppercase tracking-wider hover:bg-gold-light transition-all">
              Shop Our Collection
            </a>
          </div>
        </section>
      </motion.div>
    </>
  );
};

export default About;
