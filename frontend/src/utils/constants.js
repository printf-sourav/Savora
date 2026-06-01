// ===== SAVORA Constants =====

export const BRAND = {
  name: 'SAVORA',
  tagline: 'The Art of Taste',
  fullName: 'SAVORA — The Art of Taste',
  description: 'Premium homemade Indian food crafted with authentic family recipes, organic ingredients, and generations of culinary tradition.',
  email: 'hello@savora.in',
  phone: '+91 98765 43210',
  whatsapp: '+919876543210',
  address: '42, Heritage Lane, Jaipur, Rajasthan 302001, India',
  social: {
    instagram: 'https://instagram.com/savora',
    facebook: 'https://facebook.com/savora',
    twitter: 'https://twitter.com/savora',
    youtube: 'https://youtube.com/savora',
    pinterest: 'https://pinterest.com/savora',
  },
};

export const CATEGORIES = [
  {
    id: 'pickles',
    name: 'Pickles',
    slug: 'pickles',
    description: 'Sun-dried, hand-ground, and fermented to perfection',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600',
    itemCount: 24,
  },
  {
    id: 'sweets',
    name: 'Homemade Sweets',
    slug: 'sweets',
    description: 'Traditional mithai made with pure ghee and love',
    image: 'https://images.unsplash.com/photo-1666190050914-fdb9df4eb4d2?w=600',
    itemCount: 18,
  },
  {
    id: 'namkeen',
    name: 'Namkeen & Snacks',
    slug: 'namkeen',
    description: 'Crispy, crunchy delights from Indian kitchens',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600',
    itemCount: 32,
  },
  {
    id: 'spices',
    name: 'Spice Powders',
    slug: 'spices',
    description: 'Freshly ground masalas for authentic flavors',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600',
    itemCount: 15,
  },
];



export const PRODUCTS = [];

export const TESTIMONIALS = [];

export const WHY_CHOOSE = [
  {
    icon: 'leaf',
    title: '100% Organic',
    description: 'Every ingredient is sourced from certified organic farms across India.',
  },
  {
    icon: 'home',
    title: 'Homemade With Love',
    description: 'Crafted in small batches by skilled artisans following age-old family recipes.',
  },
  {
    icon: 'shield',
    title: 'No Preservatives',
    description: 'Zero artificial colors, flavors, or preservatives. Just pure, natural goodness.',
  },
  {
    icon: 'truck',
    title: 'Pan-India Delivery',
    description: 'Carefully packed and delivered fresh to your doorstep across India.',
  },
  {
    icon: 'award',
    title: 'Premium Quality',
    description: 'FSSAI certified with rigorous quality checks at every stage.',
  },
  {
    icon: 'heart',
    title: 'Family Recipes',
    description: 'Recipes passed down through generations, preserving authentic flavors.',
  },
];

export const FAQS = [
  {
    question: 'Are your products 100% homemade?',
    answer: 'Yes, all our products are handcrafted in small batches by skilled artisans in our certified kitchen facilities, following traditional family recipes passed down through generations.',
  },
  {
    question: 'Do you use any preservatives?',
    answer: 'Absolutely not. We believe in keeping things natural. Our products contain zero artificial colors, flavors, or preservatives. Traditional preservation methods like sun-drying and natural fermentation are used.',
  },
  {
    question: 'What is the shelf life of your products?',
    answer: 'Shelf life varies by product. Pickles last 12 months, spice powders 6-12 months, namkeen 3 months, and sweets 21-30 days. Exact details are mentioned on each product page.',
  },
  {
    question: 'Do you deliver across India?',
    answer: 'Yes, we deliver to all major cities and towns across India. Remote locations may take 2-3 extra days. Free shipping on orders above ₹999.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods including UPI, Credit/Debit Cards, Net Banking, Wallets, and Cash on Delivery (COD).',
  },
  {
    question: 'Can I return or exchange products?',
    answer: 'Due to the perishable nature of our food products, we don\'t accept returns. However, if you receive a damaged or incorrect product, we\'ll provide a full replacement or refund.',
  },
];

export const INSTAGRAM_GALLERY = [
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1666190050914-fdb9df4eb4d2?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=400&h=400&fit=crop',
];

// Format price to Indian Rupee
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
