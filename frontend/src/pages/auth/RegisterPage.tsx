import { useState } from 'react';
import { Eye, EyeOff, Gamepad2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const navigate = useNavigate();
  const mismatch = confirmation.length > 0 && password !== confirmation;

  return (
    <AuthLayout title="Create your account" subtitle="Save your wishlist and keep every purchased key in one place.">
      <form onSubmit={(event) => { event.preventDefault(); if (!mismatch) navigate('/verify-email', { state: { email } }); }} className="grid gap-5 sm:grid-cols-2">
        <label className="block font-display text-[9px] font-bold uppercase text-[#b9adc4]">First name<input required placeholder="John" className="mt-2 h-12 w-full border border-[#5b4767] bg-[#1c191f] px-4 font-sans text-sm normal-case text-white outline-none focus:border-[#f4b72b]" /></label>
        <label className="block font-display text-[9px] font-bold uppercase text-[#b9adc4]">Last name<input required placeholder="Doe" className="mt-2 h-12 w-full border border-[#5b4767] bg-[#1c191f] px-4 font-sans text-sm normal-case text-white outline-none focus:border-[#f4b72b]" /></label>
        <label className="block font-display text-[9px] font-bold uppercase text-[#b9adc4] sm:col-span-2">Email address<input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@domain.com" className="mt-2 h-12 w-full border border-[#5b4767] bg-[#1c191f] px-4 font-sans text-sm normal-case text-white outline-none focus:border-[#f4b72b]" /></label>
        <label className="block font-display text-[9px] font-bold uppercase text-[#b9adc4] sm:col-span-2">Password<span className="relative mt-2 block"><input required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} className="h-12 w-full border border-[#5b4767] bg-[#1c191f] px-4 pr-12 font-sans text-sm normal-case text-white outline-none focus:border-[#f4b72b]" /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-[#a99bb5]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
        <label className="block font-display text-[9px] font-bold uppercase text-[#b9adc4] sm:col-span-2">Confirm password<input required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} type="password" className={`mt-2 h-12 w-full border bg-[#1c191f] px-4 font-sans text-sm normal-case text-white outline-none ${mismatch ? 'border-[#ff6f7d]' : 'border-[#5b4767] focus:border-[#f4b72b]'}`} />{mismatch && <span className="mt-2 block font-sans text-xs normal-case text-[#ff8c98]">Passwords do not match.</span>}</label>
        <label className="flex items-start gap-3 text-xs leading-5 text-[#a99bb5] sm:col-span-2"><input required type="checkbox" className="mt-0.5 h-4 w-4 accent-[#f4b72b]" /> I agree to the Terms of Service and Privacy Policy.</label>
        <button disabled={mismatch} className="font-display h-12 w-full bg-[#f4b72b] text-[10px] font-black uppercase text-[#171419] hover:bg-[#ffd45e] disabled:opacity-40 sm:col-span-2">Create account</button>
      </form>
      <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-[#49345d]" /><span className="font-display text-[8px] font-bold uppercase text-[#8f8398]">Or sign up with</span><span className="h-px flex-1 bg-[#49345d]" /></div>
      <div className="grid grid-cols-2 gap-3"><button className="flex h-11 items-center justify-center gap-2 border border-[#5b4767] bg-[#211d23] text-sm font-bold text-white hover:border-[#f4b72b]"><strong className="text-[#f4b72b]">G</strong> Google</button><button className="flex h-11 items-center justify-center gap-2 border border-[#5b4767] bg-[#211d23] text-sm font-bold text-white hover:border-[#f4b72b]"><Gamepad2 className="h-4 w-4 text-[#f4b72b]" /> Steam</button></div>
      <p className="mt-6 text-center text-sm text-[#a99bb5]">Already have an account? <Link to="/login" className="font-bold text-white hover:text-[#f4b72b]">Log in</Link></p>
    </AuthLayout>
  );
}
