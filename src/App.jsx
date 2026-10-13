import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import Auth from './components/Auth';
import RepayModal from './components/RepayModal';
import LoanApply from './components/LoanApply';
import Transfer from './components/Transfer';

function Dashboard({ accountNumber, handleLogout, activeLoan, loadingLoan, setIsModalOpen }) {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyAccount = () => {
    if (accountNumber) {
      navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Navbar */}
      <header className="flex justify-between items-center bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
            AC
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Welcome back 👋</h1>
            <p className="text-xs text-gray-400 font-medium">Personal Account</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition border border-red-100"
        >
          Sign Out
        </button>
      </header>

      {/* Main Wallet Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-blue-200 uppercase tracking-widest font-semibold">Wallet Balance</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-blue-300 hover:text-white text-xs bg-white/10 px-2 py-0.5 rounded-full transition"
              >
                {showBalance ? '🙈 Hide' : '👁️ Show'}
              </button>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              {showBalance ? '₦ 250,000.00' : '₦ • • • • •'}
            </h2>
          </div>

          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-3 py-1 rounded-full">
            ● Active Wallet
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-4 gap-2 text-xs text-blue-100">
          <div className="flex items-center space-x-2">
            <span>Account Number:</span>
            <span className="font-mono font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg">
              {accountNumber || 'ACC-000000'}
            </span>
            <button
              onClick={handleCopyAccount}
              className="text-[11px] bg-blue-500/30 hover:bg-blue-500/50 px-2.5 py-1 rounded-lg transition font-medium text-white"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <span className="text-blue-300/80 text-[11px]">Tier 3 Verified Account</span>
        </div>
      </div>

      {/* 4-Column Quick Action Grid */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/transfer"
            className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center text-center space-y-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Transfer</p>
              <p className="text-[10px] text-gray-400">Send money</p>
            </div>
          </Link>

          <Link
            to="/apply-loan"
            className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center text-center space-y-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Apply Loan</p>
              <p className="text-[10px] text-gray-400">Get instant cash</p>
            </div>
          </Link>

          <div className="bg-white/60 p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-2 opacity-60 cursor-not-allowed">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Airtime & Bills</p>
              <p className="text-[10px] text-gray-400">Coming Soon</p>
            </div>
          </div>

          <div className="bg-white/60 p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-2 opacity-60 cursor-not-allowed">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">History</p>
              <p className="text-[10px] text-gray-400">Activity Log</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Overview Section */}
      <main className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Active Loan Account</h2>
            <p className="text-xs text-gray-400">Manage your loan repayments and automated deduction schedules</p>
          </div>

          {activeLoan && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition"
            >
              Manage / Repay Loan
            </button>
          )}
        </div>

        {loadingLoan ? (
          <div className="p-8 text-center text-xs text-gray-400 animate-pulse">
            Checking active loan records...
          </div>
        ) : activeLoan ? (
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-6 rounded-2xl space-y-3 shadow-md">
            <div className="flex justify-between items-center">
              <p className="text-xs text-blue-200 font-bold uppercase tracking-wider">
                Loan Ref: #{activeLoan.id}
              </p>
              <span className="bg-blue-500/30 text-blue-100 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border border-blue-400/20">
                {activeLoan.status}
              </span>
            </div>
            <h3 className="text-3xl font-black">
              ₦{activeLoan.remaining_balance?.toLocaleString('en-NG') || '0.00'}
            </h3>
            <p className="text-xs text-blue-200 pt-1">
              Next scheduled auto-deduction:{' '}
              <span className="font-bold text-white">
                {new Date(activeLoan.next_payment_due).toLocaleDateString()}
              </span>
            </p>
          </div>
        ) : (
          <div className="p-6 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white rounded-2xl border border-blue-100/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                Credit Pre-Approved
              </span>
              <h4 className="text-sm font-bold text-gray-800">You are eligible for up to ₦250,000</h4>
              <p className="text-xs text-gray-500 max-w-md">
                Get instant credit disbursement directly into your wallet with flexible monthly repayment rates.
              </p>
            </div>
            <Link
              to="/apply-loan"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition whitespace-nowrap"
            >
              Request Loan Now
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [accountNumber, setAccountNumber] = useState(localStorage.getItem('account_number'));
  const [activeLoan, setActiveLoan] = useState(null);
  const [loadingLoan, setLoadingLoan] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchActiveLoan = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return;

    setLoadingLoan(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/loans/my-active-loan', {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });
      setActiveLoan(response.data);
    } catch (err) {
      setActiveLoan(null);
    } finally {
      setLoadingLoan(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchActiveLoan();
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('account_number');
    setToken(null);
    setAccountNumber(null);
    setActiveLoan(null);
  };

  const handleLoginSuccess = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('account_number', data.account_number);
    setToken(data.token);
    setAccountNumber(data.account_number);
  };

  if (!token) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50/60 text-gray-800 p-4 sm:p-6 md:p-8">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                accountNumber={accountNumber}
                handleLogout={handleLogout}
                activeLoan={activeLoan}
                loadingLoan={loadingLoan}
                setIsModalOpen={setIsModalOpen}
              />
            }
          />
          <Route path="/apply-loan" element={<LoanApply onLoanApplied={fetchActiveLoan} />} />
          <Route path="/transfer" element={<Transfer />} />
        </Routes>

        {activeLoan && (
          <RepayModal
            loanId={activeLoan.id}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onRepaymentSuccess={fetchActiveLoan}
          />
        )}
      </div>
    </Router>
  );
}