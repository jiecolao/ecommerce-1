import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { toast } from '../../lib/toast';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const mismatch = confirmation.length > 0 && password !== confirmation;

  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password for your MystiKeys account.">
      <form onSubmit={(event) => {
        event.preventDefault();
        if (!mismatch) {
          toast.warning('Password reset endpoint is not implemented on the backend.');
          navigate('/login?reset=success');
        }
      }} className="space-y-5">
        <label className="block font-display text-[9px] font-bold uppercase text-[#b9adc4]">New password<span className="relative mt-2 block"><input required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} className="h-12 w-full border border-[#5b4767] bg-[#1c191f] px-4 pr-12 font-sans text-sm normal-case text-white outline-none focus:border-[#f4b72b]" /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-[#a99bb5] hover:text-[#f4b72b]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
        <label className="block font-display text-[9px] font-bold uppercase text-[#b9adc4]">Confirm new password<input required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} type="password" className={`mt-2 h-12 w-full border bg-[#1c191f] px-4 font-sans text-sm normal-case text-white outline-none ${mismatch ? 'border-[#ff6f7d]' : 'border-[#5b4767] focus:border-[#f4b72b]'}`} />{mismatch && <span className="mt-2 block font-sans text-xs normal-case text-[#ff8c98]">Passwords do not match.</span>}</label>
        <button disabled={mismatch} className="font-display h-12 w-full bg-[#f4b72b] text-[10px] font-black uppercase text-[#171419] hover:bg-[#ffd45e] disabled:opacity-40">Reset password</button>
      </form>
      <p className="mt-7 text-center text-sm text-[#a99bb5]">Remember your password? <Link to="/login" className="font-bold text-white hover:text-[#f4b72b]">Back to login</Link></p>
    </AuthLayout>
  );
}
