import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Smartphone, Receipt, History, ArrowRightLeft } from 'lucide-react';

export default function Wallet() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(250000.00);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/wallet/')
      .then(res => setTransactions(res.data))
      .catch(err => console.error('Error fetching wallet activity:', err));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Wallet</h1>
        <p className="text-sm text-gray-500 mt-1">Manage liquid balance and recent deposits/withdrawals.</p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
        <p className="text-xs uppercase tracking-wider opacity-80">Available Balance</p>
        <h2 className="text-4xl font-black mt-2">₦{balance.toLocaleString('en-NG')}</h2>
        <div className="mt-6 flex gap-3">
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-gray-100">
            + Top Up
          </button>
          <button className="bg-blue-500/40 text-white border border-white/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-500/60">
            Withdraw
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION (Wired up to your pages) */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/transfer')}
            className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition text-left flex flex-col gap-2"
          >
            <div className="p-2.5 bg-blue-100 text-blue-600 w-fit rounded-lg"><ArrowRightLeft className="w-5 h-5" /></div>
            <span className="font-semibold text-sm text-gray-800">Transfer</span>
          </button>

          <button 
            onClick={() => navigate('/bills')}
            className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 transition text-left flex flex-col gap-2"
          >
            <div className="p-2.5 bg-purple-100 text-purple-600 w-fit rounded-lg"><Smartphone className="w-5 h-5" /></div>
            <span className="font-semibold text-sm text-gray-800">Airtime & Bills</span>
          </button>

          <button 
            onClick={() => navigate('/bills')}
            className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 transition text-left flex flex-col gap-2"
          >
            <div className="p-2.5 bg-emerald-100 text-emerald-600 w-fit rounded-lg"><Receipt className="w-5 h-5" /></div>
            <span className="font-semibold text-sm text-gray-800">Utilities</span>
          </button>

          <button 
            onClick={() => navigate('/history')}
            className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-amber-50 hover:border-amber-200 transition text-left flex flex-col gap-2"
          >
            <div className="p-2.5 bg-amber-100 text-amber-600 w-fit rounded-lg"><History className="w-5 h-5" /></div>
            <span className="font-semibold text-sm text-gray-800">History</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Transaction History</h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500">No wallet transactions recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, idx) => (
              <div key={idx} className="flex justify-between items-center border-b pb-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-800">{tx.description || 'Transaction'}</p>
                  <p className="text-xs text-gray-400">{tx.date || 'Recent'}</p>
                </div>
                <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                  {tx.type === 'credit' ? '+' : '-'}₦{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}