import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      isActive 
        ? 'bg-accent text-white shadow-lg shadow-blue-500/30' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            NovaPOS
          </h1>
          <p className="text-xs text-gray-500 mt-1">Inventory Management</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavLink to="/" className={navClass}>
            <ShoppingCart size={20} />
            <span className="font-medium">Point of Sale</span>
          </NavLink>
          <NavLink to="/inventory" className={navClass}>
            <Package size={20} />
            <span className="font-medium">Inventory</span>
          </NavLink>
          <NavLink to="/history" className={navClass}>
            <BarChart3 size={20} />
            <span className="font-medium">Sales History</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;