import { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { Mail, Check, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedData = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(index + pastedData.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    if (otp.every(digit => digit !== '')) {
      navigate('/reset-password');
    }
  };

  const subtitle = sent ? (
    <>We sent a 6-digit code to <span className="font-bold text-white">{email}</span>.</>
  ) : (
    "Enter your email address and we will send you a 6-digit code to reset your password."
  );

  return (
    <AuthLayout title={sent ? "Enter verification code" : "Forgot password?"} subtitle={subtitle}>
      {sent ? (
        <div className="text-center">
          <div className="mb-8 flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="h-12 w-10 sm:h-14 sm:w-12 border border-[#5b4767] bg-[#1c191f] text-center font-display text-xl sm:text-2xl font-black text-white focus:border-[#f4b72b] focus:outline-none transition-colors"
              />
            ))}
          </div>
          
          <button 
            onClick={handleVerify} 
            disabled={!otp.every(d => d !== '')} 
            className="font-display mt-2 flex h-12 w-full items-center justify-center gap-2 bg-[#f4b72b] text-[10px] font-black uppercase text-[#171419] transition-transform hover:-translate-y-0.5 hover:bg-[#ffd45e] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 shadow-[4px_4px_0_#2c0c46]"
          >
            <Check className="h-4 w-4" /> Verify code
          </button>
          
          <button 
            onClick={() => setResent(true)} 
            className="font-display mt-4 flex h-11 w-full items-center justify-center gap-2 border border-[#5b4767] bg-[#211d23] text-[9px] font-bold uppercase text-[#b9adc4] transition-colors hover:border-[#f4b72b] hover:text-white"
          >
            <RefreshCw className="h-4 w-4" /> Resend code
          </button>
          
          {resent && <p className="mt-4 text-xs font-bold text-[#f4b72b]">Code resent locally.</p>}
        </div>
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
          <label className="block font-display text-[9px] font-bold uppercase text-[#b9adc4]">
            Email address
            <span className="relative mt-2 block">
              <Mail className="absolute left-4 top-4 h-4 w-4 text-[#f4b72b]" />
              <input 
                required 
                type="email" 
                value={email} 
                onChange={(event) => setEmail(event.target.value)} 
                placeholder="email@domain.com" 
                className="h-12 w-full border border-[#5b4767] bg-[#1c191f] pl-11 pr-4 font-sans text-sm normal-case text-white outline-none placeholder:text-[#756b7b] focus:border-[#f4b72b]" 
              />
            </span>
          </label>
          <button className="font-display mt-6 h-12 w-full bg-[#f4b72b] text-[10px] font-black uppercase text-[#171419] transition-transform hover:-translate-y-0.5 hover:bg-[#ffd45e] shadow-[4px_4px_0_#2c0c46]">
            Send reset code
          </button>
        </form>
      )}
      <p className="mt-7 text-center text-sm text-[#a99bb5]">Remember your password? <Link to="/login" className="font-bold text-white hover:text-[#f4b72b]">Back to login</Link></p>
    </AuthLayout>
  );
}
