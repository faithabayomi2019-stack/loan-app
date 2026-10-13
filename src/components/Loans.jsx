import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/loans/')
      .then((response) => {
        setLoans(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching loans:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Loans</h1>
          <p className="text-sm text-gray-500 mt-1">Track active loan applications and approvals.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
          + New Loan
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading loans...</p>}

      {!loading && loans.length === 0 && (
        <div className="p-6 bg-white rounded-lg border text-center text-gray-500">
          No loan records available at this time.
        </div>
      )}

      {!loading && loans.length > 0 && (
        <div className="space-y-4">
          {loans.map((loan) => (
            <div
              key={loan.id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-gray-800 text-lg">
                  {loan.loan_type || 'Personal Loan'}
                </h3>
                <p className="text-sm text-gray-500">
                  Customer ID: #{loan.customer || loan.customer_id}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Term: {loan.tenure || '12'} Months
                </p>
              </div>

              <div className="text-right">
                <span className="text-xl font-bold text-gray-900 block">
                  ${loan.amount ? Number(loan.amount).toLocaleString() : '0'}
                </span>
                <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                  {loan.status || 'Active'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}