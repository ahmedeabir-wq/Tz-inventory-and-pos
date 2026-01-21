import React, { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProduct } from '../services/dbService';
import { Product } from '../types';
import { Plus, Search, Edit2, Save, X } from 'lucide-react';
import { CURRENCY } from '../constants';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    price: '',
    stock: '',
    category: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      barcode: product.barcode,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category
    });
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData({ name: '', barcode: '', price: '', stock: '', category: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      barcode: formData.barcode,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await addProduct(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Error saving product. Ensure barcode is unique.");
      console.error(err);
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode.includes(search)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500">Manage your products and stock levels</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-accent text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or barcode..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Barcode</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">Stock</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">Loading inventory...</td></tr>
              ) : filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{product.barcode}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                        {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{CURRENCY}{product.price.toFixed(2)}</td>
                  <td className={`px-6 py-4 text-right font-medium ${product.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                        onClick={() => handleEdit(product)}
                        className="text-gray-400 hover:text-accent transition-colors"
                    >
                        <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input required className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-accent" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                    <input required className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-accent" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input required className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-accent" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input type="number" step="0.01" required className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-accent" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input type="number" required className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-accent" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold mt-4 hover:bg-gray-800 transition-colors flex justify-center gap-2">
                <Save size={20} /> Save Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;