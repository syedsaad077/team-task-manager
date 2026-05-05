import { useContext, useEffect, useState, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Dark mode state
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
      // Polling every 30 seconds for new notifications
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside to close dropdown
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

  return (
    <div className="flex h-screen bg-background dark:bg-slate-900 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-colors duration-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary dark:text-indigo-400">Team Task</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link to="/" className="block px-4 py-2 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-primary-light/10 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-indigo-400 transition-colors">
            Dashboard
          </Link>
          <Link to="/projects" className="block px-4 py-2 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-primary-light/10 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-indigo-400 transition-colors">
            Projects
          </Link>
          <Link to="/tasks" className="block px-4 py-2 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-primary-light/10 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-indigo-400 transition-colors">
            Tasks
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shadow-sm transition-colors duration-200">
          <div className="text-xl font-semibold text-slate-800 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}!
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

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
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700 font-semibold text-slate-800 dark:text-white flex justify-between items-center">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-primary/10 text-primary dark:bg-indigo-900/50 dark:text-indigo-400 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
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

            <div className="w-8 h-8 bg-primary dark:bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button 
              onClick={logout}
              className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-indigo-400 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background dark:bg-slate-900 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
