import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, User, LogOut, PlusCircle, Users, BookOpen, UserCog, Search, HelpCircle, Command, Bell, X } from 'lucide-react';
import { clsx } from 'clsx';
import Logo from './Logo';
import GlobalSearch from './GlobalSearch';

const BRAND = '#714B67';
const NOTIF_KEY = 'docuflow_notifications';

interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  docId?: string;
  read: boolean;
}

const loadNotifications = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveNotifications = (notifs: AppNotification[]) => {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
};

const Layout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(loadNotifications);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        navigate('/dashboard/documents/create');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('docuflow:save'));
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    const pathMatch = location.pathname.match(/^\/dashboard\/documents\/([^/]+)$/);
    if (!pathMatch) return;
    const docId = pathMatch[1];
    if (!docId || docId === 'create') return;

    const checkESign = async () => {
      try {
        const existing = loadNotifications();
        const alreadyNotified = existing.some(n => n.docId === docId && n.title.includes('E-Signature'));
        if (alreadyNotified) return;

        const { default: api } = await import('../services/api');
        const res = await api.get(`/documents/${docId}`);
        const doc = res.data;
        if (doc?.eSignature) {
          const newNotif: AppNotification = {
            id: `esign-${docId}-${Date.now()}`,
            title: 'E-Signature Received',
            body: `"${doc.title || 'Document'}" was signed by ${doc.eSignature.signerName || 'a recipient'}.`,
            timestamp: Date.now(),
            docId,
            read: false,
          };
          setNotifications(prev => {
            const already = prev.some(n => n.docId === docId && n.title.includes('E-Signature'));
            if (already) return prev;
            const updated = [newNotif, ...prev];
            saveNotifications(updated);
            return updated;
          });
        }
      } catch {
      }
    };

    checkESign();
  }, [location.pathname]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const badgeLabel = unreadCount > 9 ? '9+' : unreadCount > 0 ? String(unreadCount) : null;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
    setBellOpen(false);
  };

  const handleBellOpen = () => {
    setBellOpen(v => !v);
    if (!bellOpen) {
      setTimeout(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }, 400);
    }
  };

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
      <aside className="w-56 flex flex-col shadow-lg z-20 shrink-0" style={{ backgroundColor: BRAND }}>
        <div className="px-4 py-4 border-b border-white/10">
          <Link to="/dashboard">
            <Logo size="sm" onDark />
          </Link>
        </div>

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

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = (() => {
              if (location.pathname === item.path) return true;
              if (item.path === '/dashboard') return false;
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
                  style={isActive ? { color: BRAND } : {}}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div>
            <p className="text-xs font-medium text-gray-400">
              Welcome back,{' '}
              <span className="font-semibold" style={{ color: BRAND }}>{user?.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
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

            <div className="relative" ref={bellRef}>
              <button
                onClick={handleBellOpen}
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                title="Notifications"
              >
                <Bell size={18} />
                {badgeLabel && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] flex items-center justify-center text-white text-[9px] font-black rounded-full px-1 leading-none"
                    style={{ backgroundColor: BRAND }}
                  >
                    {badgeLabel}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="text-xs font-black text-gray-800 uppercase tracking-wider">Notifications</span>
                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAll}
                          className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider"
                        >
                          Clear all
                        </button>
                      )}
                      <button onClick={() => setBellOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell size={24} className="mx-auto text-gray-200 mb-2" />
                        <p className="text-xs text-gray-400 font-medium">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${!notif.read ? 'bg-purple-50/30' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800 leading-tight">{notif.title}</p>
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{notif.body}</p>
                              <p className="text-[10px] text-gray-300 mt-1">
                                {new Date(notif.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                              </p>
                            </div>
                            {notif.docId && (
                              <Link
                                to={`/dashboard/documents/${notif.docId}`}
                                onClick={() => setBellOpen(false)}
                                className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg border transition-all hover:text-white"
                                style={{ borderColor: BRAND, color: BRAND }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = BRAND; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = BRAND; }}
                              >
                                View
                              </Link>
                            )}
                          </div>
                          {!notif.read && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full mt-1" style={{ backgroundColor: BRAND }} />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-700 leading-none">{user?.email}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider mt-0.5" style={{ color: BRAND }}>
                  {user?.role}
                </p>
              </div>
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white text-xs shadow-sm"
                style={{ backgroundColor: BRAND }}
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

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default Layout;
