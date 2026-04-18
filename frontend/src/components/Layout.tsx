import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  PlusCircle, 
  User 
} from 'lucide-react';
import { clsx } from 'clsx';

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: PlusCircle, label: 'Create Document', path: '/dashboard/documents/create' },
    { icon: User, label: 'Company Profile', path: '/dashboard/profile' },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-72 flex flex-col shadow-2xl z-20" style={{ backgroundColor: '#714B67' }}>
        <div className="p-8 border-b border-white/10 flex justify-center">
           <Link to="/dashboard" className="bg-white p-2 rounded-xl shadow-xl w-full flex justify-center">
              <img src="/logo.png" alt="AI Office" className="h-10 object-contain" />
           </Link>
        </div>
        <nav className="flex-1 p-6 space-y-3 mt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 group",
                  isActive 
                    ? "bg-white text-primary shadow-xl shadow-black/20 font-black scale-105" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon size={isActive ? 24 : 22} style={isActive ? { color: '#714B67' } : {}} />
                <span className="text-lg tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full p-4 flex items-center justify-center space-x-3 bg-red-500/10 hover:bg-red-500 text-red-200 hover:text-white rounded-2xl transition-all duration-300 border border-red-500/20 font-bold"
          >
            <LogOut size={20} />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/30">
        <header className="bg-white border-b border-gray-100 p-8 flex justify-between items-center px-12 shadow-sm z-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Welcome, <span style={{ color: '#714B67' }}>{user?.name}</span>
            </h2>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">
              Your document command center
            </p>
          </div>
          
          <div className="flex items-center space-x-6 bg-gray-50 p-3 rounded-3xl border border-gray-100">
            <div className="text-right hidden sm:block px-2">
              <p className="text-sm font-black text-gray-900 leading-none">{user?.email}</p>
              <p className="text-xs font-bold uppercase tracking-tighter mt-1" style={{ color: '#714B67' }}>
                {user?.role} Account
              </p>
            </div>
            <div 
              className="w-14 h-14 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg"
              style={{ backgroundColor: '#714B67' }}
            >
              {user?.name?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
