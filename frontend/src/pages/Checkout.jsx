import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiCreditCard, FiCheckCircle, FiChevronRight, FiPlus } from 'react-icons/fi';
import { selectCartTotal, clearCart } from '../redux/slices/cartSlice';
import { placeOrder } from '../redux/slices/orderSlice';
import { formatPrice } from '../utils/constants';
import { orderAPI, paymentAPI, authAPI } from '../services/api';
import Breadcrumb from '../components/common/Breadcrumb';
import toast from 'react-hot-toast';

// ─── Helper: load Razorpay script ─────────────────────────────────────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, coupon, couponDiscount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const cartTotal = useSelector(selectCartTotal);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TASK 3: Saved addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues, reset } = useForm();

  const shipping = cartTotal >= 999 ? 0 : 79;
  const discount = couponDiscount ? (cartTotal * couponDiscount) / 100 : 0;
  const finalTotal = cartTotal - discount + shipping;

  // TASK 3: Fetch user's saved addresses
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authAPI.getProfile();
        const addresses = res.data?.addresses || [];
        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          const def = addresses.find((a) => a.isDefault) || addresses[0];
          setSelectedAddressId(def._id);
          setShowNewAddressForm(false);
        } else {
          setShowNewAddressForm(true);
        }
      } catch {
        setShowNewAddressForm(true);
      }
    };
    if (user) fetchProfile();
    else setShowNewAddressForm(true);
  }, [user]);

  // Build the shippingAddress object from either saved address or form
  const getShippingAddress = () => {
    if (selectedAddressId && !showNewAddressForm) {
      const addr = savedAddresses.find((a) => a._id === selectedAddressId);
      if (addr) return { street: addr.street, city: addr.city, state: addr.state, country: addr.country || 'India', pincode: addr.pincode };
    }
    const v = getValues();
    return {
      street: [v.address1, v.address2].filter(Boolean).join(', '),
      city: v.city, state: v.state, country: 'India', pincode: v.pincode,
    };
  };

  // TASK 1: Razorpay online payment flow
  const handleOnlinePayment = async (newOrder) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) throw new Error('Failed to load Razorpay SDK. Check your internet connection.');

    const rzpRes = await paymentAPI.createRazorpayOrder({ amount: finalTotal, orderId: newOrder._id });
    const { razorpayOrderId, amount, currency, key } = rzpRes.data;

    return new Promise((resolve, reject) => {
      const options = {
        key,
        amount,
        currency,
        name: 'Savora',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await paymentAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: newOrder._id,
            });
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#1E2B24' },
        modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const onSubmit = async () => {
    if (step < 3) { setStep(step + 1); return; }

    setIsSubmitting(true);
    try {
      const payload = {
        orderedItems: items.map((item) => ({
          product: item._id || item.id,
          name: item.name || item.title,
          quantity: item.quantity,
          price: item.selectedVariant?.price || item.discountPrice || item.price,
          image: item.selectedVariant?.image || item.images?.[0]?.url || item.image || '',
          variant: item.selectedVariant?.name || '',
        })),
        shippingAddress: getShippingAddress(),
        paymentMethod: paymentMethod.toUpperCase(),
        totalAmount: finalTotal,
        shippingCharge: shipping,
        couponDiscount: discount,
        couponCode: coupon || undefined,
      };

      // Create order via Redux thunk (placeOrder) to keep state consistent
      const action = await dispatch(placeOrder(payload)).unwrap();
      const newOrder = action.data || action;

        // If ONLINE payment, trigger Razorpay modal using the created order
        if (paymentMethod === 'ONLINE') {
          await handleOnlinePayment(newOrder);
        }
      toast.success('Order placed successfully! 🎉', {
        style: { background: '#1E2B24', color: '#F5EFE4', borderRadius: '12px', border: '1px solid rgba(201,166,107,0.3)' },
        duration: 4000,
      });
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Address', icon: FiMapPin },
    { num: 2, label: 'Payment', icon: FiCreditCard },
    { num: 3, label: 'Confirm', icon: FiCheckCircle },
  ];

  const selectedAddr = savedAddresses.find((a) => a._id === selectedAddressId);

  return (
    <>
      <Helmet><title>Checkout | SAVORA</title></Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-cream min-h-screen">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-4">
          <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Cart', path: '/cart' }, { label: 'Checkout', path: '/checkout' }]} />
        </div>

        <div className="max-w-5xl mx-auto w-full px-4 md:px-6 pb-16">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-forest mb-8">Checkout</h1>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-10">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body font-medium transition-all ${step >= s.num ? 'bg-forest text-cream' : 'bg-white text-olive gold-border'}`}>
                  <s.icon size={16} />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < steps.length - 1 && <FiChevronRight size={16} className="mx-2 text-olive/30" />}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)}>

                {/* ─── Step 1: Address ─── */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-6 md:p-8 premium-shadow gold-border">
                    <h2 className="font-heading text-xl font-semibold text-forest mb-6">Delivery Address</h2>

                    {/* TASK 3: Saved address cards */}
                    {savedAddresses.length > 0 && (
                      <div className="mb-6 space-y-3">
                        <p className="text-sm font-body font-semibold text-forest mb-2">Saved Addresses</p>
                        {savedAddresses.map((addr) => (
                          <label
                            key={addr._id}
                            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedAddressId === addr._id && !showNewAddressForm
                                ? 'border-gold bg-gold/5'
                                : 'border-gold/10 hover:border-gold/30'
                            }`}
                          >
                            <input
                              type="radio"
                              name="savedAddress"
                              checked={selectedAddressId === addr._id && !showNewAddressForm}
                              onChange={() => { setSelectedAddressId(addr._id); setShowNewAddressForm(false); }}
                              className="mt-1 accent-forest"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-body font-medium text-forest">
                                {addr.street}, {addr.city}, {addr.state} — {addr.pincode}
                              </p>
                              <p className="text-xs text-olive font-body">{addr.country}</p>
                              {addr.isDefault && (
                                <span className="text-[10px] bg-gold/20 text-gold-dark px-2 py-0.5 rounded-full font-body font-semibold">Default</span>
                              )}
                            </div>
                          </label>
                        ))}

                        {/* Add new address option */}
                        <label
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            showNewAddressForm ? 'border-gold bg-gold/5' : 'border-gold/10 hover:border-gold/30'
                          }`}
                        >
                          <input
                            type="radio"
                            name="savedAddress"
                            checked={showNewAddressForm}
                            onChange={() => { setShowNewAddressForm(true); setSelectedAddressId(null); }}
                            className="accent-forest"
                          />
                          <FiPlus size={14} className="text-forest" />
                          <span className="text-sm font-body font-medium text-forest">Add new address</span>
                        </label>
                      </div>
                    )}

                    {/* Manual address form */}
                    <AnimatePresence>
                      {showNewAddressForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid md:grid-cols-2 gap-4"
                        >
                          <div>
                            <label className="text-xs font-body font-medium text-forest mb-1.5 block">Full Name *</label>
                            <input {...register('fullName', { required: showNewAddressForm ? 'Name is required' : false })} className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none" placeholder="Enter your name" />
                            {errors.fullName && <p className="text-red-500 text-xs mt-1 font-body">{errors.fullName.message}</p>}
                          </div>
                          <div>
                            <label className="text-xs font-body font-medium text-forest mb-1.5 block">Phone *</label>
                            <input {...register('phone', { required: showNewAddressForm ? 'Phone is required' : false, pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid phone' } })} className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none" placeholder="10-digit mobile" />
                            {errors.phone && <p className="text-red-500 text-xs mt-1 font-body">{errors.phone.message}</p>}
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs font-body font-medium text-forest mb-1.5 block">Address Line 1 *</label>
                            <input {...register('address1', { required: showNewAddressForm ? 'Address is required' : false })} className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none" placeholder="House/Flat No., Street, Area" />
                            {errors.address1 && <p className="text-red-500 text-xs mt-1 font-body">{errors.address1.message}</p>}
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs font-body font-medium text-forest mb-1.5 block">Address Line 2</label>
                            <input {...register('address2')} className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none" placeholder="Landmark (optional)" />
                          </div>
                          <div>
                            <label className="text-xs font-body font-medium text-forest mb-1.5 block">City *</label>
                            <input {...register('city', { required: showNewAddressForm ? 'City is required' : false })} className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none" placeholder="City" />
                            {errors.city && <p className="text-red-500 text-xs mt-1 font-body">{errors.city.message}</p>}
                          </div>
                          <div>
                            <label className="text-xs font-body font-medium text-forest mb-1.5 block">State *</label>
                            <input {...register('state', { required: showNewAddressForm ? 'State is required' : false })} className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none" placeholder="State" />
                            {errors.state && <p className="text-red-500 text-xs mt-1 font-body">{errors.state.message}</p>}
                          </div>
                          <div>
                            <label className="text-xs font-body font-medium text-forest mb-1.5 block">PIN Code *</label>
                            <input {...register('pincode', { required: showNewAddressForm ? 'PIN required' : false, pattern: { value: /^\d{6}$/, message: 'Invalid PIN' } })} className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none" placeholder="6-digit PIN" />
                            {errors.pincode && <p className="text-red-500 text-xs mt-1 font-body">{errors.pincode.message}</p>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button type="submit" className="mt-6 w-full bg-forest text-cream py-4 rounded-xl font-body text-sm font-semibold hover:bg-forest-light transition-colors">
                      Continue to Payment
                    </button>
                  </motion.div>
                )}

                {/* ─── Step 2: Payment ─── */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-6 md:p-8 premium-shadow gold-border">
                    <h2 className="font-heading text-xl font-semibold text-forest mb-6">Payment Method</h2>
                    <div className="space-y-3">
                      {[
                        { id: 'COD', label: 'Cash on Delivery', desc: 'Pay when you receive your order', icon: '💵' },
                        { id: 'ONLINE', label: 'Pay Online (Razorpay)', desc: 'UPI, Cards, Net Banking — secure & instant', icon: '⚡' },
                      ].map((method) => (
                        <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? 'border-gold bg-gold/5' : 'border-gold/10 hover:border-gold/30'}`}>
                          <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="hidden" />
                          <span className="text-2xl">{method.icon}</span>
                          <div className="flex-1">
                            <p className="font-body text-sm font-semibold text-forest">{method.label}</p>
                            <p className="text-xs text-olive font-body">{method.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? 'border-gold' : 'border-gold/20'}`}>
                            {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl border-2 border-gold/20 text-forest font-body text-sm font-semibold hover:border-gold transition-colors">Back</button>
                      <button type="submit" className="flex-1 bg-forest text-cream py-4 rounded-xl font-body text-sm font-semibold hover:bg-forest-light transition-colors">Review Order</button>
                    </div>
                  </motion.div>
                )}

                {/* ─── Step 3: Confirm ─── */}
                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-6 md:p-8 premium-shadow gold-border">
                    <h2 className="font-heading text-xl font-semibold text-forest mb-6">Order Review</h2>
                    <div className="space-y-3 mb-6">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-cream rounded-xl">
                          <img src={item.selectedVariant?.image || item.images?.[0]?.url || item.image} alt={item.name || item.title} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-body font-medium text-forest truncate">{item.name || item.title}</p>
                            <p className="text-xs text-olive font-body">Qty: {item.quantity}{item.selectedVariant ? ` • ${item.selectedVariant.name}` : ''}</p>
                          </div>
                          <p className="font-body text-sm font-semibold text-forest">{formatPrice((item.selectedVariant?.price || item.discountPrice || item.price) * item.quantity)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Address summary */}
                    <div className="p-4 bg-cream rounded-xl mb-6">
                      <div className="flex items-start gap-2">
                        <FiMapPin className="text-gold mt-0.5" size={16} />
                        <div>
                          {selectedAddr && !showNewAddressForm ? (
                            <>
                              <p className="text-sm font-body font-semibold text-forest">{selectedAddr.street}</p>
                              <p className="text-xs text-olive font-body">{selectedAddr.city}, {selectedAddr.state} — {selectedAddr.pincode}</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-body font-semibold text-forest">{getValues('fullName')}</p>
                              <p className="text-xs text-olive font-body">{getValues('address1')}, {getValues('city')}, {getValues('state')} — {getValues('pincode')}</p>
                              <p className="text-xs text-olive font-body mt-1">📞 {getValues('phone')}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 rounded-xl border-2 border-gold/20 text-forest font-body text-sm font-semibold hover:border-gold transition-colors">Back</button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gold text-forest py-4 rounded-xl font-body text-sm font-bold hover:bg-gold-light transition-colors premium-shadow disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting
                          ? (paymentMethod === 'ONLINE' ? 'Opening Payment...' : 'Placing Order...')
                          : `Place Order — ${formatPrice(finalTotal)}`}
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 premium-shadow gold-border sticky top-28">
                <h3 className="font-heading text-lg font-semibold text-forest mb-4">Summary</h3>
                <div className="space-y-3 text-sm font-body">
                  <div className="flex justify-between"><span className="text-olive">Subtotal</span><span className="text-forest font-medium">{formatPrice(cartTotal)}</span></div>
                  {discount > 0 && <div className="flex justify-between"><span className="text-olive">Discount ({coupon})</span><span className="text-green-600">-{formatPrice(discount)}</span></div>}
                  <div className="flex justify-between"><span className="text-olive">Shipping</span><span className={shipping === 0 ? 'text-green-600' : 'text-forest'}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-gold/10">
                  <span className="font-heading text-base font-semibold text-forest">Total</span>
                  <span className="font-heading text-lg font-bold text-forest">{formatPrice(finalTotal)}</span>
                </div>
                <div className="mt-4 p-3 bg-gold/10 rounded-xl">
                  <p className="text-[10px] text-forest/60 font-body text-center">🔒 Your payment is secure and encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Checkout;
