import { useState } from 'react';
import axios from 'axios';

export default function Auth({ onLoginSuccess }) {
  // Views: 'login' | 'register' | 'forgot' | 'reset'
  const [view, setView] = useState('login');

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    resetToken: '',
    newPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const clearAlert = () => setMessage({ type: '', text: '' });

  // Handle Login or Registration
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    clearAlert();
    setLoading(true);

    const isLogin = view === 'login';
    const endpoint = isLogin
      ? 'http://127.0.0.1:8000/auth/login'
      : 'http://127.0.0.1:8000/auth/register';

    // Prepare payload depending on view
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password
        };

    console.log(`Sending ${isLogin ? 'Login' : 'Register'} request to:`, endpoint);
    console.log('Payload data:', payload);

    try {
      const response = await axios.post(endpoint, payload);
      console.log('Server response:', response.data);

      if (isLogin) {
        const { access_token, account_number } = response.data;
        if (access_token) localStorage.setItem('token', access_token);
        if (account_number) localStorage.setItem('account_number', account_number);

        setMessage({ type: 'success', text: 'Login successful!' });

        if (onLoginSuccess) {
          onLoginSuccess({ token: access_token, account_number });
        }
      } else {
        setMessage({
          type: 'success',
          text: 'Account created successfully! You can now switch to "Sign In" and log in.'
        });
        // Automatically switch to login tab after registration
        setView('login');
      }
    } catch (err) {
      console.error('API Error details:', err.response || err);

      // Extract specific backend error message if available
      let errorDetail = 'Authentication failed. Please check your credentials or server status.';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorDetail = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          // If FastAPI returns validation errors
          errorDetail = err.response.data.detail.map((e) => e.msg).join(', ');
        }
      } else if (err.message) {
        errorDetail = err.message;
      }

      setMessage({
        type: 'error',
        text: errorDetail
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Requesting Password Reset Token
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearAlert();
    setLoading(true);

    try {
      const res = await axios.post('http://127.0.0.1:8000/auth/forgot-password', {
        email: formData.email
      });

      if (res.data?.reset_token) {
        setFormData((prev) => ({ ...prev, resetToken: res.data.reset_token }));
        setMessage({
          type: 'success',
          text: 'Reset token generated! Enter your new password below.'
        });
      } else {
        setMessage({ type: 'success', text: res.data?.message || 'Reset link sent to your email.' });
      }
      setView('reset');
    } catch (err) {
      const errorDetail = err.response?.data?.detail || 'Failed to request password reset.';
      setMessage({ type: 'error', text: typeof errorDetail === 'string' ? errorDetail : 'Reset request failed.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Resetting Password with Token
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearAlert();
    setLoading(true);

    try {
      const res = await axios.post('http://127.0.0.1:8000/auth/reset-password', {
        token: formData.resetToken,
        new_password: formData.newPassword
      });

      setMessage({ type: 'success', text: res.data?.message || 'Password reset successful!' });
      setView('login');
    } catch (err) {
      const errorDetail = err.response?.data?.detail || 'Password reset failed. Invalid or expired token.';
      setMessage({ type: 'error', text: typeof errorDetail === 'string' ? errorDetail : 'Reset failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 border border-gray-100">
        
        {/* Navigation Tabs (Only when in login or register) */}
        {(view === 'login' || view === 'register') && (
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setView('login'); clearAlert(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                view === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setView('register'); clearAlert(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                view === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* View Header */}
        <div>
          <h2 className="text-2xl font-black text-gray-900">
            {view === 'login' && 'Welcome back'}
            {view === 'register' && 'Get started'}
            {view === 'forgot' && 'Forgot Password'}
            {view === 'reset' && 'Reset Password'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {view === 'login' && 'Enter your details to access your account'}
            {view === 'register' && 'Fill in the information below to sign up'}
            {view === 'forgot' && 'Enter your registered email to receive a reset token'}
            {view === 'reset' && 'Provide your reset token and new password'}
          </p>
        </div>

        {/* Alert Feedback */}
        {message.text && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold border ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* --- VIEW 1 & 2: LOGIN / REGISTER FORM --- */}
        {(view === 'login' || view === 'register') && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {view === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full border p-3 rounded-xl text-xs font-semibold focus:outline-blue-600"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full border p-3 rounded-xl text-xs font-semibold focus:outline-blue-600"
                    placeholder="Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border p-3 rounded-xl text-xs font-semibold focus:outline-blue-600"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-gray-600 uppercase">Password</label>
                {view === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); clearAlert(); }}
                    className="text-[10px] text-blue-600 font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              
              {/* Password Field with Toggle */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full border p-3 pr-10 rounded-xl text-xs font-semibold focus:outline-blue-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm focus:outline-none"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-xs transition shadow-md disabled:bg-gray-300"
            >
              {loading ? 'Processing...' : view === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        )}

        {/* --- VIEW 3: FORGOT PASSWORD FORM --- */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Registered Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border p-3 rounded-xl text-xs font-semibold focus:outline-blue-600"
                placeholder="user@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-xs transition shadow-md disabled:bg-gray-300"
            >
              {loading ? 'Sending...' : 'Request Reset Token'}
            </button>

            <button
              type="button"
              onClick={() => { setView('login'); clearAlert(); }}
              className="w-full text-xs font-bold text-gray-500 hover:text-gray-700 text-center py-2"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* --- VIEW 4: RESET PASSWORD FORM --- */}
        {view === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Reset Token</label>
              <textarea
                name="resetToken"
                rows={3}
                value={formData.resetToken}
                onChange={handleChange}
                required
                className="w-full border p-3 rounded-xl text-xs font-mono font-semibold focus:outline-blue-600"
                placeholder="Paste your reset token here"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="w-full border p-3 pr-10 rounded-xl text-xs font-semibold focus:outline-blue-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm focus:outline-none"
                >
                  {showNewPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-xs transition shadow-md disabled:bg-gray-300"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => { setView('login'); clearAlert(); }}
              className="w-full text-xs font-bold text-gray-500 hover:text-gray-700 text-center py-2"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

      </div>
    </div>
  );
}