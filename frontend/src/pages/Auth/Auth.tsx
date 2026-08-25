import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../lib/api';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'admin'>('buyer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent, type: 'login' | 'signup') => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (type === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
              first_name: firstName,
              last_name: lastName,
            }
          }
        });
        
        if (error) throw error;
        
        // Custom backend API call to map user to our Admin/Buyer tables
        if (data.user) {
           await axios.post(`${API_URL}/auth/sync`, {
             role,
             firstName,
             lastName
           }, {
             headers: {
               'Authorization': `Bearer ${data.session?.access_token}`
             }
           });
        }
        alert('Check your email for the login link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-blue-400">Welcome to GameKeys</h2>
        
        <form className="space-y-4" onSubmit={(e) => handleAuth(e, 'login')}>
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
              {loading ? 'Loading...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={(e) => handleAuth(e, 'signup')}
              disabled={loading}
              className="w-full px-4 py-2 font-semibold text-white transition bg-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

