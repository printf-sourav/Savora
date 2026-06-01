import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiBox, FiXCircle, FiMapPin, FiStar } from 'react-icons/fi';
import Breadcrumb from '../components/common/Breadcrumb';
import { formatPrice } from '../utils/constants';
import { orderAPI, reviewAPI } from '../services/api';
import toast from 'react-hot-toast';

// Order status pipeline
const STEPS = [
  { key: 'PROCESSING', label: 'Processing', icon: FiBox },
  { key: 'SHIPPED', label: 'Shipped', icon: FiPackage },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: FiTruck },
  { key: 'DELIVERED', label: 'Delivered', icon: FiCheckCircle },
];

const STATUS_ORDER = { PROCESSING: 0, SHIPPED: 1, OUT_FOR_DELIVERY: 2, DELIVERED: 3 };

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [inputId, setInputId] = useState(initialId);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Review UI state
  const [reviewOpenProductId, setReviewOpenProductId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchOrder = async (id) => {
    if (!id?.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await orderAPI.getById(id.trim());
      setOrder(res.data);
    } catch (err) {
      setError(err.message || 'Order not found. Please check the order ID.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch if ID comes from URL
  useEffect(() => {
    if (initialId) fetchOrder(initialId);
  }, [initialId]);

  const handleTrack = (e) => {
    e.preventDefault();
    fetchOrder(inputId);
  };

  const openReview = (productId) => {
    setReviewOpenProductId(productId);
    setReviewRating(5);
    setReviewComment('');
  };

  const closeReview = () => {
    setReviewOpenProductId(null);
    setReviewRating(5);
    setReviewComment('');
    setReviewSubmitting(false);
  };

  const submitReview = async () => {
    if (!reviewOpenProductId) return;
    if (!reviewComment.trim()) return toast.error('Please write a comment');
    setReviewSubmitting(true);
    try {
      await reviewAPI.create(reviewOpenProductId, { rating: reviewRating, comment: reviewComment });
      toast.success('Review submitted successfully');
      closeReview();
    } catch (err) {
      toast.error(err.message || err || 'Failed to submit review');
      setReviewSubmitting(false);
    }
  };

  const currentStepIdx = order ? (STATUS_ORDER[order.orderStatus] ?? -1) : -1;
  const isCancelled = order?.orderStatus === 'CANCELLED';

  return (
    <>
      <Helmet>
        <title>Track Order | SAVORA</title>
        <meta name="description" content="Track your Savora order status in real-time." />
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-cream min-h-screen">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-4">
          <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Track Order', path: '/track-order' }]} />
        </div>

        <div className="max-w-3xl mx-auto w-full px-4 md:px-6 pb-20 pt-8">
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-forest mb-3">Track Your Order</h1>
            <p className="text-olive font-body text-sm md:text-base">Enter your Order ID to get real-time shipping updates.</p>
          </div>

          {/* Search form */}
          <form onSubmit={handleTrack} className="flex gap-3 max-w-lg mx-auto mb-12">
            <input
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="Enter Order ID…"
              className="flex-1 px-5 py-3.5 rounded-xl border-2 border-gold/20 bg-white text-forest text-sm font-body focus:border-gold outline-none premium-shadow-sm"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-forest text-cream px-8 py-3.5 rounded-xl font-body text-sm font-semibold hover:bg-forest-light transition-colors flex items-center gap-2 premium-shadow-sm disabled:opacity-60"
            >
              <FiSearch size={16} /> {loading ? 'Searching…' : 'Track'}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4 text-sm font-body text-center mb-8">
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="bg-white rounded-3xl p-8 animate-pulse premium-shadow gold-border">
              <div className="h-6 w-48 bg-cream-dark rounded mb-4" />
              <div className="h-4 w-32 bg-cream-dark rounded mb-8" />
              <div className="flex gap-4">{[1,2,3,4].map(i => <div key={i} className="flex-1 h-16 bg-cream-dark rounded-xl" />)}</div>
            </div>
          )}

          {/* Order Result */}
          {order && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 md:p-10 premium-shadow-lg gold-border relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold to-forest" />

              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-8 pb-6 border-b border-gold/10">
                <div>
                  <p className="text-xs text-olive font-body uppercase tracking-widest mb-1">Order ID</p>
                  <p className="font-heading text-xl font-bold text-forest">#{order._id?.slice(-10).toUpperCase()}</p>
                  <p className="text-sm font-body text-olive mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-olive font-body uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="font-heading text-xl font-bold text-forest">{formatPrice(order.totalAmount)}</p>
                  <p className="text-sm font-body text-olive mt-1 capitalize">{order.paymentMethod} · {order.paymentStatus}</p>
                </div>
              </div>

              {/* Cancelled banner */}
              {isCancelled ? (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-8">
                  <FiXCircle size={24} className="text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-body font-semibold text-red-700">Order Cancelled</p>
                    <p className="text-xs text-red-500 font-body">This order has been cancelled. Contact support for help.</p>
                  </div>
                </div>
              ) : (
                /* Stepper */
                <div className="mb-10">
                  <div className="relative flex items-center justify-between">
                    {/* Progress track */}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-gold/10 z-0" />
                    <div
                      className="absolute top-5 left-0 h-0.5 bg-gold z-0 transition-all duration-700"
                      style={{ width: currentStepIdx >= 0 ? `${(currentStepIdx / (STEPS.length - 1)) * 100}%` : '0%' }}
                    />
                    {STEPS.map((step, i) => {
                      const done = i <= currentStepIdx;
                      const current = i === currentStepIdx;
                      return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-all ${done ? 'bg-gold text-forest' : 'bg-cream-dark text-olive'} ${current ? 'ring-4 ring-gold/30 scale-110' : ''}`}>
                            <step.icon size={16} />
                          </div>
                          <p className={`text-[10px] font-body text-center leading-tight ${done ? 'text-forest font-semibold' : 'text-olive'}`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tracking details */}
              {(order.trackingId || order.estimatedDelivery) && (
                <div className="grid md:grid-cols-2 gap-4 mb-8 p-4 bg-cream/50 rounded-2xl">
                  {order.trackingId && (
                    <div>
                      <p className="text-xs text-olive font-body uppercase tracking-wider mb-1">Courier Tracking ID</p>
                      <p className="font-body text-sm font-semibold text-forest font-mono">{order.trackingId}</p>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div>
                      <p className="text-xs text-olive font-body uppercase tracking-wider mb-1">Estimated Delivery</p>
                      <p className="font-body text-sm font-semibold text-green-600">
                        {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Ordered items */}
              <div className="mb-8">
                <p className="text-xs text-olive font-body uppercase tracking-wider mb-4 pb-2 border-b border-gold/10">Ordered Items</p>
                <div className="space-y-3">
                  {order.orderedItems?.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-cream/40 rounded-xl">
                      <img src={item.image || 'https://placehold.co/48x48'} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-gold/10 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-semibold text-forest line-clamp-2">{item.name}</p>
                        {item.variant && <p className="text-xs font-body text-olive">{item.variant}</p>}
                        <p className="text-xs font-body text-olive">Qty: {item.quantity}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="font-body text-sm font-bold text-forest flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                        {order.orderStatus === 'DELIVERED' && (
                          <button
                            onClick={() => setReviewOpenProductId(item.product?._id || item.product)}
                            disabled={reviewSubmitting && reviewOpenProductId === (item.product?._id || item.product)}
                            className="text-xs px-3 py-1.5 border border-forest text-forest rounded-lg font-body hover:bg-forest/5 transition-colors disabled:opacity-60"
                          >
                            Write a review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping address */}
              {order.shippingAddress && (
                <div className="p-4 bg-cream/40 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <FiMapPin size={16} className="text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-olive font-body uppercase tracking-wider mb-1">Shipping To</p>
                      <p className="font-body text-sm font-semibold text-forest">{order.shippingAddress.street}</p>
                      <p className="font-body text-sm text-olive">{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
                      <p className="font-body text-xs text-olive/70">{order.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Modal */}
              {reviewOpenProductId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                    <h3 className="font-heading font-bold text-forest text-lg mb-2">Write a review</h3>
                    <p className="text-sm text-olive mb-4">Share your experience for this product.</p>
                    <div className="flex items-center gap-2 mb-3">
                      {[1,2,3,4,5].map((s) => (
                        <button key={s} onClick={() => setReviewRating(s)} className={`p-2 rounded ${reviewRating >= s ? 'text-amber-500' : 'text-olive/60'}`}>
                          <FiStar />
                        </button>
                      ))}
                      <div className="text-xs text-olive ml-2">{reviewRating} / 5</div>
                    </div>
                    <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Write your review..." className="w-full border border-gold/20 rounded-xl p-3 mb-4 text-sm min-h-[100px]" />
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => closeReview()} disabled={reviewSubmitting} className="py-2 px-4 rounded-xl border border-gold/20 text-forest text-sm">Keep</button>
                      <button onClick={() => submitReview()} disabled={reviewSubmitting} className="py-2 px-4 rounded-xl bg-forest text-cream text-sm font-semibold">
                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default OrderTracking;
