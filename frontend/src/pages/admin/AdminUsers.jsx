import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiShield, FiShieldOff, FiUserX, FiUserCheck, FiAlertCircle } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // TASK 5: Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  useEffect(() => { fetchUsers(currentPage); }, [currentPage]);

  const fetchUsers = async (page = currentPage) => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers({ page, limit: LIMIT });
      const payload = res.data || {};
      setUsers(payload.data || []);
      setTotal(payload.total || 0);
      setTotalPages(payload.pages || 1);
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  const handleToggleBlock = async (id, isAdmin) => {
    if (isAdmin) {
      toast.error('Cannot block admin users');
      return;
    }
    
    if (!confirm('Are you sure you want to change this user\'s access?')) return;
    
    try {
      await adminAPI.toggleBlockUser(id);
      toast.success('User status updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>{'Users Management | SAVORA Admin'}</title></Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-forest">Users</h2>
          <p className="font-body text-sm text-olive">{users.length} total users</p>
        </div>
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-olive/50" size={16} />
          <input
            type="text" placeholder="Search users..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gold/20 bg-white text-sm font-body text-forest focus:border-gold outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl premium-shadow gold-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FiAlertCircle size={48} className="mx-auto text-olive/30 mb-4" />
            <p className="font-body text-olive">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream/50 border-b border-gold/10">
                <tr>
                  <th className="text-left py-4 px-4 text-xs text-olive font-body uppercase tracking-wider">User</th>
                  <th className="text-left py-4 px-4 text-xs text-olive font-body uppercase tracking-wider">Role</th>
                  <th className="text-left py-4 px-4 text-xs text-olive font-body uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-4 text-xs text-olive font-body uppercase tracking-wider">Joined Date</th>
                  <th className="text-right py-4 px-4 text-xs text-olive font-body uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user._id} className="border-b border-gold/5 hover:bg-cream/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-forest font-heading font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-body text-sm font-semibold text-forest">{user.name}</p>
                          <p className="font-body text-xs text-olive/80">{user.email}</p>
                          <p className="font-body text-xs text-olive/60">{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`flex w-fit items-center gap-1 px-2 py-1 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                        {user.role === 'ADMIN' ? <FiShield size={12} /> : <FiShieldOff size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider ${user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-body text-sm text-olive">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {user.role !== 'ADMIN' && (
                        <button 
                          onClick={() => handleToggleBlock(user._id, user.role === 'ADMIN')}
                          className={`p-2 rounded-lg transition-colors flex ml-auto ${user.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                          title={user.isBlocked ? 'Unblock User' : 'Block User'}
                        >
                          {user.isBlocked ? <FiUserCheck size={18} /> : <FiUserX size={18} />}
                        </button>
                      )}
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
          <p className="font-body text-sm text-olive">Showing {((currentPage-1)*LIMIT)+1}–{Math.min(currentPage*LIMIT,total)} of {total} users</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1,p-1))} disabled={currentPage===1} className="px-4 py-2 rounded-xl border border-gold/20 font-body text-sm text-forest disabled:opacity-40 hover:bg-cream transition-colors">← Prev</button>
            <span className="font-body text-sm text-forest px-3">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="px-4 py-2 rounded-xl border border-gold/20 font-body text-sm text-forest disabled:opacity-40 hover:bg-cream transition-colors">Next →</button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsers;
