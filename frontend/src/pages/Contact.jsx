import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiPhone, FiMail, FiMessageCircle, FiSend } from 'react-icons/fi';
import SectionHeading from '../components/common/SectionHeading';
import Breadcrumb from '../components/common/Breadcrumb';
import { BRAND, FAQS } from '../utils/constants';
import toast from 'react-hot-toast';
import { useState } from 'react';

const Contact = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [activeFaq, setActiveFaq] = useState(null);

  const onSubmit = (data) => {
    // Simulate API call
    toast.success('Message sent successfully! We will get back to you soon.', {
      style: { background: '#1E2B24', color: '#F5EFE4', borderRadius: '12px', border: '1px solid rgba(201,166,107,0.3)' },
    });
    reset();
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | SAVORA</title>
        <meta name="description" content={`Get in touch with ${BRAND.name}. We are here to help you with any questions about our homemade Indian food.`} />
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-cream min-h-screen">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-4">
          <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Contact', path: '/contact' }]} />
        </div>

        {/* Header */}
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-8 text-center">
          <span className="text-gold text-xs tracking-[0.3em] uppercase font-body font-semibold">✦ Get in Touch ✦</span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-forest mt-3 mb-4">Contact Us</h1>
          <p className="text-olive font-body max-w-2xl mx-auto">We'd love to hear from you. Whether you have a question about our products, an order, or just want to say hello.</p>
        </div>

        {/* Contact Info & Form */}
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl p-6 md:p-8 premium-shadow gold-border">
                <h3 className="font-heading text-xl font-semibold text-forest mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 text-gold">
                      <FiMapPin size={18} />
                    </div>
                    <div>
                      <p className="font-body text-sm font-semibold text-forest mb-1">Our Location</p>
                      <p className="text-sm text-olive font-body">{BRAND.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 text-gold">
                      <FiPhone size={18} />
                    </div>
                    <div>
                      <p className="font-body text-sm font-semibold text-forest mb-1">Phone Number</p>
                      <a href={`tel:${BRAND.phone}`} className="text-sm text-olive font-body hover:text-gold transition-colors">{BRAND.phone}</a>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 text-gold">
                      <FiMail size={18} />
                    </div>
                    <div>
                      <p className="font-body text-sm font-semibold text-forest mb-1">Email Address</p>
                      <a href={`mailto:${BRAND.email}`} className="text-sm text-olive font-body hover:text-gold transition-colors">{BRAND.email}</a>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gold/10">
                  <h4 className="font-heading text-lg font-semibold text-forest mb-4">Quick Support</h4>
                  <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-xl font-body text-sm font-semibold hover:bg-[#128C7E] transition-colors">
                    <FiMessageCircle size={18} /> WhatsApp Us
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 md:p-8 premium-shadow gold-border">
                <h3 className="font-heading text-xl font-semibold text-forest mb-6">Send us a Message</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-body font-medium text-forest mb-1.5 block">Full Name *</label>
                      <input {...register('name', { required: 'Name is required' })} className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none" placeholder="Your name" />
                      {errors.name && <p className="text-red-500 text-xs mt-1 font-body">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-body font-medium text-forest mb-1.5 block">Email Address *</label>
                      <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} type="email" className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none" placeholder="Your email" />
                      {errors.email && <p className="text-red-500 text-xs mt-1 font-body">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-body font-medium text-forest mb-1.5 block">Subject *</label>
                    <input {...register('subject', { required: 'Subject is required' })} className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none" placeholder="How can we help?" />
                    {errors.subject && <p className="text-red-500 text-xs mt-1 font-body">{errors.subject.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-body font-medium text-forest mb-1.5 block">Message *</label>
                    <textarea {...register('message', { required: 'Message is required' })} rows="5" className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none resize-none" placeholder="Write your message here..."></textarea>
                    {errors.message && <p className="text-red-500 text-xs mt-1 font-body">{errors.message.message}</p>}
                  </div>
                  <button type="submit" className="w-full sm:w-auto bg-forest text-cream px-8 py-4 rounded-xl font-body text-sm font-semibold flex items-center justify-center gap-2 hover:bg-forest-light transition-colors">
                    Send Message <FiSend size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div id="faq" className="bg-white py-16 md:py-24">
          <div className="max-w-3xl mx-auto w-full px-4 md:px-6">
            <SectionHeading subtitle="Got Questions?" title="Frequently Asked Questions" />
            <div className="space-y-4 mt-8">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-gold/20 rounded-2xl overflow-hidden bg-cream">
                  <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none">
                    <span className="font-heading text-lg font-semibold text-forest">{faq.question}</span>
                    <span className="text-gold text-2xl font-body leading-none">{activeFaq === i ? '−' : '+'}</span>
                  </button>
                  <motion.div initial={false} animate={{ height: activeFaq === i ? 'auto' : 0, opacity: activeFaq === i ? 1 : 0 }} className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm text-olive font-body leading-relaxed border-t border-gold/10 pt-4">{faq.answer}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Contact;
