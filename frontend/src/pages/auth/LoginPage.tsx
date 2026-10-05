import { useState } from 'react';
import { Eye, EyeOff, Gamepad2, Info } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import api, { API_URL, setStoredAuth } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resetComplete = searchParams.get('reset') === 'success';
  const verified = searchParams.get('verified') === 'success';

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.post('/auth/login', { email, password });
      const session = res.data?.session;
      const user = res.data?.user;
      const token = session?.access_token || 'mock_token';
      
      const role = user?.user_metadata?.role || (email.toLowerCase().includes('admin') ? 'admin' : 'buyer');
      setStoredAuth(token, {
        id: user?.id || (role === 'admin' ? '22222222-2222-2222-2222-222222222222' : '11111111-1111-1111-1111-111111111111'),
        email: user?.email || email,
        role,
        firstName: user?.user_metadata?.first_name || '',
        lastName: user?.user_metadata?.last_name || '',
      });

      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/login/google`;
  };

  const handleSteamLogin = () => {
    window.location.href = `${API_URL}/auth/login/steam`;
  };

  return (
    <AuthLayout title="Welcome to MystiKeys" subtitle="Log in to access your digital keys, wishlist, and purchase history.">
      {(resetComplete || verified) && <div className="mb-5 flex gap-3 border border-[#5b4767] bg-[#2b183c] p-4 text-xs leading-5 text-[#d8cedd]"><Info className="h-4 w-4 shrink-0 text-[#f4b72b]" />{resetComplete ? 'Password reset complete. Log in with your new credentials.' : 'Email verified. Your account is ready to use.'}</div>}
      {errorMsg && <div className="mb-5 flex gap-3 border border-[#743440] bg-[#3a1a23] p-4 text-xs leading-5 text-[#ff8c98]"><Info className="h-4 w-4 shrink-0 text-[#ff8c98]" />{errorMsg}</div>}
      <form onSubmit={handleLogin} className="space-y-5">
        <label className="block font-display text-[9px] font-bold uppercase text-[#b9adc4]">Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" className="mt-2 h-12 w-full border border-[#5b4767] bg-[#1c191f] px-4 font-sans text-sm normal-case text-white outline-none placeholder:text-[#756b7b] focus:border-[#f4b72b]" /></label>
        <label className="block font-display text-[9px] font-bold uppercase text-[#b9adc4]">Password<span className="relative mt-2 block"><input required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="h-12 w-full border border-[#5b4767] bg-[#1c191f] px-4 pr-12 font-sans text-sm normal-case text-white outline-none placeholder:text-[#756b7b] focus:border-[#f4b72b]" /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-[#a99bb5] hover:text-[#f4b72b]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
        <div className="flex items-center justify-between gap-4 text-sm"><label className="flex items-center gap-2 text-[#b9adc4]"><input type="checkbox" className="h-4 w-4 accent-[#f4b72b]" /> Remember me</label><Link to="/forgot-password" className="font-bold text-white hover:text-[#f4b72b]">Forgot password?</Link></div>
        <button disabled={loading} className="font-display h-12 w-full bg-[#f4b72b] text-[10px] font-black uppercase text-[#171419] hover:bg-[#ffd45e] disabled:opacity-50">{loading ? 'Logging in...' : 'Log in'}</button>
      </form>

      <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-[#49345d]" /><span className="font-display text-[8px] font-bold uppercase text-[#8f8398]">Or</span><span className="h-px flex-1 bg-[#49345d]" /></div>
      <div className="grid grid-cols-2 gap-3"><button type="button" onClick={handleGoogleLogin} className="flex h-11 items-center justify-center gap-2 border border-[#5b4767] bg-[#211d23] text-sm font-bold text-white hover:border-[#f4b72b]"><strong className="text-[#f4b72b]">G</strong> Google</button><button type="button" onClick={handleSteamLogin} className="flex h-11 items-center justify-center gap-2 border border-[#5b4767] bg-[#211d23] text-sm font-bold text-white hover:border-[#f4b72b]"><Gamepad2 className="h-4 w-4 text-[#f4b72b]" /> Steam</button></div>
      <div className="mt-6 flex gap-3 bg-[#211d23] p-4 text-xs leading-5 text-[#a99bb5]"><Info className="h-4 w-4 shrink-0 text-[#f4b72b]" /> Buying without an account? Continue as a guest at checkout; keys are sent directly to your email.</div>
      <p className="mt-6 text-center text-sm text-[#a99bb5]">Don't have an account? <Link to="/register" className="font-bold text-white hover:text-[#f4b72b]">Create an account</Link></p>
    </AuthLayout>
  );
}
