import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Building, Calendar, Users, CreditCard, FileText, Settings, LogOut, Menu, X, BarChart3, PenTool as Tool, Package, Briefcase, HelpCircle, Bell, Search, ChevronDown, ChevronRight, User, Sun, Moon } from 'lucide-react';
import Badge from '../ui/Badge';
import { useAuthStore } from '../../store/authStore';

interface ERPNavigationProps {
  children: React.ReactNode;
}

const ERPNavigation: React.FC<ERPNavigationProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();

      setTimeout(() => {
        navigate('/connexion', { replace: true });
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Erreur déconnexion:', error);

      navigate('/connexion', { replace: true });
      window.location.reload();
    }
  };

  const navigation = [
    { name: 'Tableau de bord', href: '/erp', icon: LayoutDashboard },
    { name: 'Espaces', href: '/erp/spaces', icon: Building },
    { name: 'Réservations', href: '/erp/reservations', icon: Calendar },
    { name: 'Membres', href: '/erp/members', icon: Users },
    { name: 'Finances', href: '/erp/finances', icon: CreditCard, 
      submenu: [
        { name: 'Factures', href: '/erp/finances/invoices' },
        { name: 'Paiements', href: '/erp/finances/payments' },
        { name: 'Dépenses', href: '/erp/finances/expenses' }
      ]
    },
    { name: 'Maintenance', href: '/erp/maintenance', icon: Tool },
    { name: 'Inventaire', href: '/erp/inventory', icon: Package },
    { name: 'Rapports', href: '/erp/reports', icon: BarChart3 },
    { name: 'Paramètres', href: '/erp/settings', icon: Settings }
  ];

  const isActive = (path: string) => {
    if (path === '/erp') {
      return location.pathname === '/erp';
    }
    return location.pathname.startsWith(path);
  };

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${darkMode ? 'dark' : ''}`}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <Link to="/erp" className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="COFFICE ERP"
                className="h-10"
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isSubmenuOpen = openSubmenu === item.name;
              
              return (
                <div key={item.name}>
                  {hasSubmenu ? (
                    <div>
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className={`
                          flex items-center justify-between w-full px-4 py-3 rounded-xl font-medium transition-all duration-200
                          ${active
                            ? 'bg-accent text-white shadow-lg dark:bg-accent/80'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-accent'
                          }
                        `}
                      >
                        <div className="flex items-center">
                          <Icon className="w-5 h-5 mr-3" />
                          {item.name}
                        </div>
                        {isSubmenuOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      
                      {isSubmenuOpen && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.submenu!.map(subitem => (
                            <Link
                              key={subitem.name}
                              to={subitem.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`
                                flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200
                                ${location.pathname === subitem.href
                                  ? 'bg-accent/10 text-accent dark:bg-accent/20'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-accent'
                                }
                              `}
                            >
                              <span className="w-1 h-1 bg-gray-400 dark:bg-gray-600 rounded-full mr-2"></span>
                              {subitem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200
                        ${active
                          ? 'bg-accent text-white shadow-lg dark:bg-accent/80'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-accent'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-teal rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  AD
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  Admin Coffice
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@coffice.dz</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent text-white mt-1">
                  Admin
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 mr-2" />
                ) : (
                  <Moon className="w-4 h-4 mr-2" />
                )}
                {darkMode ? 'Mode clair' : 'Mode sombre'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>

              <div className="ml-4 relative">
                <div className="flex items-center">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative">
                <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <HelpCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-accent to-teal rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    AD
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ERPNavigation;