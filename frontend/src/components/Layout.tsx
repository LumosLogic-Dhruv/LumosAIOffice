import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, User, LogOut, PlusCircle, Users, BookOpen, UserCog, Search, HelpCircle, Command } from 'lucide-react';
import { clsx } from 'clsx';
import Logo from './Logo';
import GlobalSearch from './GlobalSearch';

const Layout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: PlusCircle, label: 'Create Document', path: '/dashboard/documents/create' },
    { icon: FileText, label: 'My Documents', path: '/dashboard/documents' },
    { icon: Users, label: 'Clients', path: '/dashboard/clients' },
    { icon: BookOpen, label: 'Catalog', path: '/dashboard/catalog' },
    { icon: UserCog, label: 'Team', path: '/dashboard/team' },
    { icon: User, label: 'Company Profile', path: '/dashboard/profile' },
    { icon: HelpCircle, label: 'Help', path: '/dashboard/help' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 flex flex-col shadow-lg z-20 shrink-0" style={{ backgroundColor: '#714B67' }}>
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/10">
          <Link to="/dashboard">
            <Logo size="sm" onDark />
          </Link>
        </div>

        {/* Search hint button */}
        <div className="px-3 pt-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white/70 hover:text-white text-xs font-medium"
          >
            <Search size={13} />
            <span className="flex-1 text-left">Search...</span>
            <span className="flex items-center gap-0.5 opacity-60">
              <Command size={10} />
              <span>K</span>
            </span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = (() => {
              if (location.pathname === item.path) return true;
              if (item.path === '/dashboard') return false;
              // "My Documents" should not be active when on the create page
              if (item.path === '/dashboard/documents') {
                return location.pathname.startsWith('/dashboard/documents/') &&
                  location.pathname !== '/dashboard/documents/create';
              }
              return location.pathname.startsWith(item.path);
            })();
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 text-sm font-medium',
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <item.icon
                  size={16}
                  style={isActive ? { color: '#714B67' } : {}}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div>
            <p className="text-xs font-medium text-gray-400">
              Welcome back,{' '}
              <span className="font-semibold" style={{ color: '#714B67' }}>{user?.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search trigger in top bar */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-all"
            >
              <Search size={12} />
              <span>Search</span>
              <kbd className="flex items-center gap-0.5 px-1 py-0.5 bg-gray-100 rounded text-[10px] font-mono">
                <Command size={9} />K
              </kbd>
            </button>

            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-700 leading-none">{user?.email}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider mt-0.5" style={{ color: '#714B67' }}>
                  {user?.role}
                </p>
              </div>
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white text-xs shadow-sm"
                style={{ backgroundColor: '#714B67' }}
              >
                {user?.name?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default Layout;
