import { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { Mail, Check, RefreshCw, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { emailAuth } from '../../lib/auth';
import { EMAIL_OTP_LENGTH, updateEmailOtp } from '../../lib/email-otp';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState(() => Array<string>(EMAIL_OTP_LENGTH).fill(''));
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

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
      await emailAuth.verifyRecovery(email, otp.join(''));
      navigate('/reset-password');
    } catch (error) { setErrorMsg(error instanceof Error ? error.message : 'Unable to verify the reset code.'); }
    finally { setLoading(false); }
  };

  const handleRequest = async (resend = false) => {
    setLoading(true);
    setErrorMsg(null);
    setResent(false);
    try {
      await emailAuth.requestRecovery(email);
      setSent(true);
      setResent(resend);
      setOtp(Array<string>(EMAIL_OTP_LENGTH).fill(''));
    } catch (error) { setErrorMsg(error instanceof Error ? error.message : 'Unable to request a reset code.'); }
    finally { setLoading(false); }
  };

  const subtitle = sent ? (
    <>If an account exists for <span className="font-bold text-white">{email}</span>, enter its {EMAIL_OTP_LENGTH}-digit reset code here without clicking the email link.</>
  ) : (
    `Enter your email address and we will send you an ${EMAIL_OTP_LENGTH}-digit code to reset your password.`
  );

  return (
    <AuthLayout title={sent ? "Enter verification code" : "Forgot password?"} subtitle={subtitle}>
      {errorMsg && <div role="alert" className="mb-5 flex gap-3 border border-[#743440] bg-[#3a1a23] p-4 text-xs leading-5 text-[#ff8c98]"><Info className="h-4 w-4 shrink-0 text-[#ff8c98]" />{errorMsg}</div>}
      {sent ? (
        <div className="text-center">
          <div className="mb-8 flex justify-center gap-1 sm:gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                disabled={loading}
                inputMode="numeric"
                aria-label={`Reset code digit ${index + 1} of ${EMAIL_OTP_LENGTH}`}
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
            disabled={loading || !otp.every(d => d !== '')}
            className="font-display mt-2 flex h-12 w-full items-center justify-center gap-2 bg-[#f4b72b] text-[10px] font-black uppercase text-[#171419] transition-transform hover:-translate-y-0.5 hover:bg-[#ffd45e] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 shadow-[4px_4px_0_#2c0c46]"
          >
            <Check className="h-4 w-4" /> {loading ? 'Please wait...' : 'Verify code'}
          </button>
          
          <button 
            onClick={() => { void handleRequest(true); }}
            disabled={loading}
            className="font-display mt-4 flex h-11 w-full items-center justify-center gap-2 border border-[#5b4767] bg-[#211d23] text-[9px] font-bold uppercase text-[#b9adc4] transition-colors hover:border-[#f4b72b] hover:text-white"
          >
            <RefreshCw className="h-4 w-4" /> Resend code
          </button>
          
          {resent && <p className="mt-4 text-xs font-bold text-[#f4b72b]">If the account exists, check its inbox for another reset code.</p>}
        </div>
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); void handleRequest(); }}>
          <label className="block font-display text-[9px] font-bold uppercase text-[#b9adc4]">
            Email address
            <span className="relative mt-2 block">
              <Mail className="absolute left-4 top-4 h-4 w-4 text-[#f4b72b]" />
              <input 
                required 
                type="email" 
                disabled={loading}
                value={email} 
                onChange={(event) => setEmail(event.target.value)} 
                placeholder="email@domain.com" 
                className="h-12 w-full border border-[#5b4767] bg-[#1c191f] pl-11 pr-4 font-sans text-sm normal-case text-white outline-none placeholder:text-[#756b7b] focus:border-[#f4b72b]" 
              />
            </span>
          </label>
          <button disabled={loading} className="font-display mt-6 h-12 w-full bg-[#f4b72b] text-[10px] font-black uppercase text-[#171419] transition-transform hover:-translate-y-0.5 hover:bg-[#ffd45e] shadow-[4px_4px_0_#2c0c46]">
            {loading ? 'Sending...' : 'Send reset code'}
          </button>
        </form>
      )}
      <p className="mt-7 text-center text-sm text-[#a99bb5]">Remember your password? <Link to="/login" className="font-bold text-white hover:text-[#f4b72b]">Back to login</Link></p>
    </AuthLayout>
  );
}
