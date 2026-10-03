import { useState } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email address and we will send you a link to reset your password.">
      {sent ? (
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center bg-[#f4b72b] text-[#171419] shadow-[5px_5px_0_#2c0c46]"><CheckCircle2 className="h-7 w-7" /></span>
          <h2 className="font-display mt-7 text-lg font-black uppercase text-white">Check your inbox</h2>
          <p className="mt-3 text-sm leading-6 text-[#a99bb5]">A mock reset link was sent to <strong className="text-white">{email}</strong>.</p>
          <Link to="/reset-password" className="font-display mt-7 inline-flex h-11 items-center bg-[#f4b72b] px-6 text-[9px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]">Open reset page</Link>
        </div>
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
          <label className="block font-display text-[9px] font-bold uppercase text-[#b9adc4]">Email address<span className="relative mt-2 block"><Mail className="absolute left-4 top-4 h-4 w-4 text-[#f4b72b]" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@domain.com" className="h-12 w-full border border-[#5b4767] bg-[#1c191f] pl-11 pr-4 font-sans text-sm normal-case text-white outline-none placeholder:text-[#756b7b] focus:border-[#f4b72b]" /></span></label>
          <button className="font-display mt-6 h-12 w-full bg-[#f4b72b] text-[10px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]">Send reset link</button>
        </form>
      )}
      <p className="mt-7 text-center text-sm text-[#a99bb5]">Remember your password? <Link to="/login" className="font-bold text-white hover:text-[#f4b72b]">Back to login</Link></p>
    </AuthLayout>
  );
}
