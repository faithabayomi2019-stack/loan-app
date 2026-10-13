import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/customers/')
      .then((response) => {
        setCustomers(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching customers:', err);
        setError('Failed to load customers from backend.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
      <p className="text-sm text-gray-500 mt-1">Manage and view registered client accounts.</p>

      {loading && (
        <div className="mt-8 text-center text-gray-500">Loading customer data...</div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {!loading && !error && customers.length === 0 && (
        <p className="mt-6 text-gray-600">No customers found.</p>
      )}

      {!loading && !error && customers.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-bold text-gray-900">
                {customer.first_name} {customer.last_name}
              </h2>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p><span className="font-semibold text-gray-700">Phone:</span> {customer.phone || 'N/A'}</p>
                <p><span className="font-semibold text-gray-700">Email:</span> {customer.email || 'N/A'}</p>
                <p><span className="font-semibold text-gray-700">Account No:</span> {customer.account_number || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}