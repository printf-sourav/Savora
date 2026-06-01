import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import SectionHeading from '../common/SectionHeading';
import { TESTIMONIALS } from '../../utils/constants';

const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6">
        <SectionHeading
          subtitle="What Our Customers Say"
          title="Loved by Thousands"
          description="Don't just take our word for it. Here's what our customers have to say about SAVORA."
        />

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-14"
        >
          {TESTIMONIALS.map((testimonial, index) => (
            <SwiperSlide key={testimonial.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-cream rounded-2xl p-6 md:p-8 premium-shadow gold-border h-full"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} size={14} className="text-gold fill-gold" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-forest/80 font-body leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gold/10">
                  <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-cream font-body text-xs font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-body text-sm font-semibold text-forest">{testimonial.name}</p>
                    <p className="text-[10px] text-olive font-body">{testimonial.location} • {testimonial.product}</p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TestimonialsSection;
