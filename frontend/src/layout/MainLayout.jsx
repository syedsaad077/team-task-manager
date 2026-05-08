import { useContext, useEffect, useState, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const res = await API.get('/notifications');
          setNotifications(res.data);
        } catch (error) {
          console.error('Failed to fetch notifications', error);
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/projects', label: 'Projects', icon: '📁' },
    { to: '/tasks', label: 'Tasks', icon: '✅' },
  ];

  return (
    <div className="flex h-screen bg-background dark:bg-slate-900 transition-colors duration-200 overflow-hidden">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 
        flex flex-col transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary dark:text-indigo-400">Team Task</h1>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xl"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                ${location.pathname === to 
                  ? 'bg-primary/10 text-primary dark:bg-indigo-900/40 dark:text-indigo-400' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary dark:bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 shadow-sm transition-colors duration-200 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger menu - mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white truncate">
              Welcome back, {user?.name?.split(' ')[0]}!
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors relative"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-700 font-semibold text-slate-800 dark:text-white flex justify-between items-center">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-primary/10 text-primary dark:bg-indigo-900/50 dark:text-indigo-400 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">No notifications</div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                          className={`p-3 border-b border-slate-50 dark:border-slate-700/50 cursor-pointer transition-colors ${notif.read ? 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50' : 'bg-blue-50/50 dark:bg-indigo-900/20 hover:bg-blue-50 dark:hover:bg-indigo-900/30'}`}
                        >
                          <p className={`text-sm ${notif.read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-800 dark:text-slate-100 font-medium'}`}>
                            {notif.message}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout - text on desktop, icon on mobile */}
            <button 
              onClick={logout}
              className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-indigo-400 transition-colors"
            >
              Logout
            </button>
            <button 
              onClick={logout}
              className="sm:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
              title="Logout"
            >
              🚪
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background dark:bg-slate-900 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
