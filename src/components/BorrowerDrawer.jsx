import React from 'react';
import { X, User, ShieldCheck, Clock, FileText } from 'lucide-react';

export default function BorrowerDrawer({ isOpen, onClose, loan, onOpenRepay }) {
  if (!isOpen || !loan) return null;

  const formatNaira = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto p-6 animate-in slide-in-from-right duration-200">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                {loan.borrower.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{loan.borrower}</h3>
                <p className="text-xs text-slate-400 font-mono">{loan.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Details Card */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Original Loan Amount</span>
                <span className="font-bold text-slate-800">{formatNaira(loan.amount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Remaining Balance</span>
                <span className="font-bold text-emerald-600">{formatNaira(loan.balance)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Est. Monthly Installment</span>
                <span className="font-semibold text-slate-700">{formatNaira(loan.monthly_repayment || 0)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 border border-slate-200/80 rounded-xl">
                <span className="text-slate-400 block mb-1">Interest Rate</span>
                <span className="font-bold text-slate-800">{loan.interest_rate}% p.a.</span>
              </div>
              <div className="p-3 border border-slate-200/80 rounded-xl">
                <span className="text-slate-400 block mb-1">Tenure</span>
                <span className="font-bold text-slate-800">{loan.tenure_months} Months</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
          <button 
            onClick={() => { onClose(); onOpenRepay(loan); }}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            Log Repayment
          </button>
        </div>
      </div>
    </div>
  );
}