import { useState } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { emailAuth, useRecoverySession } from '../../lib/auth';
import { toast } from '../../lib/toast';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recoveryVerified = useRecoverySession();
  const navigate = useNavigate();
  const mismatch = confirmation.length > 0 && password !== confirmation;

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmation) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await emailAuth.updatePassword(password);
      setPassword('');
      setConfirmation('');
      toast.success('Password updated successfully!');
      navigate('/login?reset=success', { replace: true });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to update your password.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password for your MystiKeys account.">
      {(errorMsg || !recoveryVerified) && <div role="alert" className="mb-5 flex gap-3 border border-[#743440] bg-[#3a1a23] p-4 text-xs leading-5 text-[#ff8c98]"><Info className="h-4 w-4 shrink-0 text-[#ff8c98]" /><span>{errorMsg || 'Verify a password reset code first. Reloading this page requires a new code.'} <Link to="/forgot-password" className="font-bold text-white hover:text-[#f4b72b]">Request a new reset code</Link></span></div>}
      <form onSubmit={handleReset} className="space-y-5">
        <label className="block font-display text-[9px] font-bold uppercase text-[#b9adc4]">New password<span className="relative mt-2 block"><input required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} className="h-12 w-full border border-[#5b4767] bg-[#1c191f] px-4 pr-12 font-sans text-sm normal-case text-white outline-none focus:border-[#f4b72b]" /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-[#a99bb5] hover:text-[#f4b72b]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
        <label className="block font-display text-[9px] font-bold uppercase text-[#b9adc4]">Confirm new password<input required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} type="password" className={`mt-2 h-12 w-full border bg-[#1c191f] px-4 font-sans text-sm normal-case text-white outline-none ${mismatch ? 'border-[#ff6f7d]' : 'border-[#5b4767] focus:border-[#f4b72b]'}`} />{mismatch && <span className="mt-2 block font-sans text-xs normal-case text-[#ff8c98]">Passwords do not match.</span>}</label>
        <button disabled={loading || mismatch || !recoveryVerified} className="font-display h-12 w-full bg-[#f4b72b] text-[10px] font-black uppercase text-[#171419] hover:bg-[#ffd45e] disabled:opacity-40">{loading ? 'Updating...' : 'Reset password'}</button>
      </form>
      <p className="mt-7 text-center text-sm text-[#a99bb5]">Remember your password? <Link to="/login" className="font-bold text-white hover:text-[#f4b72b]">Back to login</Link></p>
    </AuthLayout>
  );
}
