import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/home/HeroSection';
import CategoriesSection from '../components/home/CategoriesSection';
import BestSellers from '../components/home/BestSellers';
import TrendingProducts from '../components/home/TrendingProducts';
import WhyChoose from '../components/home/WhyChoose';
import AuthenticitySection from '../components/home/AuthenticitySection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import InstagramSection from '../components/home/InstagramSection';
import NewsletterSection from '../components/home/NewsletterSection';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Savora — Artisan Snacks &amp; Pickles</title>
        <meta name="description" content="Discover handcrafted Indian snacks, pickles, and condiments made with traditional recipes. Free shipping on orders above ₹999." />
        <meta property="og:title" content="Savora" />
        <meta property="og:description" content="Artisan Indian snacks and pickles" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://savora.in" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <HeroSection />
        <CategoriesSection />
        <BestSellers />
        <TrendingProducts />
        <WhyChoose />
        <AuthenticitySection />
        <TestimonialsSection />
        <InstagramSection />
        <NewsletterSection />
      </motion.div>
    </>
  );
};

export default Home;
