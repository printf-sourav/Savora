/**
 * AddressCard — displays a saved address card with optional actions.
 *
 * Props:
 *  address    – address object { street, city, state, pincode, country, isDefault, _id }
 *  onEdit     – (address) => void
 *  onDelete   – (addressId) => void
 *  onSetDefault – (addressId) => void
 *  showActions – boolean (default true)
 */
const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  showActions = true,
}) => {
  return (
    <div
      className={`bg-white rounded-2xl p-5 premium-shadow border-2 transition-all ${
        address.isDefault ? 'border-gold' : 'border-transparent gold-border'
      }`}
    >
      {/* Default badge */}
      {address.isDefault && (
        <span className="inline-block mb-3 text-[10px] uppercase tracking-widest font-body font-semibold text-gold bg-gold/10 px-3 py-1 rounded-full">
          ✓ Default
        </span>
      )}

      {/* Address lines */}
      <div className="space-y-0.5">
        {address.name && (
          <p className="font-body font-semibold text-forest text-sm">{address.name}</p>
        )}
        {address.phone && (
          <p className="font-body text-olive text-sm">{address.phone}</p>
        )}
        <p className="font-body text-forest text-sm leading-relaxed">
          {[address.street, address.city, address.state, address.pincode, address.country]
            .filter(Boolean)
            .join(', ')}
        </p>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-gold/10">
          {onEdit && (
            <button
              onClick={() => onEdit(address)}
              className="text-xs font-body font-medium text-forest hover:text-gold transition-colors underline underline-offset-2"
            >
              Edit
            </button>
          )}
          {onSetDefault && !address.isDefault && (
            <button
              onClick={() => onSetDefault(address._id)}
              className="text-xs font-body font-medium text-olive hover:text-forest transition-colors underline underline-offset-2"
            >
              Set as default
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(address._id)}
              className="text-xs font-body font-medium text-red-400 hover:text-red-600 transition-colors ml-auto"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressCard;
