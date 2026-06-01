import { FiStar } from 'react-icons/fi';

/**
 * ReviewCard — renders a single product review.
 * Props: { review: object, currentUser?: object, onDelete?: (reviewId) => void }
 * Imported and used in ReviewSection.jsx (replaces the inline ReviewCard there).
 */
const ReviewCard = ({ review, currentUser, onDelete }) => {
  const isOwner = currentUser?._id === review.user?._id;
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="bg-white rounded-2xl p-5 premium-shadow gold-border">
      <div className="flex items-start justify-between gap-3">
        {/* Avatar + name + date */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-forest flex items-center justify-center flex-shrink-0">
            {review.user?.avatar ? (
              <img
                src={review.user.avatar}
                alt={review.user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-cream text-sm font-heading font-bold">
                {review.user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-body font-semibold text-forest">
              {review.user?.name || 'Anonymous'}
            </p>
            <p className="text-[10px] text-olive font-body">
              {new Date(review.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Stars + delete */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                size={13}
                className={star <= Math.round(review.rating) ? 'fill-gold text-gold' : 'text-gold/30'}
              />
            ))}
          </div>
          {(isOwner || isAdmin) && onDelete && (
            <button
              onClick={() => onDelete(review._id)}
              className="ml-1 p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Delete review"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Comment */}
      <p className="text-sm text-forest/80 font-body mt-3 leading-relaxed">{review.comment}</p>
    </div>
  );
};

export default ReviewCard;
