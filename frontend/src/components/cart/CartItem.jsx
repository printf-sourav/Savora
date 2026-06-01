import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { updateQuantity, removeFromCart } from '../../redux/slices/cartSlice';
import { formatPrice } from '../../utils/constants';
import toast from 'react-hot-toast';

/**
 * CartItem — one row in the cart list.
 * Props: { item: object, index: number }
 */
const CartItem = ({ item, index }) => {
  const dispatch = useDispatch();

  const unitPrice = item.selectedVariant?.price || item.price || 0;
  const lineTotal = unitPrice * item.quantity;

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 premium-shadow gold-border flex gap-4 md:gap-6">
      {/* Image */}
      <Link
        to={`/product/${item.slug}`}
        className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-cream-dark"
      >
        <img
          src={item.selectedVariant?.image || item.images?.[0]?.url || item.image || 'https://placehold.co/128x128'}
          alt={item.name || item.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] text-gold uppercase tracking-widest font-body">{item.category?.name || item.category}</p>
            <Link to={`/product/${item.slug}`}>
              <h3 className="font-heading text-base md:text-lg font-semibold text-forest hover:text-gold transition-colors line-clamp-1">
                {item.name || item.title}
              </h3>
            </Link>
            {item.selectedVariant && (
              <p className="text-xs text-olive font-body mt-1">Size: {item.selectedVariant.name}</p>
            )}
          </div>

          {/* Remove button */}
          <button
            onClick={() => {
              dispatch(removeFromCart(index));
              toast.success('Item removed');
            }}
            className="p-2 text-olive/40 hover:text-red-500 transition-colors flex-shrink-0"
            aria-label="Remove item"
          >
            <FiTrash2 size={16} />
          </button>
        </div>

        <div className="flex items-end justify-between mt-3 md:mt-4">
          {/* Quantity stepper */}
          <div className="flex items-center border border-gold/20 rounded-lg overflow-hidden">
            <button
              onClick={() =>
                dispatch(updateQuantity({ index, quantity: Math.max(1, item.quantity - 1) }))
              }
              className="px-3 py-1.5 text-forest hover:bg-forest hover:text-cream transition-all"
              aria-label="Decrease quantity"
            >
              <FiMinus size={12} />
            </button>
            <span className="px-4 py-1.5 font-body text-sm font-medium text-forest border-x border-gold/20">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                dispatch(updateQuantity({ index, quantity: item.quantity + 1 }))
              }
              className="px-3 py-1.5 text-forest hover:bg-forest hover:text-cream transition-all"
              aria-label="Increase quantity"
            >
              <FiPlus size={12} />
            </button>
          </div>

          {/* Line total */}
          <p className="font-heading text-lg font-bold text-forest">{formatPrice(lineTotal)}</p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
