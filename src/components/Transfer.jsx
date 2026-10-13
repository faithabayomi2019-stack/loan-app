import React, { useState, useEffect } from 'react';
import { Send, Building2, User, Banknote, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function TransferPage() {
  const [banks, setBanks] = useState([]);
  const [formData, setFormData] = useState({
    bank_code: '',
    recipient_account: '',
    amount: '',
    narration: '',
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Load supported banks list
  useEffect(() => {
    fetch('http://127.0.0.1:8000/banks')
      .then((res) => res.json())
      .then((data) => {
        setBanks(data);
        if (data.length > 0) setFormData((prev) => ({ ...prev, bank_code: data[0].code }));
      })
      .catch((err) => console.error('Failed to load banks:', err));
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Authorization required. Please log in.' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/transactions/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bank_code: formData.bank_code,
          recipient_account: formData.recipient_account,
          amount: parseFloat(formData.amount),
          narration: formData.narration || 'Transfer',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage({
          type: 'success',
          text: `Transfer of ₦${parseFloat(formData.amount).toLocaleString()} successful! Ref: ${data.reference}`,
        });
        setFormData((prev) => ({ ...prev, recipient_account: '', amount: '', narration: '' }));
      } else {
        setStatusMessage({ type: 'error', text: data.detail || 'Transfer failed.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Network error. Ensure backend server is active.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
      <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Send Money / Transfer</h2>

      {statusMessage.text && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleTransfer} className="space-y-4">
        {/* Destination Bank Select */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Select Destination Bank</label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={formData.bank_code}
              onChange={(e) => setFormData({ ...formData, bank_code: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
            >
              {banks.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Account Number */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Account Number</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. 0123456789 or ACC-A1B2C3D4"
              value={formData.recipient_account}
              onChange={(e) => setFormData({ ...formData, recipient_account: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Amount (₦)</label>
          <div className="relative">
            <Banknote className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              required
              min="100"
              placeholder="e.g. 5000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Narration */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Narration (Optional)</label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. For supplies"
              value={formData.narration}
              onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Sending...' : 'Confirm & Send Transfer'}
        </button>
      </form>
    </div>
  );
}