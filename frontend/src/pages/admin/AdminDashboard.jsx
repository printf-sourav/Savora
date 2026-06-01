import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiDollarSign, FiShoppingBag, FiUsers, FiTag, FiPackage, FiTrendingUp, FiAlertCircle, FiBarChart2 } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { formatPrice } from '../../utils/constants';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setStats(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-olive">
        <FiAlertCircle size={48} className="mb-4 text-red-400" />
        <p className="font-body text-lg mb-2">Failed to load dashboard</p>
        <p className="font-body text-sm text-olive/60 mb-4">{error}</p>
        <button onClick={fetchDashboardStats} className="px-6 py-2 bg-forest text-cream rounded-xl font-body text-sm hover:bg-forest-light transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: FiDollarSign, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: FiShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: FiUsers, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    { title: 'Active Coupons', value: stats?.totalCoupons || 0, icon: FiTag, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  ];

  const statusColors = {
    PROCESSING: 'bg-yellow-100 text-yellow-700',
    SHIPPED: 'bg-blue-100 text-blue-700',
    OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <>
      <Helmet><title>{'Admin Dashboard | SAVORA'}</title></Helmet>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className={`${stat.bg} border ${stat.border} p-6 rounded-2xl flex items-center gap-4 transition-transform hover:scale-[1.02]`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-xs text-olive font-body uppercase tracking-wider mb-1">{stat.title}</p>
              <p className="font-heading text-2xl font-bold text-forest">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Revenue Analytics Chart (recharts) */}
        <div className="col-span-1 lg:col-span-3 bg-white rounded-2xl p-6 premium-shadow gold-border mb-2">
          <h3 className="font-heading text-lg font-semibold text-forest mb-6 flex items-center gap-2">
            <FiBarChart2 className="text-gold" /> Revenue Analytics (Last 6 Months)
          </h3>
          {stats?.monthlyRevenue?.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyRevenue.map(m => {
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  return {
                    name: `${monthNames[m._id.month - 1]} ${m._id.year}`,
                    Revenue: m.revenue,
                    Orders: m.count
                  };
                })}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B4332" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1B4332" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6B7280', fontSize: 12}} 
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => formatPrice(value)}
                  />
                  <Area type="monotone" dataKey="Revenue" stroke="#1B4332" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-olive/60 font-body text-sm">Not enough data to display chart</p>
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 premium-shadow gold-border">
          <h3 className="font-heading text-lg font-semibold text-forest mb-6 flex items-center gap-2">
            <FiTrendingUp className="text-gold" /> Order Status
          </h3>
          {stats?.ordersByStatus?.length > 0 ? (
            <div className="space-y-4">
              {stats.ordersByStatus.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-body font-semibold uppercase tracking-wider ${statusColors[item._id] || 'bg-gray-100 text-gray-700'}`}>
                    {item._id?.replace(/_/g, ' ')}
                  </span>
                  <span className="font-heading text-lg font-bold text-forest">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-olive/60 font-body text-sm">No orders yet</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 premium-shadow gold-border">
          <h3 className="font-heading text-lg font-semibold text-forest mb-6 flex items-center gap-2">
            <FiPackage className="text-gold" /> Recent Orders
          </h3>
          {stats?.recentOrders?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/10">
                    <th className="text-left py-3 px-2 text-xs text-olive font-body uppercase tracking-wider">Order ID</th>
                    <th className="text-left py-3 px-2 text-xs text-olive font-body uppercase tracking-wider">Customer</th>
                    <th className="text-left py-3 px-2 text-xs text-olive font-body uppercase tracking-wider">Amount</th>
                    <th className="text-left py-3 px-2 text-xs text-olive font-body uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-2 text-xs text-olive font-body uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-gold/5 hover:bg-cream/30 transition-colors">
                      <td className="py-3 px-2 font-body text-sm font-medium text-forest">
                        #{order._id?.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 px-2 font-body text-sm text-olive">
                        {order.userId?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-2 font-body text-sm font-semibold text-forest">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-body text-xs text-olive">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-olive/60 font-body text-sm text-center py-8">No orders yet</p>
          )}
        </div>
      </div>

      {/* Monthly Revenue */}
      {stats?.monthlyRevenue?.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl p-6 premium-shadow gold-border">
          <h3 className="font-heading text-lg font-semibold text-forest mb-6">Monthly Revenue (Last 6 Months)</h3>
          <div className="flex items-end gap-4 h-48">
            {stats.monthlyRevenue.map((item, i) => {
              const maxRevenue = Math.max(...stats.monthlyRevenue.map(r => r.revenue));
              const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-body text-olive">{formatPrice(item.revenue)}</span>
                  <div className="w-full bg-gold/20 rounded-t-lg relative" style={{ height: `${Math.max(height, 5)}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-gold to-gold/60 rounded-t-lg" />
                  </div>
                  <span className="text-xs font-body text-olive font-medium">{months[item._id.month]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
