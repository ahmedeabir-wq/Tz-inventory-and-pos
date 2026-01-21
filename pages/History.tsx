import React, { useEffect, useState } from 'react';
import { getTransactions } from '../services/dbService';
import { Transaction } from '../types';
import { CURRENCY } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar, CreditCard, Banknote } from 'lucide-react';

const History: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions().then(data => {
      setTransactions(data);
      setLoading(false);
    });
  }, []);

  // Prepare Chart Data (Sales by Date)
  const chartData = React.useMemo(() => {
    const grouped: Record<string, number> = {};
    transactions.forEach(t => {
      const date = new Date(t.created_at).toLocaleDateString();
      grouped[date] = (grouped[date] || 0) + t.total_amount;
    });
    return Object.entries(grouped)
        .map(([date, total]) => ({ date, total }))
        .slice(-7); // Last 7 days
  }, [transactions]);

  const totalSales = transactions.reduce((sum, t) => sum + t.total_amount, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
        <p className="text-gray-500">Overview of your store's performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium uppercase">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{CURRENCY}{totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium uppercase">Total Transactions</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{transactions.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium uppercase">Avg. Ticket</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
                {transactions.length ? `${CURRENCY}${(totalSales / transactions.length).toFixed(2)}` : `${CURRENCY}0.00`}
            </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-80">
        <h3 className="font-bold text-gray-800 mb-6">Revenue (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
            <YAxis tickLine={false} axisLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(value) => `${CURRENCY}${value}`} />
            <Tooltip 
                cursor={{fill: '#F3F4F6'}} 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
            />
            <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Method</th>
                        <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={4} className="p-8 text-center">Loading...</td></tr>
                    ) : transactions.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-mono text-xs text-gray-500">#{t.id.slice(0,8)}</td>
                            <td className="px-6 py-4 flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                {new Date(t.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${t.payment_method === 'card' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                    {t.payment_method === 'card' ? <CreditCard size={12}/> : <Banknote size={12}/>}
                                    {t.payment_method.toUpperCase()}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-gray-900">{CURRENCY}{t.total_amount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default History;