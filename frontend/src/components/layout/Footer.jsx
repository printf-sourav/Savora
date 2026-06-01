import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi';
import { BRAND } from '../../utils/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { label: 'All Products', path: '/shop' },
      { label: 'Pickles', path: '/shop?category=pickles' },
      { label: 'Homemade Sweets', path: '/shop?category=sweets' },
      { label: 'Namkeen & Snacks', path: '/shop?category=namkeen' },
      { label: 'Spice Powders', path: '/shop?category=spices' },
    ],
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Contact', path: '/contact' },
      { label: 'Our Story', path: '/about' },
      { label: 'Blog', path: '/blog' },
    ],
    support: [
      { label: 'Track Order', path: '/track-order' },
      { label: 'Shipping Policy', path: '/shipping' },
      { label: 'Return Policy', path: '/returns' },
      { label: 'FAQ', path: '/contact#faq' },
      { label: 'Privacy Policy', path: '/privacy' },
    ],
  };

  const socialIcons = [
    { icon: FiInstagram, url: BRAND.social.instagram, label: 'Instagram' },
    { icon: FiFacebook, url: BRAND.social.facebook, label: 'Facebook' },
    { icon: FiTwitter, url: BRAND.social.twitter, label: 'Twitter' },
    { icon: FiYoutube, url: BRAND.social.youtube, label: 'YouTube' },
  ];

  return (
    <footer className="bg-forest text-cream/80">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <h3 className="font-heading text-3xl font-bold text-cream">{BRAND.name}</h3>
              <p className="text-[10px] tracking-[0.35em] text-gold uppercase mt-1">{BRAND.tagline}</p>
            </Link>
            <p className="text-cream/60 text-sm leading-relaxed mb-6 font-body">
              Crafting authentic Indian flavors with love, tradition, and the finest organic ingredients since generations.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialIcons.map(({ icon: Icon, url, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full border border-cream/20 flex items-center justify-center text-cream/60 hover:bg-gold hover:border-gold hover:text-forest transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-cream mb-5">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm font-body text-cream/60 hover:text-gold transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-cream mb-5">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm font-body text-cream/60 hover:text-gold transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-cream mb-5">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-gold mt-0.5 flex-shrink-0" size={16} />
                <span className="text-sm font-body text-cream/60">{BRAND.address}</span>
              </li>
              <li>
                <a
                  href={`tel:${BRAND.phone}`}
                  className="flex items-center gap-3 text-sm font-body text-cream/60 hover:text-gold transition-colors"
                >
                  <FiPhone className="text-gold flex-shrink-0" size={16} />
                  {BRAND.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="flex items-center gap-3 text-sm font-body text-cream/60 hover:text-gold transition-colors"
                >
                  <FiMail className="text-gold flex-shrink-0" size={16} />
                  {BRAND.email}
                </a>
              </li>
            </ul>

            {/* Payment Icons */}
            <div className="mt-6">
              <p className="text-xs text-cream/40 font-body mb-3 uppercase tracking-wider">Secure Payments</p>
              <div className="flex gap-2 flex-wrap">
                {['UPI', 'Visa', 'MC', 'COD'].map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1 bg-cream/10 rounded text-xs font-body text-cream/50 border border-cream/10"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream/10">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream/40 font-body">
            © {currentYear} {BRAND.name}. All rights reserved. Handcrafted with ❤️ in India.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-xs text-cream/40 hover:text-gold font-body transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs text-cream/40 hover:text-gold font-body transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
