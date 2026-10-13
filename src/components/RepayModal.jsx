import { useState, useEffect } from 'react';
import axios from 'axios';

export default function RepayModal({ loanId, isOpen, onClose, onRepaymentSuccess }) {
  const [loan, setLoan] = useState(null);
  const [history, setHistory] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [alert, setAlert] = useState({ type: '', text: '' });

  // Fetch Loan Details & Repayment History whenever modal opens
  const fetchData = async () => {
    if (!loanId || !isOpen) return;
    setFetching(true);
    setAlert({ type: '', text: '' });

    try {
      const [loanRes, historyRes] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/loans/${loanId}`),
        axios.get(`http://127.0.0.1:8000/repayments/history/${loanId}`)
      ]);

      setLoan(loanRes.data);
      setHistory(historyRes.data);
      
      // Default amount field to monthly installment or remaining balance
      if (loanRes.data) {
        const defaultPay = Math.min(
          loanRes.data.monthly_installment || loanRes.data.remaining_balance,
          loanRes.data.remaining_balance
        );
        setAmount(defaultPay > 0 ? defaultPay.toString() : '');
      }
    } catch (err) {
      console.error('Error loading loan details:', err);
      setAlert({ type: 'error', text: 'Failed to load loan details from server.' });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [loanId, isOpen]);

  // Handle Manual Repayment Submission
  const handleManualRepay = async (e) => {
    e.preventDefault();
    setAlert({ type: '', text: '' });

    const payAmount = parseFloat(amount);
    if (!payAmount || payAmount <= 0) {
      setAlert({ type: 'error', text: 'Please enter a valid payment amount.' });
      return;
    }

    if (loan && payAmount > loan.remaining_balance) {
      setAlert({ type: 'error', text: `Amount exceeds remaining balance of ₦${loan.remaining_balance.toLocaleString('en-NG')}` });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        loan_id: loanId,
        amount: payAmount
      };

      const res = await axios.post('http://127.0.0.1:8000/repayments/manual', payload);

      setAlert({
        type: 'success',
        text: `Repayment successful! ₦${payAmount.toLocaleString('en-NG')} deducted from your wallet.`
      });

      // Refresh data to show updated balance and history log
      fetchData();

      // Trigger callback if parent dashboard needs to update overall state
      if (onRepaymentSuccess) {
        onRepaymentSuccess(res.data);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        text: err.response?.data?.detail || 'Repayment failed. Please check your wallet balance.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-gray-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Loan Repayment</h3>
            <p className="text-xs text-gray-500">Loan #{loanId}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Feedback Alert */}
        {alert.text && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold border ${
            alert.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {alert.text}
          </div>
        )}

        {fetching ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-400 font-medium">Fetching loan status...</p>
          </div>
        ) : (
          <>
            {/* Loan Status & Auto-Deduction Info */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Remaining Balance</p>
                <p className="text-2xl font-black text-gray-900 mt-1">
                  ₦{loan?.remaining_balance ? loan.remaining_balance.toLocaleString('en-NG') : '0.00'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Next Auto-Deduction</p>
                <p className="text-sm font-bold text-gray-800 mt-2">
                  {loan?.next_payment_due ? new Date(loan.next_payment_due).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Manual Repayment Form */}
            {loan?.remaining_balance > 0 ? (
              <form onSubmit={handleManualRepay} className="space-y-3 pt-1">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Pay Now from Wallet (₦)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 border p-3 rounded-xl text-sm font-bold focus:outline-blue-600"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl shadow text-xs transition disabled:bg-gray-300"
                  >
                    {loading ? 'Processing...' : 'Make Repayment'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                <p className="text-xs font-bold text-green-700">🎉 This loan has been fully repaid!</p>
              </div>
            )}

            {/* Deduction History Logs */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">Repayment History</h4>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No previous repayments found.</p>
                ) : (
                  history.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center p-3 border rounded-xl text-xs bg-white shadow-2xs">
                      <div>
                        <p className="font-semibold text-gray-800">{tx.narration}</p>
                        <p className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleString()}</p>
                      </div>
                      <span className={`font-bold ${
                        tx.status === 'SUCCESSFUL' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.status === 'SUCCESSFUL' ? `-₦${tx.amount_deducted.toLocaleString('en-NG')}` : 'FAILED'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}