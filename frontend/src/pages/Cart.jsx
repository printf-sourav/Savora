import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiShoppingBag, FiTag, FiArrowRight, FiX } from 'react-icons/fi';
import { applyCoupon, removeCoupon, selectCartTotal } from '../redux/slices/cartSlice';
import { formatPrice } from '../utils/constants';
import Breadcrumb from '../components/common/Breadcrumb';
import CartItem from '../components/cart/CartItem';
import toast from 'react-hot-toast';

const Cart = () => {
  const dispatch = useDispatch();
  const { items, coupon, couponDiscount } = useSelector((state) => state.cart);
  const cartTotal = useSelector(selectCartTotal);
  const [couponCode, setCouponCode] = useState('');

  const shipping = cartTotal >= 999 ? 0 : 79;
  const discount = couponDiscount ? (cartTotal * couponDiscount) / 100 : 0;
  const finalTotal = cartTotal - discount + shipping;

  const handleApplyCoupon = async () => {
    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: couponCode, orderValue: cartTotal })
      });
      const data = await response.json();

      if (response.ok) {
        dispatch(applyCoupon({ code: data.data.code, discount: data.data.discountPercentage }));
        toast.success(`Coupon applied! ${data.data.discountPercentage}% discount added.`);
        setCouponCode('');
      } else {
        toast.error(data.message || 'Invalid coupon code');
      }
    } catch (error) {
      toast.error('Failed to validate coupon');
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Helmet><title>Cart | SAVORA</title></Helmet>
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <FiShoppingBag size={64} className="text-gold/30 mx-auto mb-6" />
            <h2 className="font-heading text-3xl font-bold text-forest mb-3">Your Cart is Empty</h2>
            <p className="text-olive font-body mb-8">Looks like you haven't added any items yet.</p>
            <Link to="/shop" className="inline-flex items-center gap-2 bg-forest text-cream px-8 py-4 rounded-full font-body text-sm font-semibold hover:bg-forest-light transition-colors">
              Start Shopping <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>{`Cart (${items.length}) | SAVORA`}</title></Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-4">
          <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Cart', path: '/cart' }]} />
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pb-16">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-forest mb-8">Shopping Cart</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={`${item.id}-${item.selectedVariant?.id || 'default'}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CartItem item={item} index={index} />
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 premium-shadow gold-border sticky top-28">
                <h3 className="font-heading text-xl font-semibold text-forest mb-6">Order Summary</h3>

                {/* Coupon */}
                <div className="mb-6">
                  {coupon ? (
                    <div className="flex items-center justify-between bg-gold/10 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FiTag size={14} className="text-gold" />
                        <span className="text-sm font-body font-medium text-forest">{coupon}</span>
                        <span className="text-xs text-gold font-body">(-{couponDiscount}%)</span>
                      </div>
                      <button onClick={() => dispatch(removeCoupon())} className="text-olive hover:text-red-500"><FiX size={16} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon code"
                        className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest focus:border-gold outline-none"
                      />
                      <button onClick={handleApplyCoupon} className="px-6 py-2.5 bg-forest text-cream rounded-xl text-sm font-body font-medium hover:bg-forest-light transition-colors flex-shrink-0 whitespace-nowrap">
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pb-4 border-b border-gold/10">
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-olive">Subtotal ({items.length} items)</span>
                    <span className="text-forest font-medium">{formatPrice(cartTotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm font-body">
                      <span className="text-olive">Discount</span>
                      <span className="text-green-600 font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-olive">Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-forest'}`}>
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mt-4 mb-6">
                  <span className="font-heading text-lg font-semibold text-forest">Total</span>
                  <span className="font-heading text-xl font-bold text-forest">{formatPrice(finalTotal)}</span>
                </div>

                {shipping > 0 && (
                  <p className="text-[10px] text-gold font-body text-center mb-4">
                    Add {formatPrice(999 - cartTotal)} more for free shipping!
                  </p>
                )}

                <Link to="/checkout" className="block w-full bg-gold text-forest py-4 rounded-xl font-body text-sm font-semibold text-center hover:bg-gold-light transition-colors premium-shadow">
                  Proceed to Checkout
                </Link>

                <Link to="/shop" className="block text-center text-sm text-olive font-body mt-4 hover:text-gold transition-colors">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Cart;
