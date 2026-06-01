import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiEdit3, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { reviewAPI } from '../../services/api';
import ReviewCard from './ReviewCard';
import toast from 'react-hot-toast';

const StarSelector = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map((star) => (
      <button key={star} type="button" onClick={() => onChange(star)} className="text-2xl transition-transform hover:scale-110">
        <FiStar className={star <= value ? 'fill-gold text-gold' : 'text-gold/30'} size={24} />
      </button>
    ))}
  </div>
);

const StarDisplay = ({ value, size = 14 }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map((star) => (
      <FiStar key={star} size={size} className={star <= Math.round(value) ? 'fill-gold text-gold' : 'text-gold/30'} />
    ))}
  </div>
);

const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs font-body">
      <span className="w-3 text-right text-forest/60">{star}</span>
      <FiStar size={10} className="fill-gold text-gold flex-shrink-0" />
      <div className="flex-1 h-2 bg-cream-dark rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: star * 0.05 }} className="h-full bg-gold rounded-full" />
      </div>
      <span className="w-6 text-forest/50">{count}</span>
    </div>
  );
};

const ReviewSection = ({ productId }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewAPI.getByProduct(productId);
      const data = res.data || [];
      setReviews(data);
      if (user) setHasReviewed(data.some((r) => r.user?._id === user._id));
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { if (productId) fetchReviews(); }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a rating'); return; }
    if (!comment.trim()) { toast.error('Please write a comment'); return; }
    setSubmitting(true);
    try {
      await reviewAPI.create(productId, { rating, comment });
      toast.success('Review submitted! Thank you 🙏');
      setRating(0); setComment(''); setShowForm(false);
      fetchReviews();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewAPI.delete(reviewId);
      toast.success('Review deleted');
      fetchReviews();
    } catch (err) { toast.error(err.message || 'Failed to delete review'); }
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
  const breakdown = [5,4,3,2,1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));

  return (
    <section className="mt-16">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-forest mb-8">
          Customer Reviews
          {reviews.length > 0 && <span className="text-base font-body font-normal text-olive ml-3">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>}
        </h2>

        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl p-6 premium-shadow gold-border mb-8 grid md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center">
              <p className="font-heading text-6xl font-bold text-forest">{avgRating.toFixed(1)}</p>
              <StarDisplay value={avgRating} size={20} />
              <p className="text-xs text-olive font-body mt-2">{reviews.length} verified review{reviews.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="space-y-2 justify-center flex flex-col">
              {breakdown.map(({ star, count }) => <RatingBar key={star} star={star} count={count} total={reviews.length} />)}
            </div>
          </div>
        )}

        {isAuthenticated && !hasReviewed && (
          <div className="mb-8">
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-6 py-3 bg-forest text-cream rounded-xl font-body text-sm font-semibold hover:bg-forest-light transition-colors">
              <FiEdit3 size={16} />
              {showForm ? 'Cancel' : 'Write a Review'}
              {showForm ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </button>
            <AnimatePresence>
              {showForm && (
                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleSubmit} className="mt-4 bg-white rounded-2xl p-6 premium-shadow gold-border">
                  <p className="text-sm font-body font-semibold text-forest mb-3">Your Rating *</p>
                  <StarSelector value={rating} onChange={setRating} />
                  <p className="text-sm font-body font-semibold text-forest mt-5 mb-2">Your Review *</p>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Share your honest experience..." className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream text-sm font-body focus:border-gold outline-none resize-none" />
                  <button type="submit" disabled={submitting} className="mt-4 px-8 py-3 bg-gold text-forest rounded-xl font-body text-sm font-bold hover:bg-gold-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        )}

        {isAuthenticated && hasReviewed && (
          <div className="mb-8 p-4 bg-gold/10 rounded-xl border border-gold/20">
            <p className="text-sm font-body text-forest/70">✓ You have already reviewed this product.</p>
          </div>
        )}

        {!isAuthenticated && (
          <div className="mb-8 p-4 bg-cream rounded-xl border border-gold/20">
            <p className="text-sm font-body text-forest/70"><a href="/login" className="text-forest font-semibold underline">Sign in</a> to write a review.</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1,2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-full bg-cream-dark" /><div className="space-y-1.5"><div className="h-3 w-24 bg-cream-dark rounded" /><div className="h-2 w-16 bg-cream-dark rounded" /></div></div>
                <div className="h-3 w-full bg-cream-dark rounded mb-2" /><div className="h-3 w-3/4 bg-cream-dark rounded" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-heading text-2xl text-forest/30 mb-2">No reviews yet</p>
            <p className="text-sm text-olive font-body">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => <ReviewCard key={review._id} review={review} currentUser={user} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewSection;
