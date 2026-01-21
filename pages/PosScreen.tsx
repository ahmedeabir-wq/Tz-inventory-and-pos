import React, { useEffect, useState, useMemo } from 'react';
import { Search, Scan, Plus, Trash2, CreditCard, Banknote, Package, XCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProducts, createTransaction } from '../services/dbService';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import ScannerModal from '../components/ScannerModal';
import { CURRENCY } from '../constants';
import { supabase } from '../services/supabase';

const PosScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const { cart, addToCart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  // Load products & realtime subscription
  useEffect(() => {
    loadProducts();

    const channel = supabase
      .channel('products_change')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        loadProducts(); // Simple re-fetch on change for consistency
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Barcode Handler
  const handleScan = (code: string) => {
    const product = products.find(p => p.barcode === code);
    if (product) {
      addToCart(product);
      // Optional: Audio beep here
    } else {
      alert(`Product with barcode ${code} not found`);
    }
  };

  useBarcodeScanner(handleScan);

  // Filter Logic
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Checkout Logic
  const handleCheckout = async (method: 'cash' | 'card') => {
    if (cart.length === 0 || !user) return;
    setProcessing(true);
    try {
      await createTransaction(user.id, cart.map(item => ({ product: item, quantity: item.quantity })), method);
      clearCart();
      alert('Transaction Successful!');
    } catch (err: any) {
      console.error(err);
      alert('Transaction Failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col h-full border-r border-gray-200">
        {/* Header */}
        <div className="p-4 bg-white border-b border-gray-200 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search products or barcode..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="bg-gray-900 text-white px-6 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <Scan size={20} />
              Scan
            </button>
          </div>
          
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-accent text-white shadow-md' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-accent transition-all active:scale-95 group"
              >
                <div className="h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-accent transition-colors">
                  <Package size={32} />
                </div>
                <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-500 text-xs">{product.stock} in stock</span>
                  <span className="font-bold text-primary">{CURRENCY}{product.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-96 bg-white flex flex-col h-full shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
          <p className="text-sm text-gray-500">{cart.length} items</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-50">
              <Package size={48} strokeWidth={1} />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-gray-400">
                    <span className="text-xs font-bold">{item.name.substring(0,2).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 text-sm truncate">{item.name}</h4>
                  <div className="text-xs text-gray-500">{CURRENCY}{item.price} x {item.quantity}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-gray-800">{CURRENCY}{(item.price * item.quantity).toFixed(2)}</span>
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-0.5">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-100 rounded"><Plus size={12} className="rotate-45" /></button>
                    <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                    <button onClick={() => addToCart(item, 1)} className="p-1 hover:bg-gray-100 rounded"><Plus size={12} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-4">
          <div className="flex justify-between items-center text-gray-600">
            <span>Subtotal</span>
            <span>{CURRENCY}{cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
            <span>Total</span>
            <span>{CURRENCY}{cartTotal.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={() => handleCheckout('cash')}
                disabled={processing || cart.length === 0}
                className="flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Banknote size={20} />
              Cash
            </button>
            <button 
                onClick={() => handleCheckout('card')}
                disabled={processing || cart.length === 0}
                className="flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <CreditCard size={20} />
              Card
            </button>
          </div>
        </div>
      </div>

      <ScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
      />
    </div>
  );
};

export default PosScreen;