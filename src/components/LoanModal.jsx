import React, { useState } from 'react';
import { X, Send, CreditCard, Banknote, Calculator, FileText } from 'lucide-react';

export default function LoanModal({ isOpen, onClose, onAddLoan }) {
  const [formData, setFormData] = useState({
    amount: '',
    tenure_months: '12',
    reason: 'Personal Use',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const formatNaira = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

  // Simple interest estimate calculation matching backend (5% per month)
  const calculateEstMonthly = () => {
    const P = parseFloat(formData.amount) || 0;
    const n = parseInt(formData.tenure_months) || 1;
    if (P <= 0) return 0;
    const totalInterest = P * 0.05 * n;
    return (P + totalInterest) / n;
  };

  const estMonthly = calculateEstMonthly();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount) return;

    setErrorMsg('');
    setLoading(true);

    // Get access token saved in localStorage upon login
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');

    if (!token) {
      setErrorMsg('You must be logged in to apply for a loan.');
      setLoading(false);
      return;
    }

    // Payload matching backend's LoanApplicationRequest schema
    const payload = {
      amount: parseFloat(formData.amount),
      tenure_months: parseInt(formData.tenure_months),
      reason: formData.reason || 'Personal Use',
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/loans/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // <--- Fixes 401 Unauthorized
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (onAddLoan) onAddLoan(data);
        setFormData({ amount: '', tenure_months: '12', reason: 'Personal Use' });
        onClose();
      } else {
        setErrorMsg(data.detail || 'Failed to submit loan application.');
      }
    } catch (error) {
      console.error('Error creating loan:', error);
      setErrorMsg('Network error. Check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">New Loan Application</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Loan Amount (₦ NGN)</label>
            <div className="relative">
              <Banknote className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                required
                min="1000"
                placeholder="e.g. 50000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Tenure</label>
              <select
                value={formData.tenure_months}
                onChange={(e) => setFormData({ ...formData, tenure_months: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
              >
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Reason</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Business"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Payment Calculation Preview */}
          {estMonthly > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>Est. Monthly Payment:</span>
              </div>
              <span className="font-bold text-slate-900">{formatNaira(estMonthly)}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}