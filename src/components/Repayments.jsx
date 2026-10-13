import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoanRepayment() {
  const [activeLoan, setActiveLoan] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchActiveLoan();
  }, []);

  const fetchActiveLoan = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch('http://127.0.0.1:8000/loans/my-active-loan', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveLoan(data);
        setRepayAmount(data.remaining_balance);
      } else {
        setActiveLoan(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRepayment = async (e) => {
    e.preventDefault();
    if (!activeLoan) return;

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/repayments/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          loan_id: activeLoan.id,
          amount: parseFloat(repayAmount),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: `Repayment of ₦${parseFloat(repayAmount).toLocaleString()} successful!`,
        });
        fetchActiveLoan();
      } else {
        setStatusMessage({ type: 'error', text: data.detail || 'Repayment failed.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Network error.' });
    } finally {
      setLoading(false);
    }
  };

  if (!activeLoan) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 text-sm">
        No active loans requiring repayment at this time.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b">
        <CreditCard className="w-5 h-5 text-emerald-600" />
        <h3 className="font-bold text-slate-900">Loan Repayment</h3>
      </div>

      {statusMessage.text && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="p-4 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
        <div><span className="font-semibold">Loan Reference:</span> #{activeLoan.id}</div>
        <div><span className="font-semibold">Principal:</span> ₦{activeLoan.principal?.toLocaleString()}</div>
        <div><span className="font-semibold">Remaining Balance:</span> <span className="text-emerald-700 font-bold">₦{activeLoan.remaining_balance?.toLocaleString()}</span></div>
      </div>

      <form onSubmit={handleRepayment} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Repayment Amount (₦)</label>
          <div className="relative">
            <Banknote className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              required
              max={activeLoan.remaining_balance}
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? 'Processing Repayment...' : 'Confirm Repayment'}
        </button>
      </form>
    </div>
  );
}