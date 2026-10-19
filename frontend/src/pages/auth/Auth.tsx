import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../lib/api';
import { authSession, useAuthSession } from '../../lib/auth';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'buyer' | 'admin'>('buyer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [authStatus, setAuthStatus] = useState<string>('Checking status...');
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const session = useAuthSession();

  useEffect(() => {
    // Never trust a token or a verification claim merely because it is in a URL.
    const hashParams = new URLSearchParams(location.hash.substring(1));
    if (hashParams.has('access_token') || hashParams.has('refresh_token') || hashParams.has('error')) {
      window.history.replaceState(null, '', `${location.pathname}${location.search}`);
      setAuthStatus('Please sign in with your email and password to continue.');
      return;
    }
    setAuthStatus(session.loading ? 'Checking status...' : session.user ? `Logged in as ${session.user.role}` : 'Not logged in');
  }, [location, session]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!isLogin) {
        await axios.post(`${API_URL}/auth/signup`, {
          email,
          password,
          role,
          firstName,
          lastName
        });
        alert('Signup initiated. Please check your email for the verification link if SMTP is configured, otherwise you might need to auto-confirm.');
        setAuthStatus('Signup complete. Waiting for verification.');
      } else {
        const res = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        });
        
        const user = await authSession.adopt(res.data?.session);
        setAuthStatus(`Logged in successfully as ${user.role}`);
        
        navigate('/');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await authSession.logout();
      setAuthStatus(result.serverConfirmed ? 'Logged out' : 'Signed out on this browser. Server sign-out could not be confirmed.');
      setVerifiedEmail(null);
    } catch {
      setAuthStatus('Sign out could not be completed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-xl p-8 space-y-6 bg-gray-800 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-blue-400">Auth Hub & Role Simulation</h2>
        
        {/* Status Section */}
        <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Current Status</h3>
          <p className="text-sm text-gray-300">Status: <span className="font-bold text-blue-400">{authStatus}</span></p>
          {verifiedEmail && (
            <p className="text-sm text-green-400 mt-1">✓ {verifiedEmail}</p>
          )}
          
          <div className="mt-4 flex gap-2">
            <button 
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded transition"
            >
              Simulate Logout
            </button>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleAuth}>
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400">Simulate Role (Admin / Customer)</label>
            <select
              className="w-full px-4 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={role}
              onChange={(e) => setRole(e.target.value as 'buyer' | 'admin')}
            >
              <option value="buyer">Customer (Buyer)</option>
              <option value="admin">Admin (Seller)</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Select which role you want to authenticate as for this simulation.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In as Selected Role' : 'Sign Up as Selected Role'}
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full px-4 py-2 font-semibold text-white transition bg-gray-600 rounded-lg hover:bg-gray-700"
            >
              {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

