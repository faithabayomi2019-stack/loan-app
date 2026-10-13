 import { useState } from 'react';

export default function Savings() {
  const [plans] = useState([
    { id: 1, name: 'Emergency Vault', target: 5000, current: 3200, yield: '8.5% p.a.' },
    { id: 2, name: 'Business Growth', target: 20000, current: 11500, yield: '12% p.a.' },
  ]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Savings & Investments</h1>
          <p className="text-sm text-gray-500 mt-1">High-yield savings plans and target deposits.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
          + Start Target Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const progress = Math.min(100, Math.round((plan.current / plan.target) * 100));
          return (
            <div key={plan.id} className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{plan.name}</h3>
                  <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">
                    Yield: {plan.yield}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-500">{progress}%</p>
              </div>

              <div className="w-full bg-gray-100 h-2.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${progress}%` }}></div>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mt-3">
                <span>Saved: ${plan.current.toLocaleString()}</span>
                <span>Goal: ${plan.target.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}