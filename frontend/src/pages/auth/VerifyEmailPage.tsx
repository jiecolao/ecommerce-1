import { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { RefreshCw, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { toast } from '../../lib/toast';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get email from router state, fallback to a placeholder if navigating directly
  const email = location.state?.email;
  
  // If we really want to simulate an email when none is provided (just for visual testing)
  const displayEmail = email || "your email address";

  const subtitle = email ? (
    <>We sent a 6-digit code to <span className="font-bold text-white">{displayEmail}</span>.</>
  ) : (
    "We sent a 6-digit code to your email address."
  );

  const handleChange = (index: number, value: string) => {
    // Handle paste of multiple characters
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

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
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
      toast.info('Simulated email verification: Backend OTP verification endpoint is not implemented.');
      navigate('/login?verified=success');
    }
  };

  return (
    <AuthLayout title="Enter verification code" subtitle={subtitle}>
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
          onClick={() => {
            setResent(true);
            toast.info('Simulated verification code resent locally.');
          }} 
          className="font-display mt-4 flex h-11 w-full items-center justify-center gap-2 border border-[#5b4767] bg-[#211d23] text-[9px] font-bold uppercase text-[#b9adc4] transition-colors hover:border-[#f4b72b] hover:text-white"
        >
          <RefreshCw className="h-4 w-4" /> Resend code
        </button>
        
        {resent && <p className="mt-4 text-xs font-bold text-[#f4b72b]">Code resent locally.</p>}
      </div>
    </AuthLayout>
  );
}
