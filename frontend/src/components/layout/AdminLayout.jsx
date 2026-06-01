import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiHome, FiGrid, FiPackage, FiUsers, FiTag, FiLayers, FiSettings, FiLogOut } from 'react-icons/fi';
import { performLogout } from '../../redux/slices/authSlice';
import { BRAND } from '../../utils/constants';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  if (!user || user.role?.toUpperCase() !== 'ADMIN') {
    return <div className="p-10 text-center">Unauthorized Access</div>;
  }

  const handleLogout = async () => {
    await dispatch(performLogout());
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: FiHome },
    { label: 'Products', path: '/admin/products', icon: FiGrid },
    { label: 'Orders', path: '/admin/orders', icon: FiPackage },
    { label: 'Users', path: '/admin/users', icon: FiUsers },
    { label: 'Coupons', path: '/admin/coupons', icon: FiTag },
    { label: 'Categories', path: '/admin/categories', icon: FiLayers },
    { label: 'Settings', path: '/admin/settings', icon: FiSettings },
  ];

  return (
    <div className="flex h-screen bg-cream">
      {/* Sidebar */}
      <aside className="w-64 bg-forest text-cream flex flex-col transition-all">
        <div className="p-6">
          <Link to="/" className="block">
            <h2 className="font-heading text-2xl font-bold text-gold">{BRAND.name}</h2>
            <p className="text-[10px] tracking-widest text-olive uppercase mt-1">Admin Panel</p>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm font-medium transition-colors ${
                  isActive ? 'bg-gold text-forest' : 'text-cream/70 hover:bg-white/5 hover:text-gold'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-body text-sm font-medium text-red-400 hover:bg-white/5 transition-colors"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gold/10 flex items-center justify-between px-8">
          <h1 className="font-heading text-xl font-semibold text-forest capitalize">
            {location.pathname.split('/').pop() || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-olive font-body hover:text-gold transition-colors">View Store</Link>
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-forest font-bold font-body text-xs">
              A
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-cream/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
