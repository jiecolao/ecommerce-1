import { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { RefreshCw, Check, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { emailAuth } from '../../lib/auth';
import { EMAIL_OTP_LENGTH, updateEmailOtp } from '../../lib/email-otp';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState(() => Array<string>(EMAIL_OTP_LENGTH).fill(''));
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const email = typeof location.state?.email === 'string' ? location.state.email : '';
  const displayEmail = email || "your email address";

  const subtitle = email ? (
    <>If confirmation is required, enter the {EMAIL_OTP_LENGTH}-digit code from <span className="font-bold text-white">{displayEmail}</span> here without clicking the email link.</>
  ) : (
    "Return to registration to request an email verification code."
  );

  const handleChange = (index: number, value: string) => {
    const result = updateEmailOtp(otp, index, value);
    if (!result) return;
    setOtp(result.digits);
    if (value) inputRefs.current[result.focus]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await emailAuth.verifySignup(email, otp.join(''));
      navigate('/login?verified=success');
    } catch (error) { setErrorMsg(error instanceof Error ? error.message : 'Unable to verify your email.'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setLoading(true);
    setErrorMsg(null);
    setResent(false);
    try {
      await emailAuth.resendSignup(email);
      setOtp(Array<string>(EMAIL_OTP_LENGTH).fill(''));
      setResent(true);
    } catch (error) { setErrorMsg(error instanceof Error ? error.message : 'Unable to request another code.'); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Enter verification code" subtitle={subtitle}>
      {errorMsg && <div role="alert" className="mb-5 flex gap-3 border border-[#743440] bg-[#3a1a23] p-4 text-xs leading-5 text-[#ff8c98]"><Info className="h-4 w-4 shrink-0 text-[#ff8c98]" />{errorMsg}</div>}
      <div className="text-center">
        <div className="mb-8 flex justify-center gap-1 sm:gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              disabled={loading}
              inputMode="numeric"
              aria-label={`Verification code digit ${index + 1} of ${EMAIL_OTP_LENGTH}`}
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={EMAIL_OTP_LENGTH}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onPaste={(e) => { e.preventDefault(); handleChange(index, e.clipboardData.getData('text').trim()); }}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-12 w-10 min-w-0 sm:h-14 sm:w-12 border border-[#5b4767] bg-[#1c191f] text-center font-display text-xl sm:text-2xl font-black text-white focus:border-[#f4b72b] focus:outline-none transition-colors"
            />
          ))}
        </div>
        
        <button 
          onClick={handleVerify} 
          disabled={loading || !email || !otp.every(d => d !== '')}
          className="font-display mt-2 flex h-12 w-full items-center justify-center gap-2 bg-[#f4b72b] text-[10px] font-black uppercase text-[#171419] transition-transform hover:-translate-y-0.5 hover:bg-[#ffd45e] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 shadow-[4px_4px_0_#2c0c46]"
        >
          <Check className="h-4 w-4" /> {loading ? 'Please wait...' : 'Verify code'}
        </button>
        
        <button 
          onClick={handleResend}
          disabled={loading || !email}
          className="font-display mt-4 flex h-11 w-full items-center justify-center gap-2 border border-[#5b4767] bg-[#211d23] text-[9px] font-bold uppercase text-[#b9adc4] transition-colors hover:border-[#f4b72b] hover:text-white"
        >
          <RefreshCw className="h-4 w-4" /> Resend code
        </button>
        
        {resent && <p className="mt-4 text-xs font-bold text-[#f4b72b]">If confirmation is required, check your inbox for another code.</p>}
      </div>
    </AuthLayout>
  );
}
