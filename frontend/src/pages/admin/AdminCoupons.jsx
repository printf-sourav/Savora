import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiAlertCircle } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { formatPrice } from '../../utils/constants';
import toast from 'react-hot-toast';

const EMPTY_FORM = { code: '', discountPercentage: '', expiryDate: '', usageLimit: '', minimumOrderValue: '' };

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null); // TASK 6: editing
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try { setLoading(true); const r = await adminAPI.getCoupons(); setCoupons(r.data || []); }
    catch (e) { toast.error(e.message); } finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'code' ? value.toUpperCase() : value });
  };

  const openCreateModal = () => { setSelectedCoupon(null); setFormData(EMPTY_FORM); setShowModal(true); };

  const openEditModal = (coupon) => { // TASK 6
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit || '',
      minimumOrderValue: coupon.minimumOrderValue || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      code: formData.code,
      discountPercentage: Number(formData.discountPercentage),
      expiryDate: new Date(formData.expiryDate),
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      minimumOrderValue: formData.minimumOrderValue ? Number(formData.minimumOrderValue) : null,
      activeStatus: true,
    };
    try {
      if (selectedCoupon) {
        await adminAPI.updateCoupon(selectedCoupon._id, payload);
        toast.success('Coupon updated!');
      } else {
        await adminAPI.createCoupon(payload);
        toast.success('Coupon created!');
      }
      setShowModal(false); fetchCoupons();
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try { await adminAPI.deleteCoupon(id); toast.success('Deleted!'); fetchCoupons(); }
    catch (e) { toast.error(e.message); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" /></div>;

  return (
    <>
      <Helmet><title>Coupons | SAVORA Admin</title></Helmet>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-forest">Coupons</h2>
          <p className="font-body text-sm text-olive">Manage discount codes and promotions</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-2.5 bg-forest text-cream rounded-xl font-body text-sm font-semibold hover:bg-forest-light transition-colors">
          <FiPlus size={16} /> Create Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white rounded-2xl premium-shadow gold-border p-16 text-center">
          <FiAlertCircle size={48} className="mx-auto text-olive/30 mb-4" />
          <p className="font-body text-olive">No coupons created yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map(coupon => (
            <div key={coupon._id} className="bg-white rounded-2xl p-6 premium-shadow gold-border relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-gold/5 rounded-full blur-xl group-hover:bg-gold/10 transition-colors" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <div className="inline-block px-3 py-1 bg-gold/10 border border-gold/20 rounded-lg font-heading text-lg font-bold text-forest tracking-wider mb-2">{coupon.code}</div>
                  <p className="font-body text-sm text-olive flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />{coupon.discountPercentage}% OFF
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditModal(coupon)} className="p-2 text-olive hover:text-gold hover:bg-gold/10 rounded-lg transition-colors">
                    <FiEdit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(coupon._id)} className="p-2 text-olive hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 mt-6 border-t border-gold/10 pt-4 relative z-10">
                <div className="flex justify-between text-xs font-body">
                  <span className="text-olive">Min Order:</span>
                  <span className="font-medium text-forest">{coupon.minimumOrderValue ? formatPrice(coupon.minimumOrderValue) : 'None'}</span>
                </div>
                <div className="flex justify-between text-xs font-body">
                  <span className="text-olive">Usage Limit:</span>
                  <span className="font-medium text-forest">{coupon.usageLimit || 'Unlimited'}</span>
                </div>
                <div className="flex justify-between text-xs font-body">
                  <span className="text-olive">Expires:</span>
                  <span className={`font-medium ${new Date(coupon.expiryDate) < new Date() ? 'text-red-500' : 'text-forest'}`}>
                    {new Date(coupon.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md premium-shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gold/10">
              <h3 className="font-heading text-xl font-bold text-forest">{selectedCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-olive hover:text-forest rounded-lg hover:bg-cream transition-colors"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-body font-medium text-forest mb-1.5">Coupon Code *</label>
                <input name="code" value={formData.code} onChange={handleChange} required placeholder="e.g. SUMMER20" className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest focus:border-gold outline-none uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-body font-medium text-forest mb-1.5">Discount (%) *</label>
                  <input name="discountPercentage" type="number" value={formData.discountPercentage} onChange={handleChange} required min="1" max="100" className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-body font-medium text-forest mb-1.5">Expiry Date *</label>
                  <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest focus:border-gold outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-body font-medium text-forest mb-1.5">Min Order (₹)</label>
                  <input name="minimumOrderValue" type="number" value={formData.minimumOrderValue} onChange={handleChange} min="0" placeholder="Optional" className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-body font-medium text-forest mb-1.5">Usage Limit</label>
                  <input name="usageLimit" type="number" value={formData.usageLimit} onChange={handleChange} min="1" placeholder="Optional" className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest focus:border-gold outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gold/10 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl border border-gold/20 font-body text-sm text-olive hover:bg-cream transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-forest text-cream rounded-xl font-body text-sm font-semibold hover:bg-forest-light transition-colors">
                  {selectedCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCoupons;
