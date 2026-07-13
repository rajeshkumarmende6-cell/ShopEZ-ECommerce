import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {
  LayoutDashboard,
  Box,
  FolderTree,
  FileCode2,
  Users,
  Store,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Gift
} from 'lucide-react';

function AdminLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Analytics', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Products', path: '/admin/products', icon: <Box size={18} /> },
    { name: 'Categories', path: '/admin/categories', icon: <FolderTree size={18} /> },
    { name: 'Orders', path: '/admin/orders', icon: <FileCode2 size={18} /> },
    { name: 'Promotions', path: '/admin/promotions', icon: <Gift size={18} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={18} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans select-none">
      
      {/* 1. Mobile Header bar */}
      <header className="lg:hidden w-full h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 fixed top-0 left-0 z-40">
        <span className="text-xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">ShopEZ Admin</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-slate-200">
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* 2. Sidebar Navigation */}
      <aside
        className={`w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between fixed lg:sticky top-0 h-screen z-50 transition-transform duration-300 lg:transform-none lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6 pt-6">
          <div className="px-6 flex justify-between items-center">
            <Link to="/" className="text-2xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              ShopEZ
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-200">
              <X size={18} />
            </button>
          </div>

          <div className="px-4 py-2 bg-slate-850/40 border border-slate-800 rounded-xl mx-4 text-center">
            <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">Admin Console</span>
          </div>

          <nav className="px-3 space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-250'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={14} />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-450 hover:text-slate-300 transition"
          >
            <Store size={18} />
            <span>Storefront</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/20 transition cursor-pointer"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Dashboard Content Frame */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0 overflow-y-auto">
        <div className="p-6 sm:p-8 lg:p-10 space-y-8 flex-1">
          {children}
        </div>
      </main>

    </div>
  );
}

export default AdminLayout;
