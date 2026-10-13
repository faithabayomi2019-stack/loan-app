import { useState } from 'react';

export default function Bills() {
  const [billerType, setBillerType] = useState('ELECTRICITY');
  const [provider, setProvider] = useState('IKEDC');
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const token = localStorage.getItem('access_token'); // Or wherever your login token is saved

    try {
      const response = await fetch('http://localhost:8000/transactions/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          biller_type: billerType,
          provider: provider,
          customer_id: customerId,
          amount: parseFloat(amount)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Payment failed');
      }

      setMessage(`Success! Ref: ${data.reference}. New Balance: $${data.new_balance}`);
      setCustomerId('');
      setAmount('');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Bill Payments</h1>
        <p className="text-sm text-gray-500 mt-1">Pay utility bills, internet subscriptions, and services directly.</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <form onSubmit={handlePay} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Select Service</label>
            <select 
              value={billerType} 
              onChange={(e) => setBillerType(e.target.value)}
              className="w-full p-2.5 border rounded-lg text-sm bg-white"
            >
              <option value="ELECTRICITY">Electricity Utility</option>
              <option value="WATER">Water Supply</option>
              <option value="INTERNET">Broadband Internet</option>
              <option value="CABLE">Cable TV</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Provider Name</label>
            <input
              type="text"
              placeholder="e.g. IKEDC, DSTV"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full p-2.5 border rounded-lg text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Customer / Meter / Smartcard ID</label>
            <input
              type="text"
              placeholder="e.g. 104928301"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full p-2.5 border rounded-lg text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Amount ($)</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2.5 border rounded-lg text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Process Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}