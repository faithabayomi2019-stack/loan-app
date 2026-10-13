import { useNavigate } from 'react-router-dom';

// Inside your component function:
const navigate = useNavigate();

// Replace the "Coming Soon" card with this:
<div 
  onClick={() => navigate('/bills')}
  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-purple-500 transition"
>
  <div className="p-3 bg-purple-50 w-fit rounded-lg text-purple-600 mb-3">📱</div>
  <h3 className="font-semibold text-slate-900">Airtime & Bills</h3>
  <p className="text-xs text-slate-500 mt-0.5">Pay utility bills & airtime</p>
</div>