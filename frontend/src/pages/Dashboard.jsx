import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiPackage, FiMapPin, FiLogOut, FiPlus, FiCreditCard, FiUser } from 'react-icons/fi';
import { performLogout, updateProfile } from '../redux/slices/authSlice';
import { fetchMyOrders, cancelOrder } from '../redux/slices/orderSlice';
import Breadcrumb from '../components/common/Breadcrumb';
import OrderStatusBadge from '../components/common/OrderStatusBadge';
import AddressCard from '../components/common/AddressCard';
import { formatPrice } from '../utils/constants';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';


const AddAddressForm = ({ onSave, onCancel }) => {
  const [form, setForm] = useState({ street: '', city: '', state: '', country: 'India', pincode: '', isDefault: false });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.street || !form.city || !form.state || !form.pincode) { toast.error('Fill all required fields'); return; }
    setSaving(true);
    try { await authAPI.addAddress(form); toast.success('Address added!'); onSave(); }
    catch (err) { toast.error(err.message || 'Failed'); }
    finally { setSaving(false); }
  };
  return (
    <form onSubmit={handleSubmit} className="bg-cream/50 border border-gold/20 rounded-2xl p-5 mt-4 space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="text-xs font-body font-semibold text-forest mb-1 block">Street *</label>
          <input value={form.street} onChange={e => setForm({...form, street: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-white text-sm font-body focus:border-gold outline-none" placeholder="House/Flat No., Street" />
        </div>
        <div>
          <label className="text-xs font-body font-semibold text-forest mb-1 block">City *</label>
          <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-white text-sm font-body focus:border-gold outline-none" />
        </div>
        <div>
          <label className="text-xs font-body font-semibold text-forest mb-1 block">State *</label>
          <input value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-white text-sm font-body focus:border-gold outline-none" />
        </div>
        <div>
          <label className="text-xs font-body font-semibold text-forest mb-1 block">PIN Code *</label>
          <input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-white text-sm font-body focus:border-gold outline-none" maxLength={6} />
        </div>
        <div>
          <label className="text-xs font-body font-semibold text-forest mb-1 block">Country</label>
          <input value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-white text-sm font-body focus:border-gold outline-none" />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} className="accent-forest" />
        <span className="text-sm font-body text-forest">Set as default</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gold/20 text-forest font-body text-sm">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-forest text-cream rounded-xl font-body text-sm font-semibold disabled:opacity-60">{saving ? 'Saving...' : 'Save Address'}</button>
      </div>
    </form>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  // TASK 3: read orders from Redux state
  const { orders, loading: ordersLoading } = useSelector(s => s.orders);

  const [activeTab, setActiveTab] = useState('orders');
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Cancellation state
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmOrderId, setConfirmOrderId] = useState(null);

  const handleConfirmCancel = async () => {
    if (!confirmOrderId) return;
    setCancellingId(confirmOrderId);
    try {
      await dispatch(cancelOrder(confirmOrderId)).unwrap();
      toast.success("Order cancelled successfully");
    } catch (error) {
      toast.error(error || "Failed to cancel order");
    } finally {
      setCancellingId(null);
      setConfirmOrderId(null);
    }
  };

  // TASK 3: dispatch thunk instead of direct API call
  const fetchOrderData = useCallback(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const fetchAddresses = useCallback(async () => {
    setAddressesLoading(true);
    try {
      const r = await authAPI.getProfile();
      setAddresses(r.data?.addresses || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load addresses');
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData]);

  const handleTabChange = (tabId) => {
    if (tabId === 'orders') fetchOrderData();
    if (tabId === 'addresses') fetchAddresses();
    setActiveTab(tabId);
  };

  const handleLogout = async () => { await dispatch(performLogout()); toast.success('Logged out'); navigate('/'); };

  const [updatingProfile, setUpdatingProfile] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const formData = new FormData(e.currentTarget);
      const profileForm = {
        name: String(formData.get('name') || '').trim(),
        displayName: String(formData.get('displayName') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
      };
      
      const currentPassword = String(formData.get('currentPassword') || '').trim();
      const newPassword = String(formData.get('newPassword') || '').trim();
      const confirmPassword = String(formData.get('confirmPassword') || '').trim();

      if (currentPassword || newPassword || confirmPassword) {
        profileForm.currentPassword = currentPassword;
        profileForm.newPassword = newPassword;
        profileForm.confirmPassword = confirmPassword;
      }

      const res = await authAPI.updateProfile(profileForm);
      dispatch(updateProfile(res.data));
      toast.success('Profile updated successfully');
      
      // Clear password fields
      e.currentTarget.querySelectorAll('input[type="password"]').forEach(input => input.value = '');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleSetDefault = async (id) => {
    try { await authAPI.setDefaultAddress(id); fetchAddresses(); toast.success('Default updated'); }
    catch (e) { toast.error(e.message); }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try { await authAPI.deleteAddress(id); fetchAddresses(); toast.success('Deleted'); }
    catch (e) { toast.error(e.message); }
  };

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: FiPackage },
    { id: 'addresses', label: 'Saved Addresses', icon: FiMapPin },
    { id: 'payments', label: 'Payment Methods', icon: FiCreditCard },
    { id: 'profile', label: 'Account Details', icon: FiUser },
  ];

  if (!user) return null;

  return (
    <>
      <Helmet><title>My Dashboard | SAVORA</title></Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-cream min-h-screen">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-4">
          <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'My Account', path: '/dashboard' }]} />
        </div>
        <div id="recaptcha-container"></div>
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pb-16">
          {/* Header */}
          <div className="bg-forest rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 premium-shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gold flex items-center justify-center text-forest font-heading text-3xl font-bold">{user.name?.charAt(0).toUpperCase()}</div>
              <div>
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-cream mb-1">Hello, {user.name}</h1>
                <p className="text-cream/60 font-body text-sm">
                  {user.email?.includes('phone-auth.savora.local') ? 'No email provided' : user.email}
                </p>
              </div>
            </div>
            <div className="relative z-10 flex gap-4">
              {user.role?.toUpperCase() === 'ADMIN' && (
                <Link to="/admin" className="px-6 py-3 bg-white/10 text-cream rounded-xl font-body text-sm font-semibold hover:bg-white/20 transition-colors border border-white/10">Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="px-6 py-3 bg-red-500/10 text-red-200 rounded-xl font-body text-sm font-semibold hover:bg-red-500/20 transition-colors flex items-center gap-2 border border-red-500/20">
                <FiLogOut /> Logout
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-2">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-body text-sm transition-all ${activeTab === tab.id ? 'bg-white text-forest font-semibold premium-shadow gold-border' : 'text-olive hover:bg-white/50 hover:text-forest'}`}>
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-gold' : ''} />
                  {tab.label}
                </button>
              ))}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-xl font-body text-sm transition-all text-olive hover:bg-white/50 hover:text-forest"
              >
                <FiLogOut size={18} />
                Log out
              </button>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl p-6 md:p-8 premium-shadow gold-border min-h-[400px]">
                <AnimatePresence mode="wait">

                  {activeTab === 'orders' && (
                    <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <h2 className="font-heading text-xl font-bold text-forest mb-6">Order History</h2>
                      {ordersLoading ? (
                        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-cream rounded-2xl animate-pulse" />)}</div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-16">
                          <FiPackage size={48} className="mx-auto text-olive/30 mb-4" />
                          <p className="font-body text-forest mb-4">No orders yet.</p>
                          <Link to="/shop" className="inline-block bg-gold text-forest px-6 py-3 rounded-full font-body text-sm font-semibold">Start Shopping</Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.map(order => (
                            <div key={order._id} className="border border-gold/20 rounded-2xl p-5 hover:border-gold/50 transition-colors">
                              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gold/10">
                                <div>
                                  <p className="font-body text-xs text-olive uppercase tracking-wider mb-0.5">Order #{order._id?.slice(-8).toUpperCase()}</p>
                                  <p className="font-body text-sm font-semibold text-forest">{new Date(order.createdAt).toLocaleDateString('en-IN', {year:'numeric', month:'long', day:'numeric'})}</p>
                                  <p className="font-body text-xs text-olive mt-0.5">{order.orderedItems?.length || 0} item(s)</p>
                                </div>
                                <OrderStatusBadge status={order.orderStatus} />
                              </div>
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex -space-x-3">
                                  {order.orderedItems?.slice(0, 3).map((item, i) => (
                                    <img key={i} src={item.image || 'https://placehold.co/44x44'} alt={item.name} className="w-11 h-11 rounded-full border-2 border-white object-cover" />
                                  ))}
                                  {(order.orderedItems?.length || 0) > 3 && (
                                    <div className="w-11 h-11 rounded-full border-2 border-white bg-cream-dark flex items-center justify-center text-xs font-body font-semibold text-forest">+{order.orderedItems.length - 3}</div>
                                  )}
                                </div>
                                <div className="flex items-center gap-4">
                                  <p className="font-heading text-lg font-bold text-forest">{formatPrice(order.totalAmount)}</p>
                                  {order.orderStatus === "PROCESSING" && (
                                    <button
                                      onClick={() => setConfirmOrderId(order._id)}
                                      disabled={cancellingId === order._id}
                                      className="border border-red-200 text-red-500 rounded-xl font-body text-xs font-semibold px-4 py-2 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:pointer-events-none disabled:bg-red-50"
                                    >
                                      {cancellingId === order._id ? "Cancelling..." : "Cancel Order"}
                                    </button>
                                  )}
                                  {order.orderStatus === "CANCELLED" ? (
                                    <span className="text-xs text-red-400 font-body px-4 py-2 border border-transparent">Order Cancelled</span>
                                  ) : (
                                    <Link to={`/track-order?id=${order._id}`} className="px-4 py-2 border border-forest text-forest rounded-xl font-body text-xs font-semibold hover:bg-forest hover:text-cream transition-colors">Track Order</Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'addresses' && (
                    <motion.div key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading text-xl font-bold text-forest">Saved Addresses</h2>
                        <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-gold text-forest px-4 py-2 rounded-xl font-body text-xs font-semibold hover:bg-gold-light transition-colors">
                          <FiPlus size={14} /> Add Address
                        </button>
                      </div>
                      {showAddForm && <AddAddressForm onSave={() => { setShowAddForm(false); fetchAddresses(); }} onCancel={() => setShowAddForm(false)} />}
                      {addressesLoading ? (
                        <div className="space-y-3 mt-4">{[1,2].map(i => <div key={i} className="h-28 bg-cream rounded-2xl animate-pulse" />)}</div>
                      ) : addresses.length === 0 && !showAddForm ? (
                        <div className="text-center py-12 mt-4">
                          <FiMapPin size={40} className="mx-auto text-olive/30 mb-3" />
                          <p className="font-body text-olive">No addresses saved yet.</p>
                        </div>
                      ) : (
                        <div className="grid gap-4 mt-4">
                          {addresses.map(addr => (
                            <AddressCard
                              key={addr._id}
                              address={addr}
                              onSetDefault={handleSetDefault}
                              onDelete={handleDeleteAddress}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'payments' && (
                    <motion.div key="payments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <h2 className="font-heading text-xl font-bold text-forest mb-6">Payment Methods</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { title: 'UPI', description: 'Google Pay, PhonePe, Paytm, and any UPI app supported at checkout.' },
                          { title: 'Cards', description: 'Debit and credit cards are processed securely through the payment gateway.' },
                          { title: 'Net Banking', description: 'Pay directly from your bank account during checkout.' },
                          { title: 'Cash on Delivery', description: 'Available for eligible orders and locations.' },
                        ].map((method) => (
                          <div key={method.title} className="rounded-2xl border border-gold/20 bg-cream/40 p-5">
                            <h3 className="font-heading text-lg font-bold text-forest mb-2">{method.title}</h3>
                            <p className="font-body text-sm text-olive leading-6">{method.description}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 rounded-2xl border border-forest/10 bg-forest/5 p-5">
                        <p className="font-body text-sm text-forest">Payment details are entered securely during checkout. This dashboard only shows the available payment options.</p>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Profile & Security tab ── */}
                  {activeTab === 'profile' && (
                    <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <h2 className="font-heading text-xl font-bold text-forest mb-6">Account Details</h2>

                      {/* Update Profile Form */}
                      <form onSubmit={handleUpdateProfile} className="bg-cream/50 border border-gold/20 rounded-2xl p-6 mb-8 mt-4 space-y-6">
                        <div>
                          <h3 className="font-heading font-semibold text-lg text-forest mb-4 pb-2 border-b border-gold/10">Personal Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-xs font-body font-semibold text-forest mb-1 block">Name</label>
                              <input 
                                name="name"
                                defaultValue={user.name || ''}
                                className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-white text-sm font-body focus:border-gold outline-none" 
                                placeholder="Your full name" 
                              />
                            </div>
                            <div>
                              <label className="text-xs font-body font-semibold text-forest mb-1 block">Display Name</label>
                              <input 
                                name="displayName"
                                defaultValue={user.displayName || user.name || ''}
                                className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-white text-sm font-body focus:border-gold outline-none" 
                                placeholder="Name shown on the site" 
                              />
                            </div>
                            <div>
                              <label className="text-xs font-body font-semibold text-forest mb-1 block">Mobile Number</label>
                              <input 
                                name="phone"
                                defaultValue={user.phone || ''}
                                className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-white text-sm font-body focus:border-gold outline-none" 
                                placeholder="e.g. +919876543210" 
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-heading font-semibold text-lg text-forest mb-4 pb-2 border-b border-gold/10">Change Password</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-xs font-body font-semibold text-forest mb-1 block">Current Password</label>
                              <input 
                                type="password"
                                name="currentPassword"
                                className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-white text-sm font-body focus:border-gold outline-none" 
                                placeholder="Enter current password" 
                              />
                            </div>
                            <div>
                              <label className="text-xs font-body font-semibold text-forest mb-1 block">New Password</label>
                              <input 
                                type="password"
                                name="newPassword"
                                className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-white text-sm font-body focus:border-gold outline-none" 
                                placeholder="New password" 
                              />
                            </div>
                            <div>
                              <label className="text-xs font-body font-semibold text-forest mb-1 block">Confirm New Password</label>
                              <input 
                                type="password"
                                name="confirmPassword"
                                className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-white text-sm font-body focus:border-gold outline-none" 
                                placeholder="Confirm new password" 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <p className="text-xs text-olive font-body mb-3">Leave password fields blank if you only want to update your personal details.</p>
                          <button 
                            type="submit" 
                            disabled={updatingProfile}
                            className="px-6 py-2.5 bg-forest text-cream rounded-xl font-body text-sm font-semibold hover:bg-forest/90 transition-colors disabled:opacity-50"
                          >
                            {updatingProfile ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cancellation Confirmation Modal */}
      <AnimatePresence>
        {confirmOrderId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm text-center"
            >
              <h3 className="font-heading font-bold text-forest text-xl mb-2">Cancel this order?</h3>
              <p className="text-sm text-olive mb-1">
                This action cannot be undone. Your items will be restocked.
              </p>
              
              {(() => {
                const orderToCancel = orders.find(o => o._id === confirmOrderId);
                if (orderToCancel?.paymentMethod === "ONLINE" && orderToCancel?.paymentStatus === "COMPLETED") {
                  return <p className="text-xs text-amber-700 mt-1">Your payment will be marked for refund.</p>;
                }
                return null;
              })()}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setConfirmOrderId(null)}
                  disabled={cancellingId === confirmOrderId}
                  className="flex-1 py-2.5 rounded-xl border border-gold/20 text-forest font-body text-sm hover:bg-gold/5 transition-colors disabled:opacity-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={cancellingId === confirmOrderId}
                  className="flex-1 flex items-center justify-center py-2.5 bg-red-500 text-white rounded-xl font-body text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-70"
                >
                  {cancellingId === confirmOrderId ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Yes, Cancel"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;
