import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { formatPrice } from '../../utils/constants';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  // TASK 5: Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  useEffect(() => { fetchOrders(currentPage); }, [currentPage]);

  const fetchOrders = async (page = currentPage) => {
    try {
      setLoading(true);
      const res = await adminAPI.getOrders({ page, limit: LIMIT });
      const payload = res.data || {};
      setOrders(payload.data || []);
      setTotal(payload.total || 0);
      setTotalPages(payload.pages || 1);
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  const handleStatusChange = async (id, statusType, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(id, { [statusType]: newStatus });
      toast.success('Order status updated');
      fetchOrders();
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, [statusType]: newStatus });
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = orders.filter((o) =>
    o._id?.toLowerCase().includes(search.toLowerCase()) ||
    o.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    PROCESSING: 'bg-yellow-100 text-yellow-700',
    SHIPPED: 'bg-blue-100 text-blue-700',
    OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>{'Orders Management | SAVORA Admin'}</title></Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-forest">Orders</h2>
          <p className="font-body text-sm text-olive">{orders.length} total orders</p>
        </div>
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-olive/50" size={16} />
          <input
            type="text" placeholder="Search orders..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gold/20 bg-white text-sm font-body text-forest focus:border-gold outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Table List */}
        <div className={`bg-white rounded-2xl premium-shadow gold-border overflow-hidden ${selectedOrder ? 'lg:w-2/3' : 'w-full'}`}>
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <FiAlertCircle size={48} className="mx-auto text-olive/30 mb-4" />
              <p className="font-body text-olive">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cream/50 border-b border-gold/10">
                  <tr>
                    <th className="text-left py-4 px-4 text-xs text-olive font-body uppercase tracking-wider">Order ID</th>
                    <th className="text-left py-4 px-4 text-xs text-olive font-body uppercase tracking-wider">Customer</th>
                    <th className="text-left py-4 px-4 text-xs text-olive font-body uppercase tracking-wider">Amount</th>
                    <th className="text-left py-4 px-4 text-xs text-olive font-body uppercase tracking-wider">Status</th>
                    <th className="text-right py-4 px-4 text-xs text-olive font-body uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className={`border-b border-gold/5 transition-colors cursor-pointer ${selectedOrder?._id === order._id ? 'bg-cream/50' : 'hover:bg-cream/20'}`}
                    >
                      <td className="py-4 px-4 font-body text-sm font-semibold text-forest">#{order._id?.slice(-6).toUpperCase()}</td>
                      <td className="py-4 px-4">
                        <p className="font-body text-sm text-forest">{order.userId?.name || 'N/A'}</p>
                        <p className="font-body text-xs text-olive/60">{order.userId?.email}</p>
                      </td>
                      <td className="py-4 px-4 font-body text-sm font-semibold text-forest">{formatPrice(order.totalAmount)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider ${statusColors[order.orderStatus]}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-body text-sm text-olive">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* TASK 5: Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gold/10">
            <p className="font-body text-sm text-olive">Showing {((currentPage-1)*LIMIT)+1}–{Math.min(currentPage*LIMIT,total)} of {total}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1,p-1))} disabled={currentPage===1} className="px-4 py-2 rounded-xl border border-gold/20 font-body text-sm text-forest disabled:opacity-40 hover:bg-cream transition-colors">← Prev</button>
              <span className="font-body text-sm text-forest px-3">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="px-4 py-2 rounded-xl border border-gold/20 font-body text-sm text-forest disabled:opacity-40 hover:bg-cream transition-colors">Next →</button>
            </div>
          </div>
        )}

        {/* Detail Panel */}
        {selectedOrder && (
          <div className="lg:w-1/3 bg-white rounded-2xl premium-shadow gold-border p-6 h-fit sticky top-6">
            <div className="flex items-center justify-between border-b border-gold/10 pb-4 mb-4">
              <h3 className="font-heading text-lg font-bold text-forest">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-olive hover:text-forest text-sm font-body">Close</button>
            </div>

            <div className="space-y-6">
              {/* Info */}
              <div>
                <p className="text-xs text-olive font-body uppercase tracking-wider mb-1">Order ID</p>
                <p className="font-body text-sm font-semibold text-forest">#{selectedOrder._id}</p>
              </div>

              <div>
                <p className="text-xs text-olive font-body uppercase tracking-wider mb-1">Customer</p>
                <p className="font-body text-sm text-forest">{selectedOrder.userId?.name}</p>
                <p className="font-body text-sm text-olive">{selectedOrder.userId?.email}</p>
                <p className="font-body text-sm text-olive">{selectedOrder.userId?.phone}</p>
              </div>

              {/* Status Updates */}
              <div>
                <p className="text-xs text-olive font-body uppercase tracking-wider mb-2">Order Status</p>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusChange(selectedOrder._id, 'orderStatus', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest outline-none focus:border-gold"
                >
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <p className="text-xs text-olive font-body uppercase tracking-wider mb-2">Payment Status</p>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handleStatusChange(selectedOrder._id, 'paymentStatus', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gold/20 bg-cream text-sm font-body text-forest outline-none focus:border-gold"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs text-olive font-body uppercase tracking-wider mb-2 border-t border-gold/10 pt-4">Items</p>
                <div className="space-y-3">
                  {selectedOrder.orderedItems?.map((item) => (
                    <div key={item._id} className="flex justify-between items-center bg-cream/30 p-2 rounded-lg">
                      <div className="flex gap-2 items-center">
                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                        <div>
                          <p className="font-body text-sm text-forest line-clamp-1">{item.name}</p>
                          <p className="font-body text-xs text-olive">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-body text-sm font-semibold text-forest">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t border-gold/10 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="font-body text-sm text-olive">Subtotal</span>
                  <span className="font-body text-sm text-forest">
                    {formatPrice((selectedOrder.orderedItems || []).reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0))}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-body text-sm text-olive">Shipping</span>
                  <span className="font-body text-sm text-forest">{formatPrice(selectedOrder.shippingCharge || 0)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="font-body text-forest">Total</span>
                  <span className="font-heading text-lg text-forest">{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminOrders;
