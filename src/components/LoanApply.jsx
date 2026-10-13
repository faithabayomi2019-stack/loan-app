import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoanApply({ onLoanApplied }) {
  const navigate = useNavigate();

  // Form State
  const [amount, setAmount] = useState('');
  const [tenure, setTenure] = useState('1'); // months
  const [reason, setReason] = useState('Personal Use');

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', text: '' });

  // Simple Interest Calculation Preview (e.g., 5% monthly rate)
  const monthlyRate = 0.05;
  const loanAmountNum = parseFloat(amount) || 0;
  const totalInterest = loanAmountNum * monthlyRate * parseInt(tenure, 10);
  const totalRepayable = loanAmountNum + totalInterest;
  const monthlyRepayment = tenure > 0 ? totalRepayable / parseInt(tenure, 10) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', text: '' });

    if (loanAmountNum < 5000) {
      setAlert({ type: 'error', text: 'Minimum loan amount is ₦5,000' });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const payload = {
        amount: loanAmountNum,
        tenure_months: parseInt(tenure, 10),
        reason: reason,
      };

      // Endpoint: adjust URL if your backend uses a different path (e.g. /loans/apply)
      const res = await axios.post('http://127.0.0.1:8000/loans/apply', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlert({
        type: 'success',
        text: res.data.message || 'Loan application submitted & disbursed successfully!',
      });

      // Trigger loan refresh on parent dashboard if available
      if (onLoanApplied) onLoanApplied();

      // Redirect back to dashboard after 2 seconds
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setAlert({
        type: 'error',
        text:
          err.response?.data?.detail ||
          'Failed to submit loan request. Please check your active loan status.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Apply for a Loan</h1>
          <p className="text-xs text-gray-400">Get instant approval directly to your wallet</p>
        </div>
        <Link
          to="/"
          className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition border border-blue-100"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {alert.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium border ${
            alert.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {alert.text}
        </div>
      )}

      {/* Main Loan Application Form */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Requested Amount */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Loan Amount (₦)
            </label>
            <input
              type="number"
              min="5000"
              max="500000"
              step="1000"
              required
              placeholder="e.g. 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold text-lg text-gray-900"
            />
            <p className="text-[11px] text-gray-400 mt-1">Min: ₦5,000 | Max: ₦500,000</p>
          </div>

          {/* Tenure Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Repayment Period
              </label>
              <select
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                className="w-full border p-3.5 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium text-xs"
              >
                <option value="1">1 Month (5% Interest)</option>
                <option value="2">2 Months (10% Interest)</option>
                <option value="3">3 Months (15% Interest)</option>
                <option value="6">6 Months (30% Interest)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Reason for Loan
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border p-3.5 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium text-xs"
              >
                <option value="Personal Use">Personal Use</option>
                <option value="Business Expansion">Business Expansion</option>
                <option value="Emergency / Medical">Emergency / Medical</option>
                <option value="Bill Payment">Bill Payment</option>
              </select>
            </div>
          </div>

          {/* Real-time Calculation Breakdown Box */}
          {loanAmountNum > 0 && (
            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Repayment Breakdown Preview
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800 pt-3">
                <div>
                  <p className="text-slate-400">Principal Amount:</p>
                  <p className="font-bold">₦{loanAmountNum.toLocaleString('en-NG')}</p>
                </div>
                <div>
                  <p className="text-slate-400">Total Interest (5%/mo):</p>
                  <p className="font-bold text-emerald-400">
                    +₦{totalInterest.toLocaleString('en-NG')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Monthly Repayment:</p>
                  <p className="font-bold">₦{monthlyRepayment.toLocaleString('en-NG')}/mo</p>
                </div>
                <div>
                  <p className="text-slate-400">Total Due Amount:</p>
                  <p className="font-black text-sm text-blue-200">
                    ₦{totalRepayable.toLocaleString('en-NG')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || loanAmountNum < 5000}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-4 rounded-xl shadow-md transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing Application...' : 'Submit Loan Request'}
          </button>
        </form>
      </div>
    </div>
  );
}