import { useState } from 'react';
import { MailCheck, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';

export default function VerifyEmailPage() {
  const [resent, setResent] = useState(false);
  const navigate = useNavigate();

  return (
    <AuthLayout title="Verify your email" subtitle="We sent a verification link to your email address.">
      <div className="text-center">
        <span className="mx-auto grid h-18 w-18 place-items-center bg-[#f4b72b] text-[#171419] shadow-[5px_5px_0_#2c0c46]"><MailCheck className="h-8 w-8" /></span>
        <p className="mt-7 text-sm leading-6 text-[#a99bb5]">For this frontend prototype, use the button below to simulate opening the verification link.</p>
        <button onClick={() => navigate('/login?verified=success')} className="font-display mt-6 h-12 w-full bg-[#f4b72b] text-[10px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]">Verify email</button>
        <button onClick={() => setResent(true)} className="font-display mt-3 flex h-11 w-full items-center justify-center gap-2 border border-[#5b4767] bg-[#211d23] text-[9px] font-bold uppercase text-white hover:border-[#f4b72b]"><RefreshCw className="h-4 w-4" /> Resend verification email</button>
        {resent && <p className="mt-4 text-xs font-bold text-[#f4b72b]">Verification email resent locally.</p>}
      </div>
    </AuthLayout>
  );
}
