import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import PosScreen from './pages/PosScreen';
import Inventory from './pages/Inventory';
import History from './pages/History';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
              <Route index element={<PosScreen />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="history" element={<History />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;