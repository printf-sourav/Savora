/**
 * OrderStatusBadge — displays a pill badge for order status.
 * Props: { status: string }
 */
const STATUS_MAP = {
  PROCESSING:       { label: 'Processing',        bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
  SHIPPED:          { label: 'Shipped',            bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',   bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  DELIVERED:        { label: 'Delivered',          bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
  CANCELLED:        { label: 'Cancelled',          bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500'    },
};

const OrderStatusBadge = ({ status }) => {
  const cfg = STATUS_MAP[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default OrderStatusBadge;
